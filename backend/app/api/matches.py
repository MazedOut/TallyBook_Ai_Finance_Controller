import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.models.match import MatchRecord, MatchStatus, ResolvedBy
from app.models.audit import AuditLog
from app.models.user import User
from app.middleware.auth import get_current_user, require_role
from app.repository.memory import repo

router = APIRouter(prefix="/matches", tags=["Matches"])

class OverrideMatchRequest(BaseModel):
    action: str  # "accept", "reject", "reassign"
    reason: str
    target_ledger_id: Optional[str] = None

@router.get("")
async def list_matches(
    run_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    resolved_by: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    if run_id:
        run = repo.get_run(run_id)
        if not run:
            raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
        matches = run.get("matches", [])
    else:
        matches = list(repo.matches.values())

    # Filtering
    filtered = []
    for m in matches:
        m_dict = m if isinstance(m, dict) else m.dict()
        if status and m_dict.get("status") != status:
            continue
        if resolved_by and resolved_by.lower() not in m_dict.get("resolved_by", "").lower():
            continue
        filtered.append(m_dict)

    return filtered

@router.put("/{match_id}/override")
async def override_match(
    match_id: str,
    req: OverrideMatchRequest,
    current_user: User = Depends(require_role(["analyst", "controller", "admin"]))
):
    match = repo.matches.get(match_id)
    if not match:
        raise HTTPException(status_code=404, detail=f"Match record '{match_id}' not found.")

    before_state = match.dict()

    if req.action == "accept":
        new_status = MatchStatus.ACCEPTED
        resolved_by = ResolvedBy.MANUAL_OVERRIDE.value
    elif req.action == "reject":
        new_status = MatchStatus.REJECTED
        resolved_by = ResolvedBy.MANUAL_OVERRIDE.value
    elif req.action == "reassign":
        new_status = MatchStatus.OVERRIDDEN
        resolved_by = ResolvedBy.MANUAL_OVERRIDE.value
        if req.target_ledger_id:
            match.ledger_entry_ids = [req.target_ledger_id]
    else:
        raise HTTPException(status_code=400, detail=f"Invalid override action '{req.action}'.")

    match.status = new_status
    match.resolved_by = resolved_by
    match.override_reason = req.reason
    match.overridden_by = f"{current_user.full_name} ({current_user.role.value})"
    match.overridden_at = datetime.now(timezone.utc).isoformat()
    match.flags.append("manual_override")

    repo.update_match(match_id, match.dict())

    # Log to audit trail
    repo.add_audit_log(
        AuditLog(
            id=f"aud-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            actor_id=current_user.id,
            actor_name=current_user.full_name,
            actor_role=current_user.role.value,
            action=f"MANUAL_OVERRIDE_{req.action.upper()}",
            entity_type="match",
            entity_id=match_id,
            before_state=before_state,
            after_state=match.dict(),
            notes=f"User override applied: {req.reason}"
        )
    )

    return {
        "status": "success",
        "match": match.dict(),
        "audit_message": f"Match {match_id} updated to {new_status.value} by {current_user.full_name}."
    }
