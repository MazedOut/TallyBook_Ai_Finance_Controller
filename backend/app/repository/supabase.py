import logging
from typing import List, Optional, Dict, Any
from app.models.match import MatchRecord
from app.models.exception import ExceptionRecord
from app.models.period import Period
from app.models.audit import AuditLog
from app.models.user import User
from app.repository.base import BaseRepository
from app.repository.memory import MemoryRepository
from app.config import settings

logger = logging.getLogger(__name__)

class SupabaseRepository(BaseRepository):
    def __init__(self, fallback_repo: MemoryRepository):
        self.fallback_repo = fallback_repo
        self.client = None
        self.enabled = False

        if settings.supabase_url and (settings.supabase_key or settings.supabase_service_role_key):
            try:
                from supabase import create_client
                key = settings.supabase_service_role_key or settings.supabase_key
                self.client = create_client(settings.supabase_url, key)
                self.enabled = True
                logger.info("Supabase client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Supabase client: {e}. Using in-memory fallback.")

    def save_run(self, run_data: Dict[str, Any]) -> str:
        # Always update memory cache
        run_id = self.fallback_repo.save_run(run_data)

        if self.enabled and self.client:
            try:
                # 1. Insert Run
                self.client.table("reconciliation_runs").upsert({
                    "run_id": run_id,
                    "timestamp": run_data.get("timestamp"),
                    "actor": run_data.get("actor", "System"),
                    "actor_role": run_data.get("actor_role", "analyst"),
                    "parameters": run_data.get("parameters", {}),
                    "scores": run_data.get("scores", {}),
                    "duration_ms": run_data.get("duration_ms", 0),
                    "notes": run_data.get("notes", ""),
                    "status": run_data.get("status", "completed")
                }).execute()

                # 2. Insert Matches
                matches_payload = []
                for m in run_data.get("matches", []):
                    m_dict = m.dict() if hasattr(m, "dict") else m
                    matches_payload.append({
                        "id": m_dict.get("id"),
                        "run_id": run_id,
                        "bank_transaction_id": m_dict.get("bank_transaction_id"),
                        "bank_ref_id": m_dict.get("bank_ref_id"),
                        "bank_description": m_dict.get("bank_description"),
                        "bank_date": m_dict.get("bank_date"),
                        "bank_amount": m_dict.get("bank_amount"),
                        "ledger_entry_ids": m_dict.get("ledger_entry_ids", []),
                        "ledger_ref_ids": m_dict.get("ledger_ref_ids", []),
                        "ledger_descriptions": m_dict.get("ledger_descriptions", []),
                        "ledger_date": m_dict.get("ledger_date"),
                        "ledger_amount": m_dict.get("ledger_amount"),
                        "amount_delta": m_dict.get("amount_delta", 0.0),
                        "confidence": m_dict.get("confidence"),
                        "resolved_by": m_dict.get("resolved_by"),
                        "rule_name": m_dict.get("rule_name"),
                        "ai_prompt": m_dict.get("ai_prompt"),
                        "ai_response": m_dict.get("ai_response"),
                        "justification": m_dict.get("justification"),
                        "flags": m_dict.get("flags", []),
                        "status": m_dict.get("status", "accepted"),
                        "override_reason": m_dict.get("override_reason"),
                        "overridden_by": m_dict.get("overridden_by"),
                        "overridden_at": m_dict.get("overridden_at"),
                        "is_ground_truth_correct": m_dict.get("is_ground_truth_correct")
                    })
                if matches_payload:
                    self.client.table("reconciliation_matches").upsert(matches_payload).execute()

                # 3. Insert Exceptions
                exceptions_payload = []
                for exc in run_data.get("exceptions", []):
                    exc_dict = exc.dict() if hasattr(exc, "dict") else exc
                    exceptions_payload.append({
                        "id": exc_dict.get("id"),
                        "run_id": run_id,
                        "source_type": exc_dict.get("source_type"),
                        "transaction_id": exc_dict.get("transaction_id"),
                        "ref_id": exc_dict.get("ref_id"),
                        "amount": exc_dict.get("amount"),
                        "date": exc_dict.get("date"),
                        "description": exc_dict.get("description"),
                        "category": exc_dict.get("category"),
                        "confidence": exc_dict.get("confidence", 0.0),
                        "what_would_resolve": exc_dict.get("what_would_resolve"),
                        "candidate_ids": exc_dict.get("candidate_ids", []),
                        "reasoning": exc_dict.get("reasoning"),
                        "status": exc_dict.get("status", "open"),
                        "approval_required": exc_dict.get("approval_required", False),
                        "approved_by": exc_dict.get("approved_by"),
                        "approved_at": exc_dict.get("approved_at"),
                        "approval_notes": exc_dict.get("approval_notes"),
                        "aging_days": exc_dict.get("aging_days", 1)
                    })
                if exceptions_payload:
                    self.client.table("reconciliation_exceptions").upsert(exceptions_payload).execute()
            except Exception as e:
                logger.warning(f"Error persisting run to Supabase: {e}")

        return run_id

    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        return self.fallback_repo.get_run(run_id)

    def list_runs(self) -> List[Dict[str, Any]]:
        return self.fallback_repo.list_runs()

    def update_match(self, match_id: str, updates: Dict[str, Any]) -> Optional[MatchRecord]:
        match = self.fallback_repo.update_match(match_id, updates)
        if self.enabled and self.client and match:
            try:
                self.client.table("reconciliation_matches").update({
                    "status": match.status.value if hasattr(match.status, "value") else match.status,
                    "resolved_by": match.resolved_by,
                    "override_reason": match.override_reason,
                    "overridden_by": match.overridden_by,
                    "overridden_at": match.overridden_at,
                    "flags": match.flags
                }).eq("id", match_id).execute()
            except Exception as e:
                logger.warning(f"Error updating match in Supabase: {e}")
        return match

    def update_exception(self, exc_id: str, updates: Dict[str, Any]) -> Optional[ExceptionRecord]:
        exc = self.fallback_repo.update_exception(exc_id, updates)
        if self.enabled and self.client and exc:
            try:
                self.client.table("reconciliation_exceptions").update({
                    "status": exc.status,
                    "approved_by": exc.approved_by,
                    "approved_at": exc.approved_at,
                    "approval_notes": exc.approval_notes,
                    "category": exc.category.value if hasattr(exc.category, "value") else exc.category
                }).eq("id", exc_id).execute()
            except Exception as e:
                logger.warning(f"Error updating exception in Supabase: {e}")
        return exc

    def add_audit_log(self, log: AuditLog) -> None:
        self.fallback_repo.add_audit_log(log)
        if self.enabled and self.client:
            try:
                self.client.table("audit_logs").insert({
                    "id": log.id,
                    "timestamp": log.timestamp,
                    "actor_id": log.actor_id,
                    "actor_name": log.actor_name,
                    "actor_role": log.actor_role,
                    "action": log.action,
                    "entity_type": log.entity_type,
                    "entity_id": log.entity_id,
                    "before_state": log.before_state,
                    "after_state": log.after_state,
                    "notes": log.notes
                }).execute()
            except Exception as e:
                logger.warning(f"Error adding audit log to Supabase: {e}")

    def list_audit_logs(self, entity_type: Optional[str] = None) -> List[AuditLog]:
        return self.fallback_repo.list_audit_logs(entity_type=entity_type)

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.fallback_repo.get_user_by_username(username)

    def list_periods(self) -> List[Period]:
        return self.fallback_repo.list_periods()

    def close_period(self, period_id: str, closed_by: str, notes: str) -> Optional[Period]:
        period = self.fallback_repo.close_period(period_id, closed_by, notes)
        if self.enabled and self.client and period:
            try:
                self.client.table("accounting_periods").update({
                    "status": period.status,
                    "closed_by": period.closed_by,
                    "closed_at": period.closed_at,
                    "summary_notes": period.summary_notes
                }).eq("id", period_id).execute()
            except Exception as e:
                logger.warning(f"Error closing period in Supabase: {e}")
        return period
