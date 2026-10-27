from typing import Optional, Any
from pydantic import BaseModel, Field

class EvidenceFileResponse(BaseModel):
    id: str
    investigation_id: str
    fileName: str = Field(..., description="Original filename matching frontend expected key")
    original_filename: str
    fileType: str
    category: str = "SYSTEM"
    size: str
    sizeBytes: int
    sha256: str
    uploadTime: str
    status: str = "PARSED"
    processing_status: str = "COMPLETED"
    eventCount: int = 0
    sourceHost: str = "unknown-host"
    description: Optional[str] = None
    parsing_errors: list[str] = []
    source_metadata: dict[str, Any] = {}

class EvidenceUploadResponse(BaseModel):
    status: str = "success"
    mode: str = "LIVE_BACKEND"
    message: str
    investigation_id: str
    files: list[EvidenceFileResponse]
    errors: list[str] = []
