from .base import BaseRepository
from .memory import MemoryRepository
from .sqlite import SqliteRepository

# Active persistent SQLite repository
repo = SqliteRepository()

__all__ = ["BaseRepository", "MemoryRepository", "SqliteRepository", "repo"]

