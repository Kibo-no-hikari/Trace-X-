from typing import Optional, Any
from pydantic import BaseModel, Field

class FindingItem(BaseModel):
    id: str
    classification: str = Field(..., description="FACT, LIKELY, or UNKNOWN")
    title: str
    details: str
    description: Optional[str] = None

class CorrelationLink(BaseModel):
    id: str
    sourceEventId: str
    targetEventId: str
    relationship: str
    classification: str = "LIKELY"
    strength: str = "MEDIUM"
    explanation: str
    limitation: str

class ReportCreate(BaseModel):
    title: Optional[str] = None
    investigator: Optional[str] = "Forensic Lead — Security Operations"
    notes: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    reportId: str
    investigation_id: str
    report_title: str
    title: str
    generated_at: str
    generatedAt: str
    investigator: str
    scope: str
    tagline: str = "Reconstruct the Incident. Follow the Evidence."
    corePrinciple: str = "No Evidence, No Claim."
    evidenceSources: list[dict[str, Any]]
    timelineEvents: list[dict[str, Any]]
    correlations: list[CorrelationLink]
    recordedFindings: list[FindingItem]
    limitations: list[str]
    conclusion: str
    dataset_type: str = "uploaded"
