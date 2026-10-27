import math
from typing import Any
from backend.app.utils.datetime_utils import format_display_time

class NormalizationService:
    """Normalizes raw parsed events into standardized forensic event objects."""

    def normalize_event(self, raw_event: dict[str, Any], event_index: int = 0) -> dict[str, Any]:
        dt = raw_event.get("dt_obj")
        display_time = format_display_time(dt)

        # Distribute 3D coordinates based on index and category so nodes render well in Three.js
        angle = (event_index * 1.5) % (2 * math.pi)
        radius = 1.8 + (event_index % 3) * 0.4
        z_offset = ((event_index % 5) - 2) * 0.35

        coords = [
            round(radius * math.cos(angle), 2),
            round(radius * math.sin(angle), 2),
            round(z_offset, 2)
        ]

        category = raw_event.get("category", "SYSTEM")
        severity = raw_event.get("severity", "LOW")

        # Set default forensic findings and limitations text if not provided
        findings = raw_event.get("findings")
        if not findings:
            findings = f"Directly recorded in {raw_event.get('source_filename', 'log file')}. {raw_event.get('description', '')}"

        limitations = raw_event.get("limitations")
        if not limitations:
            if category == "NETWORK":
                limitations = "Network telemetry logs connection metadata and transfer volume only. Payload content cannot be verified without packet decryption."
            elif category == "AUTHENTICATION":
                limitations = "Verifies authentication handshake results. Does not confirm automated tool vs human operator without endpoint keystroke capture."
            elif category == "FILE_SYSTEM":
                limitations = "Records file handle open/access. Does not prove whether entire file was read, exfiltrated, or staged."
            else:
                limitations = "Single telemetry point. Additional corroborating log sources required to confirm intent."

        normalized = {
            **raw_event,
            "displayTime": display_time,
            "coordinates": raw_event.get("coordinates") or coords,
            "findings": findings,
            "limitations": limitations,
            "severity": severity,
            "classification": raw_event.get("classification", "FACT"),
            "supportedLinks": raw_event.get("supportedLinks", []),
            "related_event_ids": raw_event.get("related_event_ids", []),
            "relationship_explanations": raw_event.get("relationship_explanations", []),
        }

        # Remove internal dt_obj
        normalized.pop("dt_obj", None)
        return normalized

normalization_service = NormalizationService()
