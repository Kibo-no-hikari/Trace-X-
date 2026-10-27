from typing import Optional, Any
from pydantic import BaseModel, Field

class EventResponse(BaseModel):
    id: str
    investigation_id: str
    evidence_id: Optional[str] = None
    timestamp: str
    original_timestamp: Optional[str] = None
    displayTime: str
    title: str
    eventType: str
    event_type: str
    category: str = "SYSTEM"
    sourceFile: str
    source_filename: str
    sourceHost: str = "srv-prod01"
    severity: str = "LOW"
    classification: str = "FACT"
    source_record_reference: Optional[str] = None
    source_record_number: Optional[int] = None
    actorIp: Optional[str] = None
    source_ip: Optional[str] = None
    destinationIp: Optional[str] = None
    destination_ip: Optional[str] = None
    destinationPort: Optional[int] = None
    userAccount: Optional[str] = None
    username: Optional[str] = None
    targetFile: Optional[str] = None
    file_path: Optional[str] = None
    transferSize: Optional[str] = None
    bytes_transferred: Optional[int] = None
    details: str
    description: str
    rawRecord: str
    raw_record: str
    findings: Optional[str] = None
    limitations: Optional[str] = None
    supportedLinks: list[str] = []
    related_event_ids: list[str] = []
    relationship_explanations: list[str] = []
    coordinates: list[float] = [0.0, 0.0, 0.0]
    normalized_fields: dict[str, Any] = {}
    created_at: Optional[str] = None

class TimelineResponse(BaseModel):
    investigation_id: str
    events: list[EventResponse]
    totalCount: int
    warning: str = "Possible incident sequence. Correlation does not prove causation or confirm data theft."
    dataset_type: str = "uploaded"
