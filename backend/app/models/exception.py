from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class ExceptionCategory(str, Enum):
    DUPLICATE_FEE_NOISE = "duplicate_fee_noise"
    NO_COUNTERPART = "no_counterpart"
    AMBIGUOUS_CANDIDATES = "ambiguous_candidates"
    SPLIT_PAYMENT_PARTIAL = "split_payment_partial"
    DATE_LAG_POSSIBLE = "date_lag_possible"
    UNRESOLVED_DISCREPANCY = "unresolved_discrepancy"

class ExceptionRecord(BaseModel):
    id: str
    run_id: str
    source_type: str  # "bank" or "ledger"
    transaction_id: str
    ref_id: Optional[str] = None
    amount: float
    date: str
    description: str
    category: ExceptionCategory
    confidence: float = 0.0
    what_would_resolve: str
    candidate_ids: List[str] = []
    reasoning: str
    status: str = "open"  # "open", "approved", "escalated", "written_off"
    approval_required: bool = False
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    approval_notes: Optional[str] = None
    aging_days: int = 1
