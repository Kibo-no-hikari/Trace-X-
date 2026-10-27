from datetime import datetime, timezone
from typing import Optional, Literal
from pydantic import BaseModel, Field

DatasetType = Literal["synthetic", "uploaded", "live"]

class InvestigationCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200, description="Title of the digital forensics investigation")
    description: Optional[str] = Field(None, max_length=2000, description="Scope or background details of the investigation")
    dataset_type: DatasetType = Field("uploaded", description="Synthetic demo vs real uploaded evidence")

class InvestigationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[str] = Field(None, max_length=50)

class InvestigationResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str = "ACTIVE"
    created_at: str
    updated_at: str
    dataset_type: str = "uploaded"
    evidence_count: int = 0
    event_count: int = 0

class InvestigationSummaryResponse(BaseModel):
    investigation_id: str
    title: str
    status: str
    dataset_type: str
    evidence_source_count: int
    total_event_count: int
    event_counts_by_type: dict[str, int]
    event_counts_by_classification: dict[str, int]
    earliest_event_timestamp: Optional[str] = None
    latest_event_timestamp: Optional[str] = None
    relationships_count: int = 0
    processing_status: str = "COMPLETED"
