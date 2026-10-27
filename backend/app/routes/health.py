from fastapi import APIRouter
from backend.app.database import db_manager

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health")
def health_check():
    """
    Returns real application and database connectivity status.
    Uses MongoDB admin ping to verify live connectivity.
    """
    db_status = db_manager.connection_status
    is_db_connected = db_status["connected"]

    return {
        "status": "ok" if is_db_connected else "degraded",
        "database": "connected" if is_db_connected else "disconnected",
        "service": "TraceX API",
        "details": db_status
    }
