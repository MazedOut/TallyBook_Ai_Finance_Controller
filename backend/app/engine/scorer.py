from typing import List, Dict, Any, Tuple
from app.models.match import MatchRecord
from app.models.exception import ExceptionRecord

class ReconciliationScorer:
    @staticmethod
    def evaluate_run(
        matches: List[MatchRecord],
        exceptions: List[ExceptionRecord],
        total_bank_count: int,
        total_ledger_count: int,
        ground_truth: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluates reconciliation results against ground truth mapping.
        Computes precision, recall, F1, and rule vs AI breakdown.
        """
        gt_matches = ground_truth.get("matches", [])
        gt_unresolvables = ground_truth.get("unresolvables", [])
        gt_duplicates = ground_truth.get("duplicates", [])

        # Build ground truth lookup: bank_id -> set of ledger_ids
        gt_map = {}
        for m in gt_matches:
            gt_map[m["bank_id"]] = set(m["ledger_ids"])

        tp = 0
        fp = 0
        rule_resolved = 0
        ai_resolved = 0
        overridden = 0

        rule_breakdown: Dict[str, Dict[str, int]] = {}

        # Evaluate each agent match
        matched_bank_ids = set()
        for match in matches:
            b_id = match.bank_transaction_id
            matched_bank_ids.add(b_id)
            agent_ledgers = set(match.ledger_entry_ids)

            # Track resolved_by stats
            r_by = match.resolved_by
            if r_by.startswith("RULE:"):
                rule_resolved += 1
            elif r_by.startswith("AI:"):
                ai_resolved += 1
            elif r_by.startswith("MANUAL:"):
                overridden += 1

            # Rule breakdown init
            r_name = match.rule_name or r_by
            if r_name not in rule_breakdown:
                rule_breakdown[r_name] = {"total": 0, "correct": 0, "incorrect": 0}
            rule_breakdown[r_name]["total"] += 1

            # Check if this match is in ground truth
            is_correct = False
            if b_id in gt_map:
                # Check if predicted ledgers intersect or equal ground truth
                if agent_ledgers == gt_map[b_id]:
                    tp += 1
                    is_correct = True
                    rule_breakdown[r_name]["correct"] += 1
                else:
                    fp += 1
                    rule_breakdown[r_name]["incorrect"] += 1
            else:
                # Matched a bank transaction that was supposed to be unresolvable
                fp += 1
                rule_breakdown[r_name]["incorrect"] += 1

            match.is_ground_truth_correct = is_correct

        # False Negatives: in ground truth matches, but not in agent matches
        fn = 0
        for m in gt_matches:
            if m["bank_id"] not in matched_bank_ids:
                fn += 1

        precision = round(tp / (tp + fp), 4) if (tp + fp) > 0 else 0.0
        recall = round(tp / (tp + fn), 4) if (tp + fn) > 0 else 0.0
        f1 = round(2 * (precision * recall) / (precision + recall), 4) if (precision + recall) > 0 else 0.0

        claimed_match_rate = round((len(matches) / total_bank_count) * 100, 2) if total_bank_count > 0 else 0.0
        verified_match_rate = round((tp / total_bank_count) * 100, 2) if total_bank_count > 0 else 0.0
        
        # Calculate mean confidence claimed by agent
        mean_claimed_confidence = (
            round(sum(m.confidence for m in matches) / len(matches), 4)
            if matches else 0.0
        )

        return {
            "total_bank_records": total_bank_count,
            "total_ledger_records": total_ledger_count,
            "total_matches_count": len(matches),
            "total_exceptions_count": len(exceptions),
            "true_positives": tp,
            "false_positives": fp,
            "false_negatives": fn,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "claimed_match_rate_pct": claimed_match_rate,
            "verified_accuracy_pct": round(precision * 100, 2),
            "mean_claimed_confidence": mean_claimed_confidence,
            "confidence_accuracy_calibration_delta": round(abs(mean_claimed_confidence - precision), 4),
            "rule_resolved_count": rule_resolved,
            "ai_resolved_count": ai_resolved,
            "overridden_count": overridden,
            "rule_breakdown": rule_breakdown,
            "honest_exception_rate_pct": round((len(exceptions) / (total_bank_count + total_ledger_count)) * 100, 2)
        }
