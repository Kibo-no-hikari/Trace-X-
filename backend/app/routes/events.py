from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.database import db_manager
from backend.app.models.event import EventResponse
from backend.app.utils.serialization import serialize_docs

router = APIRouter(prefix="/api/investigations/{investigation_id}/events", tags=["Events"])

def check_db():
    if not db_manager.is_connected or db_manager.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is currently unavailable. Please configure MONGODB_URI."
        )
    return db_manager.db

@router.get("", response_model=list[EventResponse])
def get_investigation_events(
    investigation_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    sort: str = Query("asc", pattern="^(asc|desc)$"),
    event_type: Optional[str] = None,
    category: Optional[str] = None,
    classification: Optional[str] = None,
    source_file: Optional[str] = None,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None
):
    db = check_db()

    query = {"investigation_id": investigation_id}

    if event_type:
        query["event_type"] = event_type
    if category:
        query["category"] = category
    if classification:
        query["classification"] = classification
    if source_file:
        query["sourceFile"] = source_file

    if start_time or end_time:
        query["timestamp"] = {}
        if start_time:
            query["timestamp"]["$gte"] = start_time
        if end_time:
            query["timestamp"]["$lte"] = end_time

    sort_direction = 1 if sort == "asc" else -1
    cursor = db.events.find(query).sort("timestamp", sort_direction).skip(skip).limit(limit)
    return serialize_docs(list(cursor))
