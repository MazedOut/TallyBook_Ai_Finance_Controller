from pydantic import BaseModel, Field
from typing import Optional

class BankTransaction(BaseModel):
    id: str
    date: str
    amount: float
    currency: str = "USD"
    description: str
    ref_id: Optional[str] = None
    account_id: str = "ACC-BANK-001"
    raw_source: str = "Chase Commercial Banking"

class LedgerEntry(BaseModel):
    id: str
    date: str
    amount: float
    currency: str = "USD"
    description: str
    ref_id: Optional[str] = None
    account_id: str = "ACC-GL-1010"
    entity: str = "RazorPay Global Inc"
    gl_account: str = "1010-Operating-Cash"
