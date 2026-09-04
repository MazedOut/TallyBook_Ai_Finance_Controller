import sqlite3
import json
import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from app.models.match import MatchRecord
from app.models.exception import ExceptionRecord
from app.models.period import Period
from app.models.audit import AuditLog
from app.models.user import User, UserRole
from app.repository.base import BaseRepository


class SqliteRepository(BaseRepository):
    """
    Self-contained, fast, ACID-compliant SQLite repository for Tallybook.
    Requires zero cloud credentials or external database setups.
    """

    def __init__(self, db_path: str = "./app/data/tallybook.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(self.db_path)), exist_ok=True)
        self._init_db()
        self._init_defaults()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS reconciliation_runs (
                    run_id TEXT PRIMARY KEY,
                    timestamp TEXT,
                    run_data TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS reconciliation_matches (
                    id TEXT PRIMARY KEY,
                    run_id TEXT,
                    bank_description TEXT,
                    bank_amount REAL,
                    bank_date TEXT,
                    status TEXT,
                    resolved_by TEXT,
                    match_data TEXT,
                    FOREIGN KEY (run_id) REFERENCES reconciliation_runs(run_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS reconciliation_exceptions (
                    id TEXT PRIMARY KEY,
                    run_id TEXT,
                    source_type TEXT,
                    transaction_id TEXT,
                    date TEXT,
                    amount REAL,
                    description TEXT,
                    category TEXT,
                    status TEXT,
                    approval_required INTEGER,
                    exception_data TEXT,
                    FOREIGN KEY (run_id) REFERENCES reconciliation_runs(run_id)
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS accounting_periods (
                    id TEXT PRIMARY KEY,
                    period_data TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT,
                    entity_type TEXT,
                    log_data TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY,
                    user_data TEXT
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS import_history (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT,
                    file_name TEXT,
                    source_type TEXT,
                    total_records INTEGER,
                    imported_records INTEGER,
                    warning_count INTEGER,
                    error_count INTEGER,
                    status TEXT,
                    details TEXT
                )
            """)
            conn.commit()

    def _init_defaults(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            # Seed users if table is empty
            cursor.execute("SELECT COUNT(*) FROM users")
            if cursor.fetchone()[0] == 0:
                from passlib.hash import pbkdf2_sha256
                default_users = [
                    User(
                        id="usr-analyst-01",
                        username="analyst",
                        email="sarah.chen@tallybook.io",
                        full_name="Sarah Chen",
                        role=UserRole.ANALYST,
                        hashed_password=pbkdf2_sha256.hash("analyst123"),
                        avatar_initials="SC",
                        department="Operations Accounting"
                    ),
                    User(
                        id="usr-controller-01",
                        username="controller",
                        email="marcus.vance@tallybook.io",
                        full_name="Marcus Vance",
                        role=UserRole.CONTROLLER,
                        hashed_password=pbkdf2_sha256.hash("controller123"),
                        avatar_initials="MV",
                        department="Financial Controller Office"
                    ),
                    User(
                        id="usr-auditor-01",
                        username="auditor",
                        email="elena.rostova@deloitte-audit.com",
                        full_name="Elena Rostova",
                        role=UserRole.AUDITOR,
                        hashed_password=pbkdf2_sha256.hash("auditor123"),
                        avatar_initials="ER",
                        department="Statutory Audit Partner"
                    ),
                    User(
                        id="usr-admin-01",
                        username="admin",
                        email="sysadmin@tallybook.io",
                        full_name="Alex Mercer",
                        role=UserRole.ADMIN,
                        hashed_password=pbkdf2_sha256.hash("admin123"),
                        avatar_initials="AM",
                        department="IT & Enterprise Systems"
                    )
                ]
                for u in default_users:
                    cursor.execute(
                        "INSERT INTO users (username, user_data) VALUES (?, ?)",
                        (u.username.lower(), json.dumps(u.model_dump()))
                    )

            # Seed accounting periods if table is empty
            cursor.execute("SELECT COUNT(*) FROM accounting_periods")
            if cursor.fetchone()[0] == 0:
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
                for p in [p1, p2]:
                    cursor.execute(
                        "INSERT INTO accounting_periods (id, period_data) VALUES (?, ?)",
                        (p.id, json.dumps(p.model_dump()))
                    )

            # Seed initial audit log if table is empty
            cursor.execute("SELECT COUNT(*) FROM audit_logs")
            if cursor.fetchone()[0] == 0:
                init_log = AuditLog(
                    id=f"aud-{uuid.uuid4().hex[:8]}",
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    actor_id="system",
                    actor_name="Tallybook SQLite Engine",
                    actor_role="system",
                    action="INITIALIZE_SQLITE_STORAGE",
                    entity_type="system",
                    entity_id="sys-sqlite-01",
                    notes="SQLite database initialized at app/data/tallybook.db"
                )
                cursor.execute(
                    "INSERT INTO audit_logs (id, timestamp, entity_type, log_data) VALUES (?, ?, ?, ?)",
                    (init_log.id, init_log.timestamp, init_log.entity_type, json.dumps(init_log.model_dump()))
                )

            conn.commit()

    def save_run(self, run_data: Dict[str, Any]) -> str:
        run_id = run_data.get("run_id") or f"run-{uuid.uuid4().hex[:8]}"
        run_data["run_id"] = run_id
        if "timestamp" not in run_data:
            run_data["timestamp"] = datetime.now(timezone.utc).isoformat()

        def serialize_item(item):
            if hasattr(item, "model_dump"):
                return item.model_dump()
            return item

        serialized_run = {
            k: [serialize_item(x) for x in v] if isinstance(v, list) else (serialize_item(v) if hasattr(v, "model_dump") else v)
            for k, v in run_data.items()
        }

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO reconciliation_runs (run_id, timestamp, run_data) VALUES (?, ?, ?)",
                (run_id, run_data["timestamp"], json.dumps(serialized_run))
            )

            # Insert/Replace matches
            matches = run_data.get("matches", [])
            for m in matches:
                m_dict = m.model_dump() if hasattr(m, "model_dump") else m
                m_id = m_dict.get("id")
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO reconciliation_matches 
                    (id, run_id, bank_description, bank_amount, bank_date, status, resolved_by, match_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        m_id,
                        run_id,
                        m_dict.get("bank_description", ""),
                        float(m_dict.get("bank_amount", 0)),
                        m_dict.get("bank_date", ""),
                        m_dict.get("status", "accepted"),
                        m_dict.get("resolved_by", ""),
                        json.dumps(m_dict)
                    )
                )

            # Insert/Replace exceptions
            exceptions = run_data.get("exceptions", [])
            for exc in exceptions:
                exc_dict = exc.model_dump() if hasattr(exc, "model_dump") else exc
                exc_id = exc_dict.get("id")
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO reconciliation_exceptions
                    (id, run_id, source_type, transaction_id, date, amount, description, category, status, approval_required, exception_data)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        exc_id,
                        run_id,
                        exc_dict.get("source_type", "bank"),
                        exc_dict.get("transaction_id", ""),
                        exc_dict.get("date", ""),
                        float(exc_dict.get("amount", 0)),
                        exc_dict.get("description", ""),
                        exc_dict.get("category", "unclassified"),
                        exc_dict.get("status", "open"),
                        1 if exc_dict.get("approval_required") else 0,
                        json.dumps(exc_dict)
                    )
                )

            conn.commit()

        return run_id

    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT run_data FROM reconciliation_runs WHERE run_id = ?", (run_id,))
            row = cursor.fetchone()
            if not row:
                return None
            run_dict = json.loads(row["run_data"])

            cursor.execute("SELECT match_data FROM reconciliation_matches WHERE run_id = ?", (run_id,))
            match_rows = cursor.fetchall()
            if match_rows:
                run_dict["matches"] = [MatchRecord(**json.loads(r["match_data"])) for r in match_rows]

            cursor.execute("SELECT exception_data FROM reconciliation_exceptions WHERE run_id = ?", (run_id,))
            exc_rows = cursor.fetchall()
            if exc_rows:
                run_dict["exceptions"] = [ExceptionRecord(**json.loads(r["exception_data"])) for r in exc_rows]

            return run_dict

    def list_runs(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT run_data FROM reconciliation_runs ORDER BY timestamp DESC")
            rows = cursor.fetchall()
            return [json.loads(r["run_data"]) for r in rows]

    def update_match(self, match_id: str, updates: Dict[str, Any]) -> Optional[MatchRecord]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT match_data, run_id FROM reconciliation_matches WHERE id = ?", (match_id,))
            row = cursor.fetchone()
            if not row:
                return None

            m_dict = json.loads(row["match_data"])
            run_id = row["run_id"]
            m_dict.update(updates)
            updated_record = MatchRecord(**m_dict)

            cursor.execute(
                "UPDATE reconciliation_matches SET status = ?, resolved_by = ?, match_data = ? WHERE id = ?",
                (
                    m_dict.get("status", "accepted"),
                    m_dict.get("resolved_by", ""),
                    json.dumps(m_dict),
                    match_id
                )
            )

            if run_id:
                cursor.execute("SELECT run_data FROM reconciliation_runs WHERE run_id = ?", (run_id,))
                run_row = cursor.fetchone()
                if run_row:
                    run_dict = json.loads(run_row["run_data"])
                    matches = run_dict.get("matches", [])
                    for i, m in enumerate(matches):
                        curr_id = m.get("id") if isinstance(m, dict) else getattr(m, "id", None)
                        if curr_id == match_id:
                            matches[i] = m_dict
                            break
                    run_dict["matches"] = matches
                    cursor.execute("UPDATE reconciliation_runs SET run_data = ? WHERE run_id = ?", (json.dumps(run_dict), run_id))

            conn.commit()
            return updated_record

    def update_exception(self, exc_id: str, updates: Dict[str, Any]) -> Optional[ExceptionRecord]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT exception_data, run_id FROM reconciliation_exceptions WHERE id = ?", (exc_id,))
            row = cursor.fetchone()
            if not row:
                return None

            exc_dict = json.loads(row["exception_data"])
            run_id = row["run_id"]
            exc_dict.update(updates)
            updated_record = ExceptionRecord(**exc_dict)

            cursor.execute(
                "UPDATE reconciliation_exceptions SET status = ?, exception_data = ? WHERE id = ?",
                (exc_dict.get("status", "open"), json.dumps(exc_dict), exc_id)
            )

            if run_id:
                cursor.execute("SELECT run_data FROM reconciliation_runs WHERE run_id = ?", (run_id,))
                run_row = cursor.fetchone()
                if run_row:
                    run_dict = json.loads(run_row["run_data"])
                    excs = run_dict.get("exceptions", [])
                    for i, e in enumerate(excs):
                        curr_id = e.get("id") if isinstance(e, dict) else getattr(e, "id", None)
                        if curr_id == exc_id:
                            excs[i] = exc_dict
                            break
                    run_dict["exceptions"] = excs
                    cursor.execute("UPDATE reconciliation_runs SET run_data = ? WHERE run_id = ?", (json.dumps(run_dict), run_id))

            conn.commit()
            return updated_record

    def add_audit_log(self, log: AuditLog) -> None:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO audit_logs (id, timestamp, entity_type, log_data) VALUES (?, ?, ?, ?)",
                (log.id, log.timestamp, log.entity_type, json.dumps(log.model_dump()))
            )
            conn.commit()

    def list_audit_logs(self, entity_type: Optional[str] = None) -> List[AuditLog]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            if entity_type:
                cursor.execute("SELECT log_data FROM audit_logs WHERE entity_type = ? ORDER BY rowid DESC", (entity_type,))
            else:
                cursor.execute("SELECT log_data FROM audit_logs ORDER BY rowid DESC")
            rows = cursor.fetchall()
            return [AuditLog(**json.loads(r["log_data"])) for r in rows]

    def get_user_by_username(self, username: str) -> Optional[User]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT user_data FROM users WHERE username = ?", (username.lower(),))
            row = cursor.fetchone()
            if not row:
                return None
            return User(**json.loads(row["user_data"]))

    def list_periods(self) -> List[Period]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT period_data FROM accounting_periods ORDER BY id ASC")
            rows = cursor.fetchall()
            return [Period(**json.loads(r["period_data"])) for r in rows]

    def close_period(self, period_id: str, closed_by: str, notes: str) -> Optional[Period]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT period_data FROM accounting_periods WHERE id = ?", (period_id,))
            row = cursor.fetchone()
            if not row:
                return None

            p_dict = json.loads(row["period_data"])
            p_dict["status"] = "locked"
            p_dict["closed_by"] = closed_by
            p_dict["closed_at"] = datetime.now(timezone.utc).isoformat()
            p_dict["summary_notes"] = notes
            period = Period(**p_dict)

            cursor.execute(
                "UPDATE accounting_periods SET period_data = ? WHERE id = ?",
                (json.dumps(p_dict), period_id)
            )
            conn.commit()
            return period

    def add_import_log(self, log_dict: Dict[str, Any]) -> str:
        log_id = log_dict.get("id") or f"imp-{uuid.uuid4().hex[:8]}"
        log_dict["id"] = log_id
        if "timestamp" not in log_dict:
            log_dict["timestamp"] = datetime.now(timezone.utc).isoformat()

        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO import_history 
                (id, timestamp, file_name, source_type, total_records, imported_records, warning_count, error_count, status, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    log_id,
                    log_dict["timestamp"],
                    log_dict.get("file_name", "manual_entry"),
                    log_dict.get("source_type", "bank"),
                    int(log_dict.get("total_records", 0)),
                    int(log_dict.get("imported_records", 0)),
                    int(log_dict.get("warning_count", 0)),
                    int(log_dict.get("error_count", 0)),
                    log_dict.get("status", "completed"),
                    json.dumps(log_dict.get("details", {}))
                )
            )
            conn.commit()
        return log_id

    def list_import_logs(self) -> List[Dict[str, Any]]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM import_history ORDER BY timestamp DESC")
            rows = cursor.fetchall()
            return [
                {
                    "id": r["id"],
                    "timestamp": r["timestamp"],
                    "file_name": r["file_name"],
                    "source_type": r["source_type"],
                    "total_records": r["total_records"],
                    "imported_records": r["imported_records"],
                    "warning_count": r["warning_count"],
                    "error_count": r["error_count"],
                    "status": r["status"],
                    "details": json.loads(r["details"]) if r["details"] else {}
                }
                for r in rows
            ]

    def get_exception(self, exc_id: str) -> Optional[ExceptionRecord]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT exception_data FROM reconciliation_exceptions WHERE id = ?", (exc_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return ExceptionRecord(**json.loads(row["exception_data"]))

    def list_all_exceptions(self) -> List[ExceptionRecord]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT exception_data FROM reconciliation_exceptions ORDER BY rowid DESC")
            rows = cursor.fetchall()
            return [ExceptionRecord(**json.loads(r["exception_data"])) for r in rows]

    @property
    def exceptions(self) -> Dict[str, ExceptionRecord]:
        return {e.id: e for e in self.list_all_exceptions()}
