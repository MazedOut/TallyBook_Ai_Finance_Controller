import uuid
import time
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.config import settings
from app.models.user import User
from app.models.audit import AuditLog
from app.models.transaction import BankTransaction, LedgerEntry
from app.middleware.auth import get_current_user, require_role
from app.data.loader import load_reconciliation_data
from app.engine.rules_engine import RulesEngine
from app.engine.ai_engine import AIEngine
from app.engine.scorer import ReconciliationScorer
from app.engine.exception_triage import ExceptionTriage
from app.repository import repo

router = APIRouter(prefix="/reconcile", tags=["Reconciliation"])

class ReconcileRunRequest(BaseModel):
    accept_threshold: Optional[float] = None
    exception_threshold: Optional[float] = None
    high_value_threshold: Optional[float] = None
    notes: Optional[str] = "Standard automated batch reconciliation"

class InjectTransactionRequest(BaseModel):
    type: str = "bank"  # "bank" or "ledger"
    amount: float
    date: str
    description: str
    ref_id: Optional[str] = None
    accept_threshold: Optional[float] = 0.80

@router.post("/run")
async def run_reconciliation(
    req: ReconcileRunRequest,
    current_user: User = Depends(get_current_user)
):
    start_time = time.time()
    accept_thresh = req.accept_threshold or settings.accept_threshold
    exc_thresh = req.exception_threshold or settings.exception_threshold
    high_val_thresh = req.high_value_threshold or settings.high_value_threshold

    # 1. Load data
    bank_txs, ledger_entries, ground_truth = load_reconciliation_data(settings.data_dir)
    total_bank = len(bank_txs)
    total_ledger = len(ledger_entries)

    run_id = f"RUN-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    # 2. Deterministic rules pass
    rules_engine = RulesEngine(accept_threshold=accept_thresh, exception_threshold=exc_thresh)
    deterministic_matches, rem_bank, rem_ledger, candidates = rules_engine.run_deterministic_rules(bank_txs, ledger_entries)

    # 3. AI Reasoning pass
    ai_engine = AIEngine(api_key=settings.groq_api_key, accept_threshold=accept_thresh)
    all_matches = list(deterministic_matches)
    ai_resolved_count = 0

    for c in candidates:
        m = ai_engine.evaluate_candidates(c["bank_transaction"], c["candidates"], run_id=run_id)
        if m:
            all_matches.append(m)
            ai_resolved_count += 1

    # 4. Resolve remaining for exception triage
    matched_b_ids = {m.bank_transaction_id for m in all_matches}
    matched_l_ids = {lid for m in all_matches for lid in m.ledger_entry_ids}

    unmatched_bank = [b for b in bank_txs if b.id not in matched_b_ids]
    unmatched_ledger = [l for l in ledger_entries if l.id not in matched_l_ids]

    # 5. Triage exceptions
    triage = ExceptionTriage(high_value_threshold=high_val_thresh)
    exceptions = triage.triage_unmatched_records(
        unmatched_bank, unmatched_ledger, bank_txs, ledger_entries, run_id=run_id
    )

    # 6. Score vs ground truth
    scores = ReconciliationScorer.evaluate_run(
        all_matches, exceptions, total_bank, total_ledger, ground_truth
    )

    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    # Update matches run_id
    for m in all_matches:
        m.run_id = run_id

    run_data = {
        "run_id": run_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor": current_user.full_name,
        "actor_role": current_user.role.value,
        "parameters": {
            "accept_threshold": accept_thresh,
            "exception_threshold": exc_thresh,
            "high_value_threshold": high_val_thresh,
            "ai_engine_active": bool(settings.groq_api_key),
            "ai_model": "llama-3.3-70b-versatile" if settings.groq_api_key else "semantic-reasoner-v1"
        },
        "scores": scores,
        "matches": all_matches,
        "exceptions": exceptions,
        "duration_ms": elapsed_ms,
        "notes": req.notes,
        "status": "completed"
    }

    repo.save_run(run_data)

    # Record in immutable audit trail
    repo.add_audit_log(
        AuditLog(
            id=f"aud-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.now(timezone.utc).isoformat(),
            actor_id=current_user.id,
            actor_name=current_user.full_name,
            actor_role=current_user.role.value,
            action="RUN_RECONCILIATION_BATCH",
            entity_type="run",
            entity_id=run_id,
            after_state={
                "matches_count": len(all_matches),
                "exceptions_count": len(exceptions),
                "precision": scores["precision"],
                "recall": scores["recall"],
                "f1_score": scores["f1_score"],
                "match_rate": scores["claimed_match_rate_pct"]
            },
            notes=f"Batch run completed in {elapsed_ms}ms with {scores['claimed_match_rate_pct']}% match rate."
        )
    )

    return run_data

@router.get("/runs")
async def list_reconciliation_runs():
    runs = repo.list_runs()
    # Summarize runs for list view
    summaries = []
    for r in runs:
        summaries.append({
            "run_id": r["run_id"],
            "timestamp": r["timestamp"],
            "actor": r["actor"],
            "actor_role": r["actor_role"],
            "matches_count": len(r.get("matches", [])),
            "exceptions_count": len(r.get("exceptions", [])),
            "claimed_match_rate_pct": r.get("scores", {}).get("claimed_match_rate_pct", 0),
            "precision_pct": round(r.get("scores", {}).get("precision", 0) * 100, 2),
            "f1_score": r.get("scores", {}).get("f1_score", 0),
            "duration_ms": r.get("duration_ms", 0),
            "status": r.get("status", "completed")
        })
    return summaries

@router.get("/results/{run_id}")
async def get_reconciliation_run(run_id: str):
    run = repo.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Reconciliation run '{run_id}' not found.")
    return run

@router.post("/inject")
async def inject_and_simulate_transaction(
    req: InjectTransactionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Live What-If Simulator: Injects a candidate transaction into the active dataset,
    tests resolution logic against open records, and returns live match determination
    with confidence and reasoning trace without polluting the permanent store.
    """
    bank_txs, ledger_entries, ground_truth = load_reconciliation_data(settings.data_dir)
    accept_thresh = req.accept_threshold or 0.80

    rules_engine = RulesEngine(accept_threshold=accept_thresh)
    ai_engine = AIEngine(api_key=settings.groq_api_key, accept_threshold=accept_thresh)

    if req.type == "bank":
        injected_tx = BankTransaction(
            id=f"BNK-INJECTED-{uuid.uuid4().hex[:6].upper()}",
            date=req.date,
            amount=req.amount,
            currency="USD",
            description=req.description,
            ref_id=req.ref_id,
            account_id="ACC-BANK-CHASE-01",
            raw_source="Chase Live Simulation Feed"
        )
        sim_bank = [injected_tx]
        sim_ledger = list(ledger_entries)

        matches, rem_b, rem_l, candidates = rules_engine.run_deterministic_rules(sim_bank, sim_ledger)
        ai_match = None
        if candidates:
            ai_match = ai_engine.evaluate_candidates(injected_tx, candidates[0]["candidates"], run_id="SIMULATION")

        resolved_match = matches[0] if matches else ai_match

        if resolved_match:
            outcome = "MATCHED"
            confidence = resolved_match.confidence
            reason = resolved_match.justification
            counterpart = resolved_match.ledger_descriptions[0] if resolved_match.ledger_descriptions else ""
            rule = resolved_match.rule_name
        else:
            outcome = "EXCEPTION"
            confidence = 0.15
            reason = "No counterpart ledger voucher met the confidence cutoff."
            counterpart = "None"
            rule = "NO_COUNTERPART"

        return {
            "injected_transaction": injected_tx.dict(),
            "simulation_outcome": outcome,
            "confidence": confidence,
            "resolved_by_engine": rule,
            "justification": reason,
            "matched_counterpart": counterpart,
            "status": "simulation_complete"
        }
    else:
        injected_ledger = LedgerEntry(
            id=f"LDG-INJECTED-{uuid.uuid4().hex[:6].upper()}",
            date=req.date,
            amount=req.amount,
            currency="USD",
            description=req.description,
            ref_id=req.ref_id,
            account_id="ACC-GL-1010",
            entity="RazorPay Global Inc",
            gl_account="1010-Operating-Cash"
        )
        sim_bank = list(bank_txs)
        sim_ledger = [injected_ledger]

        matches, rem_b, rem_l, candidates = rules_engine.run_deterministic_rules(sim_bank, sim_ledger)
        resolved_match = matches[0] if matches else None

        if resolved_match:
            outcome = "MATCHED"
            confidence = resolved_match.confidence
            reason = resolved_match.justification
            counterpart = resolved_match.bank_description
            rule = resolved_match.rule_name
        else:
            outcome = "EXCEPTION"
            confidence = 0.20
            reason = "No matching bank clearing transaction found within tolerance windows."
            counterpart = "None"
            rule = "NO_COUNTERPART"

        return {
            "injected_transaction": injected_ledger.dict(),
            "simulation_outcome": outcome,
            "confidence": confidence,
            "resolved_by_engine": rule,
            "justification": reason,
            "matched_counterpart": counterpart,
            "status": "simulation_complete"
        }
