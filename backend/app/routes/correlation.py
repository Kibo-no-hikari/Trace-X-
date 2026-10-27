from fastapi import APIRouter, HTTPException, status
from backend.app.database import db_manager
from backend.app.services.correlation_engine import correlation_engine
from backend.app.utils.serialization import serialize_docs

router = APIRouter(tags=["Correlation Engine"])

def check_db():
    if not db_manager.is_connected or db_manager.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is currently unavailable. Please configure MONGODB_URI."
        )
    return db_manager.db

@router.post("/api/investigations/{investigation_id}/correlate")
def run_correlation(investigation_id: str):
    db = check_db()
    cursor = db.events.find({"investigation_id": investigation_id}).sort("timestamp", 1)
    events = serialize_docs(list(cursor))

    correlations = correlation_engine.analyze_events(events)

    # Persist supported links onto events without duplicating
    for corr in correlations:
        src = corr["sourceEventId"]
        tgt = corr["targetEventId"]
        db.events.update_one(
            {"_id": src},
            {"$addToSet": {"supportedLinks": tgt, "related_event_ids": tgt}}
        )
        db.events.update_one(
            {"_id": tgt},
            {"$addToSet": {"supportedLinks": src, "related_event_ids": src}}
        )

    return {
        "investigation_id": investigation_id,
        "mode": "LIVE_BACKEND",
        "relationships_count": len(correlations),
        "correlations": correlations,
        "message": f"Identified and persisted {len(correlations)} explainable correlations."
    }

@router.get("/api/investigations/{investigation_id}/correlations")
def get_correlations(investigation_id: str):
    db = check_db()
    cursor = db.events.find({"investigation_id": investigation_id}).sort("timestamp", 1)
    events = serialize_docs(list(cursor))

    correlations = correlation_engine.analyze_events(events)

    return {
        "investigation_id": investigation_id,
        "mode": "LIVE_BACKEND",
        "nodes": events,
        "links": correlations,
        "total_correlations": len(correlations),
        "principle": "No Evidence, No Claim."
    }

# Backward-compatible endpoint for frontend service
@router.get("/api/v1/correlations")
def get_correlations_generic():
    db = check_db()
    first_inv = db.investigations.find_one({})
    inv_id = str(first_inv["_id"]) if first_inv else "inv-default"
    return get_correlations(inv_id)
