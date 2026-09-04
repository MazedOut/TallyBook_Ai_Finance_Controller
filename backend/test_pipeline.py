import sys
from app.data.loader import load_reconciliation_data
from app.engine.rules_engine import RulesEngine
from app.engine.ai_engine import AIEngine
from app.engine.scorer import ReconciliationScorer
from app.engine.exception_triage import ExceptionTriage

def main():
    bank, ledger, gt = load_reconciliation_data("./app/data")
    print(f"Loaded {len(bank)} bank txs, {len(ledger)} ledger entries, {len(gt.get('matches', []))} ground truth matches.")

    rules = RulesEngine(accept_threshold=0.80)
    ai = AIEngine(api_key="", accept_threshold=0.80)
    triage = ExceptionTriage(high_value_threshold=10000.0)

    matches, rem_b, rem_l, candidates = rules.run_deterministic_rules(bank, ledger)
    print(f"Deterministic Rules resolved: {len(matches)} matches.")
    print(f"Candidates flagged for AI reasoning: {len(candidates)}")

    ai_count = 0
    for item in candidates:
        m = ai.evaluate_candidates(item["bank_transaction"], item["candidates"], run_id="test-run-1")
        if m:
            matches.append(m)
            ai_count += 1

    print(f"AI Reasoning resolved: {ai_count} matches.")

    matched_b_ids = {m.bank_transaction_id for m in matches}
    matched_l_ids = {lid for m in matches for lid in m.ledger_entry_ids}

    unmatched_bank = [b for b in bank if b.id not in matched_b_ids]
    unmatched_ledger = [l for l in ledger if l.id not in matched_l_ids]

    exceptions = triage.triage_unmatched_records(
        unmatched_bank, unmatched_ledger, bank, ledger, run_id="test-run-1"
    )

    scores = ReconciliationScorer.evaluate_run(
        matches, exceptions, len(bank), len(ledger), gt
    )

    print("\n--- RECONCILIATION SCORING REPORT ---")
    print(f"Claimed Match Rate: {scores['claimed_match_rate_pct']}%")
    print(f"Precision: {scores['precision'] * 100}%")
    print(f"Recall: {scores['recall'] * 100}%")
    print(f"F1 Score: {scores['f1_score'] * 100}%")
    print(f"True Positives: {scores['true_positives']}")
    print(f"False Positives: {scores['false_positives']}")
    print(f"False Negatives: {scores['false_negatives']}")
    print(f"Total Exceptions Triaged: {scores['total_exceptions_count']}")
    print(f"Rule Resolved: {scores['rule_resolved_count']}, AI Resolved: {scores['ai_resolved_count']}")
    print("Rule Breakdown:", scores['rule_breakdown'])

if __name__ == "__main__":
    main()
