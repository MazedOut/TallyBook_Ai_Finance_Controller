import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.models.match import MatchRecord
from app.models.exception import ExceptionRecord
from app.models.period import Period
from app.models.audit import AuditLog
from app.models.user import User, UserRole
from app.repository.base import BaseRepository

class MemoryRepository(BaseRepository):
    def __init__(self):
        self.runs: Dict[str, Dict[str, Any]] = {}
        self.matches: Dict[str, MatchRecord] = {}
        self.exceptions: Dict[str, ExceptionRecord] = {}
        self.audit_logs: List[AuditLog] = []
        self.periods: Dict[str, Period] = {}
        self.users: Dict[str, User] = {}
        self._init_defaults()

    def _init_defaults(self):
        # Pre-seed 4 demo accounts (passwords: <role>123)
        # We store plain/simple hash for fast demo testing
        from passlib.hash import pbkdf2_sha256

        self.users["analyst"] = User(
            id="usr-analyst-01",
            username="analyst",
            email="sarah.chen@tallybook.io",
            full_name="Sarah Chen",
            role=UserRole.ANALYST,
            hashed_password=pbkdf2_sha256.hash("analyst123"),
            avatar_initials="SC",
            department="Operations Accounting"
        )
        self.users["controller"] = User(
            id="usr-controller-01",
            username="controller",
            email="marcus.vance@tallybook.io",
            full_name="Marcus Vance",
            role=UserRole.CONTROLLER,
            hashed_password=pbkdf2_sha256.hash("controller123"),
            avatar_initials="MV",
            department="Financial Controller Office"
        )
        self.users["auditor"] = User(
            id="usr-auditor-01",
            username="auditor",
            email="elena.rostova@deloitte-audit.com",
            full_name="Elena Rostova",
            role=UserRole.AUDITOR,
            hashed_password=pbkdf2_sha256.hash("auditor123"),
            avatar_initials="ER",
            department="Statutory Audit Partner"
        )
        self.users["admin"] = User(
            id="usr-admin-01",
            username="admin",
            email="sysadmin@tallybook.io",
            full_name="Alex Mercer",
            role=UserRole.ADMIN,
            hashed_password=pbkdf2_sha256.hash("admin123"),
            avatar_initials="AM",
            department="IT & Enterprise Systems"
        )

        # Pre-seed accounting periods
        p1 = Period(
            id="prd-2026-01",
            name="January 2026",
            start_date="2026-01-01",
            end_date="2026-01-31",
            status="locked",
            closed_by="Marcus Vance (Controller)",
            closed_at="2026-02-05T18:00:00Z",
            total_volume=482590.25,
            bank_records_count=72,
            ledger_records_count=74,
            match_count=68,
            exception_count=4,
            accuracy_score=98.5,
            summary_notes="Period audited and certified by Deloitte. Zero variance."
        )
        p2 = Period(
            id="prd-2026-02",
            name="February 2026 (Active)",
            start_date="2026-02-01",
            end_date="2026-02-28",
            status="open",
            closed_by=None,
            closed_at=None,
            total_volume=521890.10,
            bank_records_count=75,
            ledger_records_count=79,
            match_count=0,
            exception_count=0,
            accuracy_score=0.0,
            summary_notes="Current reconciliation cycle in progress."
        )
        self.periods[p1.id] = p1
        self.periods[p2.id] = p2

        # Add initial audit log
        self.audit_logs.append(
            AuditLog(
                id=f"aud-{uuid.uuid4().hex[:8]}",
                timestamp=datetime.now(timezone.utc).isoformat(),
                actor_id="system",
                actor_name="Tallybook Engine",
                actor_role="system",
                action="INITIALIZE_RECONCILIATION_ENVIRONMENT",
                entity_type="system",
                entity_id="sys-env-01",
                notes="System initialized with default accounting periods and roles."
            )
        )

    def save_run(self, run_data: Dict[str, Any]) -> str:
        run_id = run_data.get("run_id") or f"run-{uuid.uuid4().hex[:8]}"
        run_data["run_id"] = run_id
        if "timestamp" not in run_data:
            run_data["timestamp"] = datetime.now(timezone.utc).isoformat()
        
        self.runs[run_id] = run_data

        # Index matches and exceptions
        for m in run_data.get("matches", []):
            if isinstance(m, MatchRecord):
                m.run_id = run_id
                self.matches[m.id] = m
            elif isinstance(m, dict):
                m_obj = MatchRecord(**m)
                m_obj.run_id = run_id
                self.matches[m_obj.id] = m_obj

        for exc in run_data.get("exceptions", []):
            if isinstance(exc, ExceptionRecord):
                exc.run_id = run_id
                self.exceptions[exc.id] = exc
            elif isinstance(exc, dict):
                exc_obj = ExceptionRecord(**exc)
                exc_obj.run_id = run_id
                self.exceptions[exc_obj.id] = exc_obj

        return run_id

    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        return self.runs.get(run_id)

    def list_runs(self) -> List[Dict[str, Any]]:
        return sorted(self.runs.values(), key=lambda x: x.get("timestamp", ""), reverse=True)

    def update_match(self, match_id: str, updates: Dict[str, Any]) -> Optional[MatchRecord]:
        match = self.matches.get(match_id)
        if not match:
            return None
        
        for k, v in updates.items():
            if hasattr(match, k):
                setattr(match, k, v)

        # Also update in the corresponding run
        if match.run_id and match.run_id in self.runs:
            run_matches = self.runs[match.run_id].get("matches", [])
            for i, rm in enumerate(run_matches):
                curr_id = rm.id if isinstance(rm, MatchRecord) else rm.get("id")
                if curr_id == match_id:
                    run_matches[i] = match
                    break

        return match

    def update_exception(self, exc_id: str, updates: Dict[str, Any]) -> Optional[ExceptionRecord]:
        exc = self.exceptions.get(exc_id)
        if not exc:
            return None

        for k, v in updates.items():
            if hasattr(exc, k):
                setattr(exc, k, v)

        # Also update in corresponding run
        if exc.run_id and exc.run_id in self.runs:
            run_excs = self.runs[exc.run_id].get("exceptions", [])
            for i, re in enumerate(run_excs):
                curr_id = re.id if isinstance(re, ExceptionRecord) else re.get("id")
                if curr_id == exc_id:
                    run_excs[i] = exc
                    break

        return exc

    def add_audit_log(self, log: AuditLog) -> None:
        self.audit_logs.insert(0, log)  # Prepend for newest-first order

    def list_audit_logs(self, entity_type: Optional[str] = None) -> List[AuditLog]:
        if entity_type:
            return [l for l in self.audit_logs if l.entity_type == entity_type]
        return self.audit_logs

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.users.get(username.lower())

    def list_periods(self) -> List[Period]:
        return list(self.periods.values())

    def close_period(self, period_id: str, closed_by: str, notes: str) -> Optional[Period]:
        period = self.periods.get(period_id)
        if not period:
            return None
        period.status = "closed"
        period.closed_by = closed_by
        period.closed_at = datetime.now(timezone.utc).isoformat()
        period.summary_notes = notes
        return period

repo = MemoryRepository()
