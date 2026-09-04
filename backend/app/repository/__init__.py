from .base import BaseRepository
from .memory import MemoryRepository, repo as memory_repo
from .supabase import SupabaseRepository

# Active repository with Supabase integration and memory caching
repo = SupabaseRepository(fallback_repo=memory_repo)

__all__ = ["BaseRepository", "MemoryRepository", "SupabaseRepository", "repo"]
