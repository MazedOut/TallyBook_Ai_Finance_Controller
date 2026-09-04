import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.models.exception import ExceptionRecord, ExceptionCategory
from app.models.audit import AuditLog
from app.models.user import User
from app.middleware.auth import get_current_user, require_role
from app.repository import repo

router = APIRouter(prefix="/exceptions", tags=["Exceptions"])

class ApproveExceptionRequest(BaseModel):
    action: str = "approve"  # "approve", "write_off", "escalate"
    notes: str
    gl_adjustment_account: Optional[str] = "6050-Bank-Fees-Reconciliation-Loss"

class ReclassifyExceptionRequest(BaseModel):
    category: ExceptionCategory
    reason: str

@router.get("")
async def list_exceptions(
    run_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    if run_id:
        run = repo.get_run(run_id)
        if not run:
            raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
        exceptions = run.get("exceptions", [])
    else:
        exceptions = repo.list_all_exceptions() if hasattr(repo, "list_all_exceptions") else list(repo.exceptions.values())

    filtered = []
    for exc in exceptions:
        exc_dict = exc if isinstance(exc, dict) else exc.dict()
        if category and exc_dict.get("category") != category:
            continue
        if status and exc_dict.get("status") != status:
            continue
        filtered.append(exc_dict)

    return filtered

@router.post("/{exc_id}/approve")
async def approve_exception(
    exc_id: str,
    req: ApproveExceptionRequest,
    current_user: User = Depends(require_role(["controller", "admin"]))
):
    """
    Controller-gated approval for high-value or disputed exceptions.
    Authorizes GL adjustment voucher or write-off and creates an immutable audit entry.
    """
    exc = repo.get_exception(exc_id) if hasattr(repo, "get_exception") else repo.exceptions.get(exc_id)
    if not exc:
        raise HTTPException(status_code=404, detail=f"Exception '{exc_id}' not found.")

    before_state = exc.dict()

    exc.status = "approved" if req.action == "approve" else ("written_off" if req.action == "write_off" else "escalated")
    exc.approved_by = f"{current_user.full_name} ({current_user.role.value})"
    exc.approved_at = datetime.now(timezone.utc).isoformat()
    exc.approval_notes = f"Action: {req.action.upper()} | GL Offset: {req.gl_adjustment_account} | Note: {req.notes}"

    repo.update_exception(exc_id, exc.dict())

    # Log to audit trail
    repo.add_audit_log(
        AuditLog(
            id=f"aud-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            actor_id=current_user.id,
            actor_name=current_user.full_name,
            actor_role=current_user.role.value,
            action=f"EXCEPTION_SIGN_OFF_{req.action.upper()}",
            entity_type="exception",
            entity_id=exc_id,
            before_state=before_state,
            after_state=exc.dict(),
            notes=f"Controller sign-off granted for exception of ${exc.amount:.2f}: {req.notes}"
        )
    )

    return {
        "status": "success",
        "exception": exc.dict(),
        "audit_message": f"Exception {exc_id} marked as {exc.status} by {current_user.full_name}."
    }

@router.post("/{exc_id}/reclassify")
async def reclassify_exception(
    exc_id: str,
    req: ReclassifyExceptionRequest,
    current_user: User = Depends(require_role(["analyst", "controller", "admin"]))
):
    exc = repo.get_exception(exc_id) if hasattr(repo, "get_exception") else repo.exceptions.get(exc_id)
    if not exc:
        raise HTTPException(status_code=404, detail=f"Exception '{exc_id}' not found.")

    before_state = exc.dict()
    exc.category = req.category
    exc.reasoning = f"Reclassified by {current_user.full_name}: {req.reason}"

    repo.update_exception(exc_id, exc.dict())

    repo.add_audit_log(
        AuditLog(
            id=f"aud-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            actor_id=current_user.id,
            actor_name=current_user.full_name,
            actor_role=current_user.role.value,
            action="RECLASSIFY_EXCEPTION",
            entity_type="exception",
            entity_id=exc_id,
            before_state=before_state,
            after_state=exc.dict(),
            notes=f"Exception reclassified to {req.category.value}: {req.reason}"
        )
    )

    return {"status": "success", "exception": exc.dict()}
