"""TraceX Backend API Routes Package."""
from backend.app.routes.health import router as health_router
from backend.app.routes.investigations import router as investigations_router
from backend.app.routes.evidence import router as evidence_router
from backend.app.routes.events import router as events_router
from backend.app.routes.timeline import router as timeline_router
from backend.app.routes.correlation import router as correlation_router
from backend.app.routes.reports import router as reports_router

__all__ = [
    "health_router",
    "investigations_router",
    "evidence_router",
    "events_router",
    "timeline_router",
    "correlation_router",
    "reports_router",
]
