import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import BinaryIO, Any
from fastapi import UploadFile, HTTPException
from pymongo.database import Database
from backend.app.config import settings
from backend.app.utils.file_validation import compute_sha256, validate_uploaded_file
from backend.app.services.log_parser import log_parser_service
from backend.app.services.normalization import normalization_service

class EvidenceService:
    """Manages secure file ingest, hashing, parsing, and database storage."""

    def process_uploaded_file(
        self,
        db: Database,
        investigation_id: str,
        upload_file: UploadFile
    ) -> dict[str, Any]:
        filename = upload_file.filename or "unknown_evidence.log"
        safe_suffix = Path(filename).suffix.lower()

        # Temporary file path
        temp_id = f"ev_upload_{uuid.uuid4().hex}"
        temp_path = settings.TEMP_UPLOAD_DIR / f"{temp_id}{safe_suffix}"

        bytes_written = 0
        try:
            with open(temp_path, "wb") as f:
                while chunk := upload_file.file.read(65536):
                    bytes_written += len(chunk)
                    f.write(chunk)

            # Validate size and extension
            is_valid, err_msg = validate_uploaded_file(filename, bytes_written)
            if not is_valid:
                raise HTTPException(status_code=400, detail=err_msg)

            # Compute cryptographic hash for chain of custody
            sha256_hash = compute_sha256(temp_path)

            # Check if this exact file was already uploaded to this investigation
            existing = db.evidence_files.find_one({
                "investigation_id": investigation_id,
                "content_hash": sha256_hash
            })
            if existing:
                return {
                    "id": str(existing["_id"]),
                    "investigation_id": investigation_id,
                    "fileName": filename,
                    "original_filename": filename,
                    "fileType": safe_suffix.lstrip("."),
                    "category": existing.get("category", "SYSTEM"),
                    "size": f"{bytes_written / (1024 * 1024):.2f} MB",
                    "sizeBytes": bytes_written,
                    "sha256": sha256_hash,
                    "uploadTime": existing.get("uploadTime", datetime.now(timezone.utc).isoformat()),
                    "status": "PARSED",
                    "processing_status": "COMPLETED",
                    "eventCount": existing.get("eventCount", 0),
                    "sourceHost": existing.get("sourceHost", "srv-prod01"),
                    "description": "File already ingested previously.",
                    "parsing_errors": []
                }

            # Parse records
            raw_events, parse_errors = log_parser_service.parse_file(temp_path, filename)

            # Ingest evidence file metadata document
            now_iso = datetime.now(timezone.utc).isoformat()
            evidence_id = f"ev-{uuid.uuid4().hex[:8]}"

            # Detect broad category from filename or events
            file_category = "SYSTEM"
            if "auth" in filename.lower():
                file_category = "AUTHENTICATION"
            elif "file" in filename.lower() or "audit" in filename.lower():
                file_category = "FILE_SYSTEM"
            elif "net" in filename.lower() or "zeek" in filename.lower() or "flow" in filename.lower():
                file_category = "NETWORK"

            evidence_doc = {
                "_id": evidence_id,
                "investigation_id": investigation_id,
                "fileName": filename,
                "original_filename": filename,
                "fileType": safe_suffix.lstrip("."),
                "category": file_category,
                "size": f"{bytes_written / (1024 * 1024):.2f} MB",
                "sizeBytes": bytes_written,
                "content_hash": sha256_hash,
                "sha256": sha256_hash,
                "upload_status": "COMPLETED",
                "uploadTime": now_iso,
                "status": "PARSED" if raw_events else "PARSED_WITH_WARNINGS",
                "processing_status": "COMPLETED",
                "eventCount": len(raw_events),
                "sourceHost": "srv-prod-ingest",
                "parsing_errors": parse_errors,
                "description": f"Ingested {len(raw_events)} forensic events from {filename}.",
                "created_at": now_iso
            }

            db.evidence_files.insert_one(evidence_doc)

            # Normalize and store event documents
            inserted_events = []
            for idx, raw_evt in enumerate(raw_events):
                norm_evt = normalization_service.normalize_event(raw_evt, event_index=idx)
                event_id = f"EVT-{uuid.uuid4().hex[:8]}"
                event_doc = {
                    "_id": event_id,
                    "investigation_id": investigation_id,
                    "evidence_id": evidence_id,
                    **norm_evt,
                    "created_at": now_iso
                }
                inserted_events.append(event_doc)

            if inserted_events:
                db.events.insert_many(inserted_events)

            # Update investigation counter metrics
            db.investigations.update_one(
                {"_id": investigation_id},
                {
                    "$inc": {"evidence_count": 1, "event_count": len(inserted_events)},
                    "$set": {"updated_at": now_iso}
                }
            )

            return {
                "id": evidence_id,
                "investigation_id": investigation_id,
                "fileName": filename,
                "original_filename": filename,
                "fileType": safe_suffix.lstrip("."),
                "category": file_category,
                "size": f"{bytes_written / (1024 * 1024):.2f} MB",
                "sizeBytes": bytes_written,
                "sha256": sha256_hash,
                "uploadTime": now_iso,
                "status": evidence_doc["status"],
                "processing_status": "COMPLETED",
                "eventCount": len(inserted_events),
                "sourceHost": evidence_doc["sourceHost"],
                "description": evidence_doc["description"],
                "parsing_errors": parse_errors
            }

        finally:
            # Clean up secure temporary upload file
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except Exception:
                    pass

evidence_service = EvidenceService()
