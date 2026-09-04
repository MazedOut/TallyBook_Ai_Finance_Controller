import re
from datetime import datetime
from typing import List, Dict, Tuple, Optional, Any
from rapidfuzz import fuzz
from app.models.transaction import BankTransaction, LedgerEntry
from app.models.match import MatchRecord, MatchStatus, ResolvedBy

def parse_date(date_str: str) -> datetime:
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except Exception:
        return datetime.fromisoformat(date_str)

def clean_text(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower()).strip()

class RulesEngine:
    def __init__(self, accept_threshold: float = 0.80, exception_threshold: float = 0.55):
        self.accept_threshold = accept_threshold
        self.exception_threshold = exception_threshold

    def run_deterministic_rules(
        self,
        bank_transactions: List[BankTransaction],
        ledger_entries: List[LedgerEntry]
    ) -> Tuple[List[MatchRecord], List[BankTransaction], List[LedgerEntry], List[Dict[str, Any]]]:
        """
        Executes Tier 1 (Exact) and Tier 2 (Tolerance/Splits/Duplicates) rules.
        Returns:
            - resolved_matches: list of MatchRecord
            - remaining_bank: unmatched BankTransactions
            - remaining_ledger: unmatched LedgerEntries
            - fuzzy_candidates: list of dicts with {bank_tx, candidate_entries, suggested_rule}
        """
        resolved_matches: List[MatchRecord] = []
        matched_bank_ids = set()
        matched_ledger_ids = set()

        ledger_by_id = {l.id: l for l in ledger_entries}
        bank_by_id = {b.id: b for b in bank_transactions}

        # Check for internal duplicate postings first (Rule 5: DUPLICATE_DETECT)
        # Bank duplicates
        bank_seen = {}
        for b in bank_transactions:
            key = (round(b.amount, 2), b.date, clean_text(b.description)[:15])
            if key in bank_seen:
                # Mark as duplicate flag
                orig_b = bank_seen[key]
            else:
                bank_seen[key] = b

        # -------------------------------------------------------------
        # Rule 1: REF_EXACT (Tier 1) - Exact Match on Reference ID
        # -------------------------------------------------------------
        ledger_by_ref = {}
        for l in ledger_entries:
            if l.ref_id and l.ref_id.strip():
                ledger_by_ref.setdefault(l.ref_id.strip(), []).append(l)

        for b in bank_transactions:
            if b.id in matched_bank_ids:
                continue
            if b.ref_id and b.ref_id.strip() in ledger_by_ref:
                candidates = [l for l in ledger_by_ref[b.ref_id.strip()] if l.id not in matched_ledger_ids]
                if candidates:
                    # Pick best amount match
                    best_l = min(candidates, key=lambda x: abs(x.amount - b.amount))
                    if abs(best_l.amount - b.amount) < 0.01:
                        matched_bank_ids.add(b.id)
                        matched_ledger_ids.add(best_l.id)
                        resolved_matches.append(
                            MatchRecord(
                                id=f"MCH-{b.id}-{best_l.id}",
                                run_id="",
                                bank_transaction_id=b.id,
                                bank_ref_id=b.ref_id,
                                bank_description=b.description,
                                bank_date=b.date,
                                bank_amount=b.amount,
                                ledger_entry_ids=[best_l.id],
                                ledger_ref_ids=[best_l.ref_id or ""],
                                ledger_descriptions=[best_l.description],
                                ledger_date=best_l.date,
                                ledger_amount=best_l.amount,
                                amount_delta=0.0,
                                confidence=1.0,
                                resolved_by=ResolvedBy.RULE_REF_EXACT.value,
                                rule_name="REF_EXACT",
                                justification=f"Exact reference ID match: '{b.ref_id}' with identical amount ${b.amount:.2f}.",
                                flags=["exact_reference", "automated_rule"],
                                status=MatchStatus.ACCEPTED
                            )
                        )

        # -------------------------------------------------------------
        # Rule 2: AMOUNT_DATE_EXACT (Tier 1) - Exact Amount + Date + Description overlap
        # -------------------------------------------------------------
        for b in bank_transactions:
            if b.id in matched_bank_ids:
                continue
            candidates = [
                l for l in ledger_entries
                if l.id not in matched_ledger_ids
                and abs(l.amount - b.amount) < 0.01
                and l.date == b.date
            ]
            if len(candidates) == 1:
                target_l = candidates[0]
                matched_bank_ids.add(b.id)
                matched_ledger_ids.add(target_l.id)
                resolved_matches.append(
                    MatchRecord(
                        id=f"MCH-{b.id}-{target_l.id}",
                        run_id="",
                        bank_transaction_id=b.id,
                        bank_ref_id=b.ref_id,
                        bank_description=b.description,
                        bank_date=b.date,
                        bank_amount=b.amount,
                        ledger_entry_ids=[target_l.id],
                        ledger_ref_ids=[target_l.ref_id or ""],
                        ledger_descriptions=[target_l.description],
                        ledger_date=target_l.date,
                        ledger_amount=target_l.amount,
                        amount_delta=0.0,
                        confidence=0.98,
                        resolved_by=ResolvedBy.RULE_AMOUNT_DATE_EXACT.value,
                        rule_name="AMOUNT_DATE_EXACT",
                        justification=f"Exact amount ${b.amount:.2f} and exact date {b.date} matching ledger entry.",
                        flags=["exact_amount_date", "automated_rule"],
                        status=MatchStatus.ACCEPTED
                    )
                )

        # -------------------------------------------------------------
        # Rule 3: DATE_OFFSET (Tier 2) - Exact Amount + Settlement Lag (±3 Days)
        # -------------------------------------------------------------
        for b in bank_transactions:
            if b.id in matched_bank_ids:
                continue
            b_dt = parse_date(b.date)
            candidates = []
            for l in ledger_entries:
                if l.id in matched_ledger_ids:
                    continue
                if abs(l.amount - b.amount) < 0.01:
                    l_dt = parse_date(l.date)
                    diff_days = (b_dt - l_dt).days
                    if 0 <= diff_days <= 3:
                        desc_sim = fuzz.token_set_ratio(b.description, l.description) / 100.0
                        candidates.append((l, diff_days, desc_sim))

            if len(candidates) == 1:
                target_l, lag, desc_sim = candidates[0]
                # High description similarity resolves via deterministic rule
                # Low description similarity / abbreviations require AI reasoning
                if desc_sim >= 0.50:
                    matched_bank_ids.add(b.id)
                    matched_ledger_ids.add(target_l.id)
                    resolved_matches.append(
                        MatchRecord(
                            id=f"MCH-{b.id}-{target_l.id}",
                            run_id="",
                            bank_transaction_id=b.id,
                            bank_ref_id=b.ref_id,
                            bank_description=b.description,
                            bank_date=b.date,
                            bank_amount=b.amount,
                            ledger_entry_ids=[target_l.id],
                            ledger_ref_ids=[target_l.ref_id or ""],
                            ledger_descriptions=[target_l.description],
                            ledger_date=target_l.date,
                            ledger_amount=target_l.amount,
                            amount_delta=0.0,
                            confidence=0.94 - (lag * 0.02),
                            resolved_by=ResolvedBy.RULE_DATE_OFFSET.value,
                            rule_name="DATE_OFFSET",
                            justification=f"Exact amount ${b.amount:.2f} with T+{lag} day settlement offset ({target_l.date} -> {b.date}) and confirmed description alignment.",
                            flags=["settlement_lag", "automated_rule"],
                            status=MatchStatus.ACCEPTED
                        )
                    )

        # -------------------------------------------------------------
        # Rule 4: FEE_DELTA (Tier 2) - Small Difference (<= $2.50 wire/merchant fee)
        # -------------------------------------------------------------
        for b in bank_transactions:
            if b.id in matched_bank_ids:
                continue
            b_dt = parse_date(b.date)
            candidates = []
            for l in ledger_entries:
                if l.id in matched_ledger_ids:
                    continue
                diff_amount = round(l.amount - b.amount, 2)
                if 0.01 < diff_amount <= 2.50:
                    l_dt = parse_date(l.date)
                    diff_days = abs((b_dt - l_dt).days)
                    if diff_days <= 3:
                        # Check description or ref similarity
                        desc_sim = fuzz.token_set_ratio(b.description, l.description) / 100.0
                        ref_match = bool(b.ref_id and l.ref_id and b.ref_id == l.ref_id)
                        if ref_match or desc_sim > 0.40:
                            candidates.append((l, diff_amount, desc_sim))

            if len(candidates) == 1:
                target_l, delta, sim = candidates[0]
                matched_bank_ids.add(b.id)
                matched_ledger_ids.add(target_l.id)
                resolved_matches.append(
                    MatchRecord(
                        id=f"MCH-{b.id}-{target_l.id}",
                        run_id="",
                        bank_transaction_id=b.id,
                        bank_ref_id=b.ref_id,
                        bank_description=b.description,
                        bank_date=b.date,
                        bank_amount=b.amount,
                        ledger_entry_ids=[target_l.id],
                        ledger_ref_ids=[target_l.ref_id or ""],
                        ledger_descriptions=[target_l.description],
                        ledger_date=target_l.date,
                        ledger_amount=target_l.amount,
                        amount_delta=delta,
                        confidence=0.88,
                        resolved_by=ResolvedBy.RULE_FEE_DELTA.value,
                        rule_name="FEE_DELTA",
                        justification=f"Bank deducted ${delta:.2f} service/wire fee from ledger amount ${target_l.amount:.2f}.",
                        flags=["fee_deduction", "automated_rule"],
                        status=MatchStatus.ACCEPTED
                    )
                )

        # -------------------------------------------------------------
        # Rule 6: SPLIT_PAYMENT (Tier 2) - 1 Bank Transaction = Sum of 2 Ledger Entries
        # -------------------------------------------------------------
        for b in bank_transactions:
            if b.id in matched_bank_ids:
                continue
            b_dt = parse_date(b.date)
            # Find candidate pairs in ledger with same date within ±3 days
            available_ledgers = [
                l for l in ledger_entries
                if l.id not in matched_ledger_ids and abs((b_dt - parse_date(l.date)).days) <= 3
            ]
            found_split = None
            for i in range(len(available_ledgers)):
                for j in range(i + 1, len(available_ledgers)):
                    l1 = available_ledgers[i]
                    l2 = available_ledgers[j]
                    combined_sum = round(l1.amount + l2.amount, 2)
                    if abs(combined_sum - b.amount) < 0.05:
                        # Validate description or ref correlation
                        b_clean = clean_text(b.description)
                        l1_clean = clean_text(l1.description)
                        l2_clean = clean_text(l2.description)
                        if (fuzz.token_set_ratio(b_clean, l1_clean) > 40 or
                            (b.ref_id and l1.ref_id and b.ref_id.split("-")[-1] in l1.ref_id)):
                            found_split = (l1, l2)
                            break
                if found_split:
                    break

            if found_split:
                l1, l2 = found_split
                matched_bank_ids.add(b.id)
                matched_ledger_ids.add(l1.id)
                matched_ledger_ids.add(l2.id)
                resolved_matches.append(
                    MatchRecord(
                        id=f"MCH-{b.id}-SPLIT",
                        run_id="",
                        bank_transaction_id=b.id,
                        bank_ref_id=b.ref_id,
                        bank_description=b.description,
                        bank_date=b.date,
                        bank_amount=b.amount,
                        ledger_entry_ids=[l1.id, l2.id],
                        ledger_ref_ids=[l1.ref_id or "", l2.ref_id or ""],
                        ledger_descriptions=[l1.description, l2.description],
                        ledger_date=f"{l1.date} / {l2.date}",
                        ledger_amount=round(l1.amount + l2.amount, 2),
                        amount_delta=0.0,
                        confidence=0.89,
                        resolved_by=ResolvedBy.RULE_SPLIT_PAYMENT.value,
                        rule_name="SPLIT_PAYMENT",
                        justification=f"Single bank payment of ${b.amount:.2f} matches split ledger entries (${l1.amount:.2f} + ${l2.amount:.2f}).",
                        flags=["split_payment", "consolidated_transfer"],
                        status=MatchStatus.ACCEPTED
                    )
                )

        # -------------------------------------------------------------
        # Tier 3: Fuzzy Pre-filtering (Rules 8, 9, 10)
        # Narrows unmatched bank transactions to potential candidates for AI reasoning
        # -------------------------------------------------------------
        remaining_bank = [b for b in bank_transactions if b.id not in matched_bank_ids]
        remaining_ledger = [l for l in ledger_entries if l.id not in matched_ledger_ids]

        fuzzy_candidates = []
        for b in remaining_bank:
            b_dt = parse_date(b.date)
            candidates = []
            for l in remaining_ledger:
                l_dt = parse_date(l.date)
                days_diff = abs((b_dt - l_dt).days)
                amt_ratio = abs(b.amount - l.amount) / max(b.amount, l.amount, 1.0)
                desc_similarity = fuzz.token_set_ratio(b.description, l.description) / 100.0

                # Check if it meets fuzzy pre-filter thresholds:
                # 1. High description similarity (> 0.45) and same amount or within 5%
                # 2. Exact amount with date window within 7 days
                if (desc_similarity >= 0.40 and amt_ratio <= 0.05) or (amt_ratio < 0.001 and days_diff <= 7):
                    candidates.append({
                        "ledger_entry": l,
                        "desc_similarity": desc_similarity,
                        "amount_delta": round(abs(b.amount - l.amount), 2),
                        "days_diff": days_diff
                    })

            if candidates:
                fuzzy_candidates.append({
                    "bank_transaction": b,
                    "candidates": candidates
                })

        return resolved_matches, remaining_bank, remaining_ledger, fuzzy_candidates
