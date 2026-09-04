from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from app.models.audit import AuditLog
from app.models.user import User
from app.middleware.auth import get_current_user
from app.repository.memory import repo

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLog])
async def get_audit_trail(
    entity_type: Optional[str] = Query(None),
    actor_role: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    logs = repo.list_audit_logs(entity_type=entity_type)
    filtered = []
    for log in logs:
        if actor_role and log.actor_role.lower() != actor_role.lower():
            continue
        if action and action.lower() not in log.action.lower():
            continue
        filtered.append(log)
    return filtered
