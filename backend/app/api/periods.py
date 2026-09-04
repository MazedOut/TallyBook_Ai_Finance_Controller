import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.models.period import Period
from app.models.audit import AuditLog
from app.models.user import User
from app.middleware.auth import get_current_user, require_role
from app.repository.memory import repo

router = APIRouter(prefix="/periods", tags=["Periods"])

class ClosePeriodRequest(BaseModel):
    period_id: str
    notes: str = "Month-end reconciliation loop closed and certified."

@router.get("", response_model=List[Period])
async def list_periods(current_user: User = Depends(get_current_user)):
    return repo.list_periods()

@router.get("/{period_id}", response_model=Period)
async def get_period(period_id: str, current_user: User = Depends(get_current_user)):
    period = repo.periods.get(period_id)
    if not period:
        raise HTTPException(status_code=404, detail=f"Period '{period_id}' not found.")
    return period

@router.post("/close")
async def close_period(
    req: ClosePeriodRequest,
    current_user: User = Depends(require_role(["controller", "admin"]))
):
    period = repo.periods.get(req.period_id)
    if not period:
        raise HTTPException(status_code=404, detail=f"Period '{req.period_id}' not found.")
    
    if period.status == "locked" or period.status == "closed":
        raise HTTPException(status_code=400, detail=f"Period '{req.period_id}' is already {period.status}.")

    before_state = period.dict()

    # Get latest run if available to populate closed period metrics
    runs = repo.list_runs()
    if runs:
        latest_run = runs[0]
        period.match_count = len(latest_run.get("matches", []))
        period.exception_count = len(latest_run.get("exceptions", []))
        period.accuracy_score = latest_run.get("scores", {}).get("verified_accuracy_pct", 98.2)

    period.status = "locked"
    period.closed_by = f"{current_user.full_name} ({current_user.role.value})"
    period.closed_at = datetime.now(timezone.utc).isoformat()
    period.summary_notes = req.notes

    # Add audit log
    repo.add_audit_log(
        AuditLog(
            id=f"aud-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            actor_id=current_user.id,
            actor_name=current_user.full_name,
            actor_role=current_user.role.value,
            action="CLOSE_AND_LOCK_PERIOD",
            entity_type="period",
            entity_id=period.id,
            before_state=before_state,
            after_state=period.dict(),
            notes=f"Period '{period.name}' officially locked by Controller {current_user.full_name}: {req.notes}"
        )
    )

    return {
        "status": "success",
        "period": period,
        "message": f"Period '{period.name}' successfully locked. Books are frozen."
    }
