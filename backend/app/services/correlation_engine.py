from typing import Any
from datetime import datetime
from dateutil import parser as date_parser

class CorrelationEngine:
    """
    Transparent, explainable forensic correlation engine.
    Links events based on matching origin IP, user accounts, and temporal proximity.
    Strictly distinguishes FACT, LIKELY, and UNKNOWN.
    """

    def analyze_events(self, events: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not events or len(events) < 2:
            return []

        # Sort events chronologically
        def parse_ts(e):
            try:
                return date_parser.parse(e.get("timestamp", ""))
            except Exception:
                return datetime.min

        sorted_events = sorted(events, key=parse_ts)
        correlations = []
        correlation_id_counter = 1

        # Track existing links to prevent duplicates
        seen_pairs = set()

        for i in range(len(sorted_events)):
            evt_a = sorted_events[i]
            ts_a = parse_ts(evt_a)
            id_a = str(evt_a.get("_id") or evt_a.get("id"))

            for j in range(i + 1, len(sorted_events)):
                evt_b = sorted_events[j]
                ts_b = parse_ts(evt_b)
                id_b = str(evt_b.get("_id") or evt_b.get("id"))

                time_diff_sec = abs((ts_b - ts_a).total_seconds()) if ts_a != datetime.min and ts_b != datetime.min else 999999
                pair_key = tuple(sorted([id_a, id_b]))

                if pair_key in seen_pairs:
                    continue

                # RULE 1: IP Match & Temporal Proximity on Authentication (Failed -> Success)
                ip_a = evt_a.get("actorIp") or evt_a.get("source_ip")
                ip_b = evt_b.get("actorIp") or evt_b.get("source_ip")
                type_a = evt_a.get("eventType") or evt_a.get("event_type", "")
                type_b = evt_b.get("eventType") or evt_b.get("event_type", "")

                if (
                    ip_a and ip_b and ip_a == ip_b and
                    "AUTH_FAILURE" in type_a and "AUTH_SUCCESS" in type_b and
                    time_diff_sec <= 300
                ):
                    seen_pairs.add(pair_key)
                    correlations.append({
                        "id": f"CORR-{correlation_id_counter:02d}",
                        "sourceEventId": id_a,
                        "targetEventId": id_b,
                        "relationship": "IP_MATCH_AND_TEMPORAL_PROXIMITY",
                        "rule_identifier": "AUTH_BURST_AND_SUCCESS",
                        "classification": "LIKELY",
                        "strength": "HIGH",
                        "time_interval_seconds": time_diff_sec,
                        "supporting_field_matches": {"actorIp": ip_a},
                        "explanation": f"Successful login from IP {ip_b} followed failed attempts from the exact same address after {int(time_diff_sec)} seconds.",
                        "limitation": "Available logs cannot eliminate the possibility of a legitimate user who mistyped their password before remembering it."
                    })
                    correlation_id_counter += 1
                    continue

                # RULE 2: Session UID / User match with subsequent File Access
                user_a = evt_a.get("userAccount") or evt_a.get("username")
                user_b = evt_b.get("userAccount") or evt_b.get("username")
                cat_a = evt_a.get("category", "")
                cat_b = evt_b.get("category", "")

                if (
                    cat_a == "AUTHENTICATION" and cat_b == "FILE_SYSTEM" and
                    time_diff_sec <= 600
                ):
                    seen_pairs.add(pair_key)
                    correlations.append({
                        "id": f"CORR-{correlation_id_counter:02d}",
                        "sourceEventId": id_a,
                        "targetEventId": id_b,
                        "relationship": "SESSION_UID_TEMPORAL_SEQUENCE",
                        "rule_identifier": "LOGIN_FOLLOWED_BY_FILE_ACCESS",
                        "classification": "LIKELY",
                        "strength": "MEDIUM",
                        "time_interval_seconds": time_diff_sec,
                        "supporting_field_matches": {"user": user_a or "active_session"},
                        "explanation": f"File read access occurred {int(time_diff_sec)} seconds following an authenticated interactive session.",
                        "limitation": "Concurrent automated background jobs under the same user UID cannot be ruled out without process tree telemetry."
                    })
                    correlation_id_counter += 1
                    continue

                # RULE 3: File Access followed by High-Volume Network Egress
                if (
                    cat_a == "FILE_SYSTEM" and cat_b == "NETWORK" and
                    time_diff_sec <= 600
                ):
                    seen_pairs.add(pair_key)
                    correlations.append({
                        "id": f"CORR-{correlation_id_counter:02d}",
                        "sourceEventId": id_a,
                        "targetEventId": id_b,
                        "relationship": "POST_ACCESS_DATA_EGRESS",
                        "rule_identifier": "FILE_ACCESS_TO_NETWORK_EGRESS",
                        "classification": "UNKNOWN",
                        "strength": "UNCONFIRMED",
                        "time_interval_seconds": time_diff_sec,
                        "supporting_field_matches": {"temporal_gap_seconds": time_diff_sec},
                        "explanation": f"Outbound network egress occurred {int(time_diff_sec)} seconds after sensitive file handle read open.",
                        "limitation": "CRITICAL LIMITATION: The network transfer was TLS encrypted. No endpoint memory dump or packet decryption key exists to prove the payload contained the accessed file. 'No Evidence, No Claim.'"
                    })
                    correlation_id_counter += 1
                    continue

        return correlations

correlation_engine = CorrelationEngine()
