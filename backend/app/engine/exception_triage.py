import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple
from app.models.transaction import BankTransaction, LedgerEntry
from app.models.exception import ExceptionRecord, ExceptionCategory

def calculate_aging_days(date_str: str) -> int:
    try:
        tx_dt = datetime.strptime(date_str, "%Y-%m-%d")
        ref_dt = datetime(2026, 3, 1)  # Month-end reconciliation date
        delta = (ref_dt - tx_dt).days
        return max(1, delta)
    except Exception:
        return 5

class ExceptionTriage:
    def __init__(self, high_value_threshold: float = 10000.0):
        self.high_value_threshold = high_value_threshold

    def triage_unmatched_records(
        self,
        unmatched_bank: List[BankTransaction],
        unmatched_ledger: List[LedgerEntry],
        all_bank: List[BankTransaction],
        all_ledger: List[LedgerEntry],
        run_id: str = ""
    ) -> List[ExceptionRecord]:
        """
        Categorizes exceptions with specific financial diagnostics and actionable resolution notes.
        """
        exceptions: List[ExceptionRecord] = []

        # Indexing for duplicate detection
        bank_desc_counts = {}
        for b in all_bank:
            key = (b.amount, b.date)
            bank_desc_counts[key] = bank_desc_counts.get(key, 0) + 1

        ledger_desc_counts = {}
        for l in all_ledger:
            key = (l.amount, l.date)
            ledger_desc_counts[key] = ledger_desc_counts.get(key, 0) + 1

        # Triage unmatched Bank Transactions
        for b in unmatched_bank:
            aging = calculate_aging_days(b.date)
            requires_approval = b.amount >= self.high_value_threshold

            # 1. Check for Duplicate Posting
            if bank_desc_counts.get((b.amount, b.date), 0) > 1 or "duplicate" in b.description.lower():
                category = ExceptionCategory.DUPLICATE_FEE_NOISE
                reason = "Potential duplicate debit posted in bank feed with identical amount and posting date."
                resolve_note = "Verify bank statement batch summary and request merchant processor refund or reversal."
                confidence = 0.85
            # 2. Bank Wire/Service Fee
            elif "service chg" in b.description.lower() or "fee" in b.description.lower() or b.amount < 50.0:
                category = ExceptionCategory.DUPLICATE_FEE_NOISE
                reason = "Unrecorded bank service charge or wire transfer fee."
                resolve_note = "Post bank fee expense journal entry to GL 6050 (Bank Service Charges)."
                confidence = 0.90
            # 3. Possible Split / Partial
            elif any(abs(l.amount - (b.amount * 0.5)) < 1.0 for l in unmatched_ledger):
                category = ExceptionCategory.SPLIT_PAYMENT_PARTIAL
                reason = "Bank disbursement closely mirrors 50% milestone tranche of an open ledger PO."
                resolve_note = "Confirm whether vendor split billing into multiple milestone invoices and request counterpart voucher."
                confidence = 0.65
            # 4. Possible Date Lag
            elif any(abs(l.amount - b.amount) < 0.01 for l in all_ledger):
                category = ExceptionCategory.DATE_LAG_POSSIBLE
                reason = "Matching amount found in ledger, but posting date exceeds settlement tolerance window (>3 days)."
                resolve_note = "Check transaction settlement lifecycle and re-verify ACH clearing cutoff dates."
                confidence = 0.60
            # 5. Genuine No Counterpart (Unresolvable)
            else:
                category = ExceptionCategory.NO_COUNTERPART
                reason = f"No counterpart ledger entry found matching ${b.amount:.2f} across GL accounts."
                resolve_note = "Request receipt/invoice from department head or initiate AP unvouched invoice intake."
                confidence = 0.15

            exc_id = f"EXC-BNK-{b.id}"
            exceptions.append(
                ExceptionRecord(
                    id=exc_id,
                    run_id=run_id,
                    source_type="bank",
                    transaction_id=b.id,
                    ref_id=b.ref_id,
                    amount=b.amount,
                    date=b.date,
                    description=b.description,
                    category=category,
                    confidence=confidence,
                    what_would_resolve=resolve_note,
                    reasoning=reason,
                    status="open",
                    approval_required=requires_approval,
                    aging_days=aging
                )
            )

        # Triage unmatched Ledger Entries
        for l in unmatched_ledger:
            aging = calculate_aging_days(l.date)
            requires_approval = l.amount >= self.high_value_threshold

            # 1. Duplicate Ledger Entry
            if ledger_desc_counts.get((l.amount, l.date), 0) > 1 or "double" in l.description.lower():
                category = ExceptionCategory.DUPLICATE_FEE_NOISE
                reason = "Accidental duplicate journal entry booked in internal ERP ledger."
                resolve_note = "Post a credit/reversal adjustment voucher in General Ledger."
                confidence = 0.88
            # 2. Accrual / Non-cash journal entry
            elif "accrued" in l.description.lower() or "amortization" in l.description.lower() or "intercompany" in l.description.lower():
                category = ExceptionCategory.NO_COUNTERPART
                reason = "Non-cash accounting accrual, amortization, or intercompany rebalance entry."
                resolve_note = "Reclassify out of cash account 1010 to appropriate non-cash clearing account."
                confidence = 0.20
            # 3. Outstanding Check
            elif "check" in l.description.lower():
                category = ExceptionCategory.NO_COUNTERPART
                reason = "Check issued to payee but not yet presented/cleared at bank."
                resolve_note = "Retain as outstanding check on bank reconciliation schedule until next statement cycle."
                confidence = 0.30
            # 4. Generic discrepancy
            else:
                category = ExceptionCategory.NO_COUNTERPART
                reason = f"Voucher of ${l.amount:.2f} logged in ledger without corresponding bank clearing."
                resolve_note = "Verify payment execution status with Treasury or Treasury Management System."
                confidence = 0.25

            exc_id = f"EXC-LDG-{l.id}"
            exceptions.append(
                ExceptionRecord(
                    id=exc_id,
                    run_id=run_id,
                    source_type="ledger",
                    transaction_id=l.id,
                    ref_id=l.ref_id,
                    amount=l.amount,
                    date=l.date,
                    description=l.description,
                    category=category,
                    confidence=confidence,
                    what_would_resolve=resolve_note,
                    reasoning=reason,
                    status="open",
                    approval_required=requires_approval,
                    aging_days=aging
                )
            )

        return exceptions
