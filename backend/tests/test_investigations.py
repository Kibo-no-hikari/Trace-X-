from backend.app.models.investigation import InvestigationCreate, InvestigationUpdate
from backend.app.services.correlation_engine import correlation_engine

def test_investigation_model_validation():
    inv = InvestigationCreate(
        title="Unauthorized Intrusion Analysis",
        description="Forensic investigation into PAM brute-force and data transfer.",
        dataset_type="uploaded"
    )
    assert inv.title == "Unauthorized Intrusion Analysis"
    assert inv.dataset_type == "uploaded"

def test_correlation_engine_rules():
    # Test Rule 1: Auth failure followed by auth success from same IP
    events = [
        {
            "id": "EVT-01",
            "timestamp": "2026-10-27T02:03:00Z",
            "eventType": "AUTH_FAILURE",
            "category": "AUTHENTICATION",
            "actorIp": "198.51.100.44"
        },
        {
            "id": "EVT-02",
            "timestamp": "2026-10-27T02:05:00Z",
            "eventType": "AUTH_SUCCESS",
            "category": "AUTHENTICATION",
            "actorIp": "198.51.100.44"
        },
        {
            "id": "EVT-03",
            "timestamp": "2026-10-27T02:07:00Z",
            "eventType": "FILE_ACCESS",
            "category": "FILE_SYSTEM",
            "userAccount": "admin"
        },
        {
            "id": "EVT-04",
            "timestamp": "2026-10-27T02:09:00Z",
            "eventType": "NETWORK_EGRESS",
            "category": "NETWORK",
            "destinationIp": "203.0.113.89"
        }
    ]

    correlations = correlation_engine.analyze_events(events)
    assert len(correlations) >= 3

    # Check classifications
    classifications = [c["classification"] for c in correlations]
    assert "LIKELY" in classifications
    assert "UNKNOWN" in classifications # Network egress payload is UNKNOWN
