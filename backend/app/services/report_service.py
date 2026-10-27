import uuid
from datetime import datetime, timezone
from typing import Any
from pymongo.database import Database
from backend.app.services.correlation_engine import correlation_engine
from backend.app.utils.serialization import serialize_docs, serialize_doc

class ReportService:
    """Generates and exports formal digital forensics investigation reports."""

    def generate_report(
        self,
        db: Database,
        investigation_id: str,
        investigator_name: str = "Forensic Lead — Security Operations",
        notes: str = None
    ) -> dict[str, Any]:
        inv = db.investigations.find_one({"_id": investigation_id})
        if not inv:
            raise ValueError(f"Investigation with ID '{investigation_id}' not found.")

        # Fetch evidence sources
        evidence_cursor = db.evidence_files.find({"investigation_id": investigation_id})
        evidence_sources = serialize_docs(list(evidence_cursor))

        # Fetch chronological events
        events_cursor = db.events.find({"investigation_id": investigation_id}).sort("timestamp", 1)
        events = serialize_docs(list(events_cursor))

        # Run correlation engine on active events
        correlations = correlation_engine.analyze_events(events)

        # Formulate recorded findings distinguishing FACT, LIKELY, UNKNOWN
        findings = []
        finding_num = 1

        for evt in events:
            findings.append({
                "id": f"FND-{finding_num:02d}",
                "classification": evt.get("classification", "FACT"),
                "title": evt.get("title", "Forensic Event Record"),
                "details": evt.get("findings") or evt.get("details") or evt.get("description", ""),
                "description": evt.get("findings") or evt.get("details") or ""
            })
            finding_num += 1

        for corr in correlations:
            findings.append({
                "id": f"FND-{finding_num:02d}",
                "classification": corr.get("classification", "LIKELY"),
                "title": f"Correlated Sequence ({corr.get('relationship')})",
                "details": corr.get("explanation", ""),
                "description": corr.get("limitation", "")
            })
            finding_num += 1

        # Synthesize forensic limitations
        limitations = [
            "Network perimeter logs verify socket headers and egress volume, but TLS encryption prevents deep payload inspection without private keys.",
            "Log records establish temporal chronology and source addresses. However, correlation alone does not confirm intentionality or malicious intent without endpoint memory artifacts.",
            "Operating strictly under the core doctrine: 'No Evidence, No Claim.'"
        ]

        # Generate conclusion
        fact_count = sum(1 for f in findings if f["classification"] == "FACT")
        likely_count = sum(1 for f in findings if f["classification"] == "LIKELY")
        unknown_count = sum(1 for f in findings if f["classification"] == "UNKNOWN")

        conclusion = (
            f"The available evidence reconstructs a chronological sequence of {len(events)} events across {len(evidence_sources)} sources. "
            f"The investigation established {fact_count} recorded facts and {likely_count} likely correlations. "
            f"In accordance with forensic integrity, {unknown_count} unconfirmed relationship(s) remain categorized as UNKNOWN until decrypted payload or endpoint artifact proof is provided."
        )

        now_iso = datetime.now(timezone.utc).isoformat()
        report_id = f"TRX-{uuid.uuid4().hex[:8].upper()}"

        report_doc = {
            "_id": report_id,
            "reportId": report_id,
            "investigation_id": investigation_id,
            "report_title": f"Forensic Reconstruction — {inv.get('title', 'Investigation')}",
            "title": f"Forensic Reconstruction — {inv.get('title', 'Investigation')}",
            "generated_at": now_iso,
            "generatedAt": now_iso,
            "investigator": investigator_name,
            "scope": f"Chronological reconstruction across {len(evidence_sources)} evidence logs.",
            "tagline": "Reconstruct the Incident. Follow the Evidence.",
            "corePrinciple": "No Evidence, No Claim.",
            "evidenceSources": evidence_sources,
            "timelineEvents": events,
            "correlations": correlations,
            "recordedFindings": findings,
            "limitations": limitations,
            "conclusion": conclusion,
            "dataset_type": inv.get("dataset_type", "uploaded"),
            "notes": notes
        }

        db.reports.insert_one(report_doc)
        return serialize_doc(report_doc)

report_service = ReportService()
