from pydantic import BaseModel
from typing import Optional

class Period(BaseModel):
    id: str
    name: str
    start_date: str
    end_date: str
    status: str = "open"  # "open", "closed", "locked"
    closed_by: Optional[str] = None
    closed_at: Optional[str] = None
    total_volume: float = 0.0
    bank_records_count: int = 0
    ledger_records_count: int = 0
    match_count: int = 0
    exception_count: int = 0
    accuracy_score: float = 0.0
    summary_notes: Optional[str] = None
