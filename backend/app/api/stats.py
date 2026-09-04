from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from app.models.user import User
from app.middleware.auth import get_current_user
from app.repository.memory import repo

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("")
async def get_system_statistics(current_user: User = Depends(get_current_user)):
    runs = repo.list_runs()
    latest_run = runs[0] if runs else None

    # If no runs yet, return rich benchmark baseline from synthetic data
    if not latest_run:
        return {
            "has_runs": False,
            "message": "No reconciliation runs completed yet. Click 'Run Reconciliation' to populate."
        }

    scores = latest_run.get("scores", {})
    matches = latest_run.get("matches", [])
    exceptions = latest_run.get("exceptions", [])

    # 1. Exception category breakdown
    category_counts = {}
    category_values = {}
    for exc in exceptions:
        exc_dict = exc if isinstance(exc, dict) else exc.dict()
        cat = exc_dict.get("category", "unresolved")
        amt = exc_dict.get("amount", 0.0)
        category_counts[cat] = category_counts.get(cat, 0) + 1
        category_values[cat] = round(category_values.get(cat, 0.0) + amt, 2)

    # 2. Confidence histogram distribution (calibration buckets)
    confidence_buckets = {
        "0.50-0.60": 0,
        "0.60-0.70": 0,
        "0.70-0.80": 0,
        "0.80-0.90": 0,
        "0.90-1.00": 0,
    }
    for m in matches:
        m_dict = m if isinstance(m, dict) else m.dict()
        c = m_dict.get("confidence", 0.0)
        if c < 0.60:
            confidence_buckets["0.50-0.60"] += 1
        elif c < 0.70:
            confidence_buckets["0.60-0.70"] += 1
        elif c < 0.80:
            confidence_buckets["0.70-0.80"] += 1
        elif c < 0.90:
            confidence_buckets["0.80-0.90"] += 1
        else:
            confidence_buckets["0.90-1.00"] += 1

    # 3. $ Value auto-resolved vs manual
    auto_resolved_val = 0.0
    manual_val = 0.0
    for m in matches:
        m_dict = m if isinstance(m, dict) else m.dict()
        amt = m_dict.get("bank_amount", 0.0)
        if m_dict.get("resolved_by", "").startswith("MANUAL"):
            manual_val += amt
        else:
            auto_resolved_val += amt

    # 4. Exception aging distribution
    aging_buckets = {
        "< 3 days": 0,
        "3-7 days": 0,
        "8-14 days": 0,
        "15+ days": 0
    }
    for exc in exceptions:
        exc_dict = exc if isinstance(exc, dict) else exc.dict()
        aging = exc_dict.get("aging_days", 1)
        if aging < 3:
            aging_buckets["< 3 days"] += 1
        elif aging <= 7:
            aging_buckets["3-7 days"] += 1
        elif aging <= 14:
            aging_buckets["8-14 days"] += 1
        else:
            aging_buckets["15+ days"] += 1

    # 5. Trend over recent runs
    runs_trend = []
    for r in reversed(runs[:6]):  # Chronological order
        s = r.get("scores", {})
        runs_trend.append({
            "run_id": r["run_id"],
            "timestamp": r["timestamp"][:16].replace("T", " "),
            "match_rate": s.get("claimed_match_rate_pct", 0),
            "precision": round(s.get("precision", 0) * 100, 1),
            "recall": round(s.get("recall", 0) * 100, 1),
            "f1": round(s.get("f1_score", 0) * 100, 1)
        })

    return {
        "has_runs": True,
        "latest_run_id": latest_run["run_id"],
        "summary": {
            "total_matches": len(matches),
            "total_exceptions": len(exceptions),
            "claimed_match_rate": scores.get("claimed_match_rate_pct", 0),
            "verified_accuracy": scores.get("verified_accuracy_pct", 0),
            "precision": scores.get("precision", 0),
            "recall": scores.get("recall", 0),
            "f1_score": scores.get("f1_score", 0),
            "auto_resolved_value": round(auto_resolved_val, 2),
            "manual_resolved_value": round(manual_val, 2),
            "rule_resolved_count": scores.get("rule_resolved_count", 0),
            "ai_resolved_count": scores.get("ai_resolved_count", 0),
            "mean_claimed_confidence": scores.get("mean_claimed_confidence", 0),
            "calibration_delta": scores.get("confidence_accuracy_calibration_delta", 0)
        },
        "category_counts": category_counts,
        "category_values": category_values,
        "confidence_buckets": confidence_buckets,
        "aging_buckets": aging_buckets,
        "rule_breakdown": scores.get("rule_breakdown", {}),
        "runs_trend": runs_trend
    }
