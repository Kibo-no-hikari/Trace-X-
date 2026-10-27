import re
import json
import logging
from pathlib import Path
from typing import Any, Tuple
import pandas as pd
from backend.app.utils.datetime_utils import parse_to_utc

logger = logging.getLogger("tracex.parser")

class LogParserService:
    """
    Parses supported forensic evidence files:
    - .csv: Structured file audits, EDR exports
    - .json: Structured JSON array or JSON lines
    - .log: Auth logs (sshd/PAM), NetFlow/Zeek logs, generic syslog
    """

    def parse_file(self, file_path: Path, filename: str) -> Tuple[list[dict[str, Any]], list[str]]:
        ext = file_path.suffix.lower()
        if ext == ".csv":
            return self.parse_csv(file_path, filename)
        elif ext == ".json":
            return self.parse_json(file_path, filename)
        elif ext == ".log" or ext == ".txt":
            return self.parse_log(file_path, filename)
        else:
            return [], [f"Unsupported file format '{ext}'."]

    def parse_csv(self, file_path: Path, filename: str) -> Tuple[list[dict[str, Any]], list[str]]:
        events = []
        errors = []

        try:
            df = pd.read_csv(file_path, dtype=str).fillna("")
        except Exception as e:
            return [], [f"Failed to read CSV structure: {str(e)}"]

        if df.empty:
            return [], ["CSV file contains no data rows."]

        # Lowercase column names for flexible detection
        col_map = {col: col.strip().lower() for col in df.columns}
        df.rename(columns=col_map, inplace=True)

        for index, row in df.iterrows():
            row_dict = row.to_dict()
            line_num = index + 2

            # Identify timestamp column
            raw_ts = (
                row_dict.get("timestamp") or
                row_dict.get("time") or
                row_dict.get("datetime") or
                row_dict.get("date") or
                row_dict.get("ts") or
                ""
            )

            dt, iso_utc = parse_to_utc(raw_ts)
            if not iso_utc:
                errors.append(f"Row {line_num}: Missing or unparseable timestamp '{raw_ts}'.")
                continue

            # Detect fields
            user = (
                row_dict.get("user") or
                row_dict.get("username") or
                row_dict.get("uid") or
                row_dict.get("account") or
                None
            )
            file_path_val = (
                row_dict.get("file_path") or
                row_dict.get("filepath") or
                row_dict.get("file") or
                row_dict.get("target") or
                None
            )
            action = (
                row_dict.get("action") or
                row_dict.get("event") or
                row_dict.get("operation") or
                "FILE_ACCESS"
            )
            process = row_dict.get("process") or row_dict.get("command") or None
            host = row_dict.get("host") or row_dict.get("hostname") or "fs-shares-internal"

            title = f"{Path(file_path_val).name if file_path_val else 'File'} accessed"
            details = f"Action {action} performed on {file_path_val or 'target'} by {user or 'system'}."

            events.append({
                "original_timestamp": raw_ts,
                "timestamp": iso_utc,
                "dt_obj": dt,
                "event_type": "FILE_ACCESS" if file_path_val else "SYSTEM_EVENT",
                "category": "FILE_SYSTEM" if file_path_val else "SYSTEM",
                "title": title,
                "description": details,
                "details": details,
                "source_filename": filename,
                "sourceHost": host,
                "severity": "HIGH" if "confidential" in (file_path_val or "").lower() else "MEDIUM",
                "classification": "FACT",
                "userAccount": user,
                "targetFile": file_path_val,
                "file_path": file_path_val,
                "raw_record": json.dumps(row_dict),
                "source_record_number": line_num,
                "normalized_fields": {
                    "action": action,
                    "process": process,
                    **row_dict
                }
            })

        return events, errors

    def parse_json(self, file_path: Path, filename: str) -> Tuple[list[dict[str, Any]], list[str]]:
        events = []
        errors = []

        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read().strip()
                if not content:
                    return [], ["JSON file is empty."]

                try:
                    data = json.loads(content)
                    records = data if isinstance(data, list) else [data]
                except json.JSONDecodeError:
                    # Attempt JSON lines format
                    records = []
                    for i, line in enumerate(content.splitlines(), start=1):
                        line = line.strip()
                        if line:
                            try:
                                records.append(json.loads(line))
                            except Exception as err:
                                errors.append(f"Line {i}: Malformed JSON line: {err}")
        except Exception as e:
            return [], [f"Failed to read JSON file: {str(e)}"]

        for i, rec in enumerate(records, start=1):
            if not isinstance(rec, dict):
                errors.append(f"Record {i}: Expected JSON object, got {type(rec).__name__}.")
                continue

            raw_ts = str(
                rec.get("timestamp") or
                rec.get("time") or
                rec.get("datetime") or
                rec.get("ts") or
                rec.get("@timestamp") or
                ""
            )

            dt, iso_utc = parse_to_utc(raw_ts)
            if not iso_utc:
                errors.append(f"Record {i}: Missing or invalid timestamp '{raw_ts}'.")
                continue

            event_type = str(rec.get("event_type") or rec.get("type") or rec.get("action") or "SYSTEM_LOG")
            title = str(rec.get("title") or rec.get("message") or f"{event_type} event")
            category = "SYSTEM"
            if "auth" in event_type.lower() or "login" in event_type.lower():
                category = "AUTHENTICATION"
            elif "net" in event_type.lower() or "flow" in event_type.lower():
                category = "NETWORK"
            elif "file" in event_type.lower():
                category = "FILE_SYSTEM"

            events.append({
                "original_timestamp": raw_ts,
                "timestamp": iso_utc,
                "dt_obj": dt,
                "event_type": event_type.upper(),
                "category": category,
                "title": title[:100],
                "description": str(rec.get("details") or rec.get("message") or title),
                "details": str(rec.get("details") or rec.get("message") or title),
                "source_filename": filename,
                "sourceHost": str(rec.get("host") or rec.get("hostname") or "srv-prod-node"),
                "severity": str(rec.get("severity") or "LOW").upper(),
                "classification": "FACT",
                "actorIp": rec.get("src_ip") or rec.get("source_ip") or rec.get("ip"),
                "destinationIp": rec.get("dst_ip") or rec.get("destination_ip"),
                "destinationPort": rec.get("dst_port") or rec.get("port"),
                "userAccount": rec.get("user") or rec.get("username"),
                "raw_record": json.dumps(rec),
                "source_record_number": i,
                "normalized_fields": rec
            })

        return events, errors

    def parse_log(self, file_path: Path, filename: str) -> Tuple[list[dict[str, Any]], list[str]]:
        events = []
        errors = []

        # Patterns for SSH/PAM auth logs
        # e.g.: Oct 27 02:03:12 srv-prod01 sshd[14022]: Failed password for invalid user admin from 198.51.100.44 port 49201 ssh2
        ssh_failed_pat = re.compile(
            r"Failed password for (?:invalid user )?(\S+) from (\d+\.\d+\.\d+\.\d+)", re.IGNORECASE
        )
        ssh_success_pat = re.compile(
            r"Accepted password for (\S+) from (\d+\.\d+\.\d+\.\d+)", re.IGNORECASE
        )

        # NetFlow / Zeek line pattern
        # e.g.: ts=1793066940.12 uid=ChN8Q4382 id.orig_h=10.0.1.15 id.orig_p=52110 id.resp_h=203.0.113.89 id.resp_p=443 ... orig_bytes=50331648
        netflow_pat = re.compile(
            r"id\.resp_h=(\d+\.\d+\.\d+\.\d+).*?id\.resp_p=(\d+).*?orig_bytes=(\d+)", re.IGNORECASE
        )

        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                lines = f.readlines()
        except Exception as e:
            return [], [f"Failed to read log file: {str(e)}"]

        current_year = 2026

        for i, line in enumerate(lines, start=1):
            line_str = line.strip()
            if not line_str or line_str.startswith("#"):
                continue

            # Check timestamp at start of line
            # Format: 'Oct 27 02:03:12' or 'ts=1793066940.12' or ISO string
            raw_ts = None
            iso_utc = None
            dt = None

            if line_str.startswith("ts="):
                match = re.search(r"ts=([\d\.]+)", line_str)
                if match:
                    raw_ts = match.group(1)
                    dt, iso_utc = parse_to_utc(raw_ts)
            else:
                # Try syslog date like 'Oct 27 02:03:12'
                syslog_match = re.match(r"^([A-Z][a-z]{2}\s+\d+\s+\d+:\d+:\d+)", line_str)
                if syslog_match:
                    raw_ts = syslog_match.group(1)
                    # Add current year to construct full date
                    dt, iso_utc = parse_to_utc(f"{current_year} {raw_ts}")
                else:
                    # Generic first token timestamp
                    first_part = line_str.split(" ", 2)[0]
                    dt, iso_utc = parse_to_utc(first_part)
                    if iso_utc:
                        raw_ts = first_part

            if not iso_utc:
                # Keep unparsed line noted
                errors.append(f"Line {i}: Could not extract reliable UTC timestamp: '{line_str[:60]}...'")
                continue

            # Match SSH Failed
            m_fail = ssh_failed_pat.search(line_str)
            if m_fail:
                user, ip = m_fail.groups()
                events.append({
                    "original_timestamp": raw_ts,
                    "timestamp": iso_utc,
                    "dt_obj": dt,
                    "event_type": "AUTH_FAILURE",
                    "category": "AUTHENTICATION",
                    "title": f"Failed login for user '{user}' from {ip}",
                    "description": f"Failed password attempt recorded from external IP {ip} targeting user account '{user}'.",
                    "details": f"Failed password attempt recorded from external IP {ip} targeting user account '{user}'.",
                    "source_filename": filename,
                    "sourceHost": "srv-prod-auth01",
                    "severity": "HIGH",
                    "classification": "FACT",
                    "actorIp": ip,
                    "source_ip": ip,
                    "userAccount": user,
                    "username": user,
                    "raw_record": line_str,
                    "source_record_number": i,
                    "normalized_fields": {"user": user, "ip": ip, "status": "FAILED"}
                })
                continue

            # Match SSH Accepted
            m_succ = ssh_success_pat.search(line_str)
            if m_succ:
                user, ip = m_succ.groups()
                events.append({
                    "original_timestamp": raw_ts,
                    "timestamp": iso_utc,
                    "dt_obj": dt,
                    "event_type": "AUTH_SUCCESS",
                    "category": "AUTHENTICATION",
                    "title": f"Successful login for user '{user}' from {ip}",
                    "description": f"Interactive SSH session accepted for user '{user}' from {ip}.",
                    "details": f"Interactive SSH session accepted for user '{user}' from {ip}.",
                    "source_filename": filename,
                    "sourceHost": "srv-prod-auth01",
                    "severity": "CRITICAL",
                    "classification": "FACT",
                    "actorIp": ip,
                    "source_ip": ip,
                    "userAccount": user,
                    "username": user,
                    "raw_record": line_str,
                    "source_record_number": i,
                    "normalized_fields": {"user": user, "ip": ip, "status": "SUCCESS"}
                })
                continue

            # Match NetFlow
            m_net = netflow_pat.search(line_str)
            if m_net:
                dst_ip, dst_port, orig_bytes_str = m_net.groups()
                bytes_num = int(orig_bytes_str)
                mb_size = bytes_num / (1024 * 1024)
                events.append({
                    "original_timestamp": raw_ts,
                    "timestamp": iso_utc,
                    "dt_obj": dt,
                    "event_type": "NETWORK_EGRESS",
                    "category": "NETWORK",
                    "title": f"{mb_size:.1f} MB sent to {dst_ip}",
                    "description": f"High volume outbound connection stream established to {dst_ip}:{dst_port} transferring {bytes_num} bytes.",
                    "details": f"High volume outbound connection stream established to {dst_ip}:{dst_port} transferring {bytes_num} bytes.",
                    "source_filename": filename,
                    "sourceHost": "gw-core-perimeter",
                    "severity": "CRITICAL" if mb_size > 10 else "MEDIUM",
                    "classification": "FACT",
                    "destinationIp": dst_ip,
                    "destination_ip": dst_ip,
                    "destinationPort": int(dst_port),
                    "transferSize": f"{mb_size:.1f} MB ({bytes_num:,} bytes)",
                    "bytes_transferred": bytes_num,
                    "raw_record": line_str,
                    "source_record_number": i,
                    "normalized_fields": {"destination_ip": dst_ip, "port": dst_port, "bytes": bytes_num}
                })
                continue

            # Generic syslog entry fallback
            events.append({
                "original_timestamp": raw_ts,
                "timestamp": iso_utc,
                "dt_obj": dt,
                "event_type": "SYSTEM_LOG",
                "category": "SYSTEM",
                "title": f"Log event: {line_str[:50]}",
                "description": line_str,
                "details": line_str,
                "source_filename": filename,
                "sourceHost": "srv-prod01",
                "severity": "LOW",
                "classification": "FACT",
                "raw_record": line_str,
                "source_record_number": i,
                "normalized_fields": {"raw": line_str}
            })

        return events, errors

log_parser_service = LogParserService()
