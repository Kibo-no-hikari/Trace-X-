from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from backend.app.database import db_manager
from backend.app.models.evidence import EvidenceFileResponse, EvidenceUploadResponse
from backend.app.services.evidence_service import evidence_service
from backend.app.utils.serialization import serialize_docs

router = APIRouter(tags=["Evidence Ingestion"])

def check_db():
    if not db_manager.is_connected or db_manager.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is currently unavailable. Please configure MONGODB_URI."
        )
    return db_manager.db

def get_or_create_default_investigation(db) -> str:
    """Helper to ensure an investigation exists when files are uploaded directly."""
    first = db.investigations.find_one({})
    if first:
        return str(first["_id"])
    
    from datetime import datetime, timezone
    new_id = "inv-primary-investigation"
    now_iso = datetime.now(timezone.utc).isoformat()
    db.investigations.insert_one({
        "_id": new_id,
        "title": "Primary Digital Forensics Investigation",
        "description": "Active case investigation with ingested evidence logs.",
        "status": "ACTIVE",
        "dataset_type": "uploaded",
        "evidence_count": 0,
        "event_count": 0,
        "created_at": now_iso,
        "updated_at": now_iso,
    })
    return new_id

@router.post("/api/investigations/{investigation_id}/evidence", response_model=EvidenceUploadResponse)
def upload_evidence_for_investigation(
    investigation_id: str,
    files: List[UploadFile] = File(...)
):
    db = check_db()
    inv = db.investigations.find_one({"_id": investigation_id})
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation with ID '{investigation_id}' not found."
        )

    processed_files = []
    errors = []

    for f in files:
        try:
            res = evidence_service.process_uploaded_file(db, investigation_id, f)
            processed_files.append(res)
        except HTTPException as e:
            errors.append(f"{f.filename}: {e.detail}")
        except Exception as e:
            errors.append(f"{f.filename}: Failed to process ({str(e)})")

    return {
        "status": "success" if processed_files else "error",
        "mode": "LIVE_BACKEND",
        "message": f"Successfully ingested {len(processed_files)} evidence files.",
        "investigation_id": investigation_id,
        "files": processed_files,
        "errors": errors
    }

@router.get("/api/investigations/{investigation_id}/evidence", response_model=List[EvidenceFileResponse])
def list_investigation_evidence(investigation_id: str):
    db = check_db()
    cursor = db.evidence_files.find({"investigation_id": investigation_id}).sort("created_at", -1)
    return serialize_docs(list(cursor))

# Backward-compatible convenience endpoints for frontend compatibility
@router.post("/api/v1/evidence/upload", response_model=EvidenceUploadResponse)
def upload_evidence_generic(files: List[UploadFile] = File(...)):
    db = check_db()
    inv_id = get_or_create_default_investigation(db)
    return upload_evidence_for_investigation(inv_id, files)

@router.get("/api/v1/evidence")
def list_evidence_generic():
    db = check_db()
    cursor = db.evidence_files.find({}).sort("created_at", -1)
    return {
        "mode": "LIVE_BACKEND",
        "data": serialize_docs(list(cursor))
    }
