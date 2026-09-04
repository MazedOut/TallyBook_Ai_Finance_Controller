from pydantic import BaseModel
from typing import Optional, Dict, Any

class AuditLog(BaseModel):
    id: str
    timestamp: str
    actor_id: str
    actor_name: str
    actor_role: str
    action: str  # "RUN_RECONCILIATION", "OVERRIDE_MATCH", "APPROVE_EXCEPTION", "CLOSE_PERIOD", "CONFIG_CHANGE", "INJECT_TX"
    entity_type: str  # "match", "exception", "period", "system", "run"
    entity_id: str
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
