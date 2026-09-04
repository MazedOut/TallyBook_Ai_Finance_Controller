from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from app.models.match import MatchRecord
from app.models.exception import ExceptionRecord
from app.models.period import Period
from app.models.audit import AuditLog
from app.models.user import User

class BaseRepository(ABC):
    @abstractmethod
    def save_run(self, run_data: Dict[str, Any]) -> str:
        pass

    @abstractmethod
    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def list_runs(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def update_match(self, match_id: str, updates: Dict[str, Any]) -> Optional[MatchRecord]:
        pass

    @abstractmethod
    def update_exception(self, exc_id: str, updates: Dict[str, Any]) -> Optional[ExceptionRecord]:
        pass

    @abstractmethod
    def add_audit_log(self, log: AuditLog) -> None:
        pass

    @abstractmethod
    def list_audit_logs(self, entity_type: Optional[str] = None) -> List[AuditLog]:
        pass

    @abstractmethod
    def get_user_by_username(self, username: str) -> Optional[User]:
        pass

    @abstractmethod
    def list_periods(self) -> List[Period]:
        pass

    @abstractmethod
    def close_period(self, period_id: str, closed_by: str, notes: str) -> Optional[Period]:
        pass
