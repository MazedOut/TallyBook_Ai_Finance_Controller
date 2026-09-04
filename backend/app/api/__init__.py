from fastapi import APIRouter
from .auth import router as auth_router
from .reconcile import router as reconcile_router
from .matches import router as matches_router
from .exceptions import router as exceptions_router
from .periods import router as periods_router
from .audit import router as audit_router
from .stats import router as stats_router
from .data import router as data_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(reconcile_router)
api_router.include_router(matches_router)
api_router.include_router(exceptions_router)
api_router.include_router(periods_router)
api_router.include_router(audit_router)
api_router.include_router(stats_router)
api_router.include_router(data_router)

__all__ = ["api_router"]
