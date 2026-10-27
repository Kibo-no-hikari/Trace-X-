from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.database import db_manager
from backend.app.services.correlation_engine import correlation_engine
from backend.app.utils.serialization import serialize_docs

router = APIRouter(tags=["Incident Timeline"])

def check_db():
    if not db_manager.is_connected or db_manager.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is currently unavailable. Please configure MONGODB_URI."
        )
    return db_manager.db

@router.get("/api/investigations/{investigation_id}/timeline")
def get_chronological_timeline(
    investigation_id: str,
    category: Optional[str] = None,
    source_file: Optional[str] = None
):
    db = check_db()
    query = {"investigation_id": investigation_id}

    if category and category != "ALL":
        query["category"] = category
    if source_file and source_file != "ALL":
        query["sourceFile"] = source_file

    cursor = db.events.find(query).sort("timestamp", 1)
    events = serialize_docs(list(cursor))
    correlations = correlation_engine.analyze_events(events)

    inv = db.investigations.find_one({"_id": investigation_id})

    return {
        "investigation_id": investigation_id,
        "mode": "LIVE_BACKEND",
        "dataset_type": inv.get("dataset_type", "uploaded") if inv else "uploaded",
        "events": events,
        "data": events, # compatibility with demoEvents
        "correlations": correlations,
        "totalCount": len(events),
        "warning": "Possible incident sequence. Correlation does not prove causation or confirm data theft. Synthetic demonstration data."
    }

# Backward-compatible endpoint for frontend service
@router.get("/api/v1/timeline")
def get_timeline_generic(
    category: Optional[str] = None,
    source_file: Optional[str] = None
):
    db = check_db()
    # Use first available investigation or find all events
    first_inv = db.investigations.find_one({})
    inv_id = str(first_inv["_id"]) if first_inv else "inv-default"
    return get_chronological_timeline(inv_id, category, source_file)
