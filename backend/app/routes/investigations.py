import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.database import db_manager
from backend.app.models.investigation import (
    InvestigationCreate,
    InvestigationUpdate,
    InvestigationResponse,
    InvestigationSummaryResponse,
)
from backend.app.utils.serialization import serialize_doc, serialize_docs

router = APIRouter(prefix="/api/investigations", tags=["Investigations"])

def check_db():
    if not db_manager.is_connected or db_manager.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is currently unavailable. Configure MONGODB_URI to enable real database operations."
        )
    return db_manager.db

@router.post("", response_model=InvestigationResponse, status_code=status.HTTP_201_CREATED)
def create_investigation(payload: InvestigationCreate):
    db = check_db()
    now_iso = datetime.now(timezone.utc).isoformat()
    inv_id = f"inv-{uuid.uuid4().hex[:10]}"

    doc = {
        "_id": inv_id,
        "title": payload.title,
        "description": payload.description,
        "status": "ACTIVE",
        "dataset_type": payload.dataset_type,
        "evidence_count": 0,
        "event_count": 0,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    db.investigations.insert_one(doc)
    return serialize_doc(doc)

@router.get("", response_model=list[InvestigationResponse])
def list_investigations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    db = check_db()
    cursor = db.investigations.find({}).sort("created_at", -1).skip(skip).limit(limit)
    return serialize_docs(list(cursor))

@router.get("/{investigation_id}", response_model=InvestigationResponse)
def get_investigation(investigation_id: str):
    db = check_db()
    doc = db.investigations.find_one({"_id": investigation_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation with ID '{investigation_id}' not found."
        )
    return serialize_doc(doc)

@router.patch("/{investigation_id}", response_model=InvestigationResponse)
def update_investigation(investigation_id: str, payload: InvestigationUpdate):
    db = check_db()
    doc = db.investigations.find_one({"_id": investigation_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation with ID '{investigation_id}' not found."
        )

    updates = {}
    if payload.title is not None:
        updates["title"] = payload.title
    if payload.description is not None:
        updates["description"] = payload.description
    if payload.status is not None:
        updates["status"] = payload.status

    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        db.investigations.update_one({"_id": investigation_id}, {"$set": updates})
        doc.update(updates)

    return serialize_doc(doc)

@router.get("/{investigation_id}/summary", response_model=InvestigationSummaryResponse)
def get_investigation_summary(investigation_id: str):
    db = check_db()
    inv = db.investigations.find_one({"_id": investigation_id})
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation with ID '{investigation_id}' not found."
        )

    evidence_count = db.evidence_files.count_documents({"investigation_id": investigation_id})
    total_events = db.events.count_documents({"investigation_id": investigation_id})

    # Event counts by category/type
    pipeline_types = [
        {"$match": {"investigation_id": investigation_id}},
        {"$group": {"_id": "$event_type", "count": {"$sum": 1}}}
    ]
    type_counts = {item["_id"]: item["count"] for item in db.events.aggregate(pipeline_types) if item.get("_id")}

    # Event counts by classification (FACT, LIKELY, UNKNOWN)
    pipeline_class = [
        {"$match": {"investigation_id": investigation_id}},
        {"$group": {"_id": "$classification", "count": {"$sum": 1}}}
    ]
    class_counts = {item["_id"]: item["count"] for item in db.events.aggregate(pipeline_class) if item.get("_id")}

    # Earliest & latest timestamps
    earliest_doc = db.events.find_one({"investigation_id": investigation_id}, sort=[("timestamp", 1)])
    latest_doc = db.events.find_one({"investigation_id": investigation_id}, sort=[("timestamp", -1)])

    earliest_ts = earliest_doc.get("timestamp") if earliest_doc else None
    latest_ts = latest_doc.get("timestamp") if latest_doc else None

    # Relationship count from correlations
    from backend.app.services.correlation_engine import correlation_engine
    events = serialize_docs(list(db.events.find({"investigation_id": investigation_id})))
    correlations = correlation_engine.analyze_events(events)

    return {
        "investigation_id": investigation_id,
        "title": inv.get("title", "Investigation"),
        "status": inv.get("status", "ACTIVE"),
        "dataset_type": inv.get("dataset_type", "uploaded"),
        "evidence_source_count": evidence_count,
        "total_event_count": total_events,
        "event_counts_by_type": type_counts,
        "event_counts_by_classification": class_counts,
        "earliest_event_timestamp": earliest_ts,
        "latest_event_timestamp": latest_ts,
        "relationships_count": len(correlations),
        "processing_status": "COMPLETED"
    }

@router.delete("/{investigation_id}")
def delete_investigation(investigation_id: str):
    db = check_db()
    inv = db.investigations.find_one({"_id": investigation_id})
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation with ID '{investigation_id}' not found."
        )

    # Delete cascading associated records
    db.events.delete_many({"investigation_id": investigation_id})
    db.evidence_files.delete_many({"investigation_id": investigation_id})
    db.reports.delete_many({"investigation_id": investigation_id})
    db.investigations.delete_one({"_id": investigation_id})

    return {
        "status": "success",
        "message": f"Investigation '{investigation_id}' and all associated records have been deleted."
    }
