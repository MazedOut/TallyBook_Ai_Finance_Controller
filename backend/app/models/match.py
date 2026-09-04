from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class MatchStatus(str, Enum):
    ACCEPTED = "accepted"
    FLAGGED = "flagged"
    OVERRIDDEN = "overridden"
    REJECTED = "rejected"

class ResolvedBy(str, Enum):
    RULE_REF_EXACT = "RULE:REF_EXACT"
    RULE_AMOUNT_DATE_EXACT = "RULE:AMOUNT_DATE_EXACT"
    RULE_DATE_OFFSET = "RULE:DATE_OFFSET"
    RULE_FEE_DELTA = "RULE:FEE_DELTA"
    RULE_DUPLICATE_DETECT = "RULE:DUPLICATE_DETECT"
    RULE_SPLIT_PAYMENT = "RULE:SPLIT_PAYMENT"
    RULE_PARTIAL_PAYMENT = "RULE:PARTIAL_PAYMENT"
    AI_REASONING = "AI:REASONING"
    MANUAL_OVERRIDE = "MANUAL:OVERRIDE"

class MatchRecord(BaseModel):
    id: str
    run_id: str
    bank_transaction_id: str
    bank_ref_id: Optional[str] = None
    bank_description: str
    bank_date: str
    bank_amount: float
    ledger_entry_ids: List[str]
    ledger_ref_ids: List[str] = []
    ledger_descriptions: List[str] = []
    ledger_date: str
    ledger_amount: float
    amount_delta: float = 0.0
    confidence: float
    resolved_by: str
    rule_name: Optional[str] = None
    ai_prompt: Optional[str] = None
    ai_response: Optional[Dict[str, Any]] = None
    justification: str
    flags: List[str] = []
    status: MatchStatus = MatchStatus.ACCEPTED
    override_reason: Optional[str] = None
    overridden_by: Optional[str] = None
    overridden_at: Optional[str] = None
    is_ground_truth_correct: Optional[bool] = None
