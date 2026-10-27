import logging
from typing import Optional
from pymongo import MongoClient, ASCENDING
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.app.config import settings

logger = logging.getLogger("tracex.database")

class DatabaseManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self._is_connected: bool = False
        self._connection_error: Optional[str] = None

    def connect(self) -> bool:
        """
        Connects to MongoDB Atlas using the configured MONGODB_URI.
        Verifies connectivity via an admin ping command.
        """
        if not settings.MONGODB_URI:
            self._is_connected = False
            self._connection_error = "MONGODB_URI environment variable is not configured."
            logger.warning(self._connection_error)
            return False

        try:
            # 2.5 second timeout to keep startup responsive and fail fast if Atlas is unreachable
            self.client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=2500,
                connectTimeoutMS=2500,
                appname="TraceX-Forensics"
            )
            # Verify connectivity
            self.client.admin.command("ping")
            self.db = self.client[settings.MONGODB_DATABASE]
            self._is_connected = True
            self._connection_error = None
            logger.info("Successfully connected to MongoDB Atlas database '%s'", settings.MONGODB_DATABASE)

            self._create_indexes()
            self._seed_default_demo_if_empty()
            return True

        except (ConnectionFailure, ServerSelectionTimeoutError) as err:
            self._is_connected = False
            self._connection_error = f"Failed to reach MongoDB Atlas: {err.__class__.__name__}"
            logger.error("MongoDB Atlas connection error: %s", self._connection_error)
            return False
        except Exception as err:
            self._is_connected = False
            self._connection_error = f"Database initialization error: {str(err)}"
            logger.error("Database initialization error: %s", self._connection_error)
            return False

    def close(self):
        """Closes the MongoDB client connection cleanly during shutdown."""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            self._is_connected = False
            logger.info("MongoDB connection closed cleanly.")

    @property
    def is_connected(self) -> bool:
        if not self._is_connected or not self.client:
            return False
        try:
            self.client.admin.command("ping")
            return True
        except Exception:
            self._is_connected = False
            return False

    @property
    def connection_status(self) -> dict:
        connected = self.is_connected
        return {
            "connected": connected,
            "database_name": settings.MONGODB_DATABASE if connected else None,
            "status": "connected" if connected else "disconnected",
            "error": None if connected else (self._connection_error or "Database unreachable"),
        }

    def _create_indexes(self):
        """Creates required forensic indexes across collections safely."""
        if self.db is None:
            return

        try:
            # 1. Investigations collection
            self.db.investigations.create_index([("created_at", ASCENDING)], background=True)

            # 2. Evidence files collection
            self.db.evidence_files.create_index([("investigation_id", ASCENDING)], background=True)
            self.db.evidence_files.create_index([("content_hash", ASCENDING)], background=True)

            # 3. Events collection
            self.db.events.create_index([("investigation_id", ASCENDING)], background=True)
            self.db.events.create_index([("timestamp", ASCENDING)], background=True)
            # Compound index for chronological timeline queries
            self.db.events.create_index(
                [("investigation_id", ASCENDING), ("timestamp", ASCENDING)],
                background=True
            )
            self.db.events.create_index([("event_type", ASCENDING)], background=True)
            self.db.events.create_index([("evidence_id", ASCENDING)], background=True)

            # 4. Reports collection
            self.db.reports.create_index([("investigation_id", ASCENDING)], background=True)
            self.db.reports.create_index([("generated_at", ASCENDING)], background=True)

            logger.info("MongoDB forensic collections and indexes verified.")
        except Exception as err:
            logger.warning("Index creation warning: %s", err)

    def _seed_default_demo_if_empty(self):
        """Seeds the standard synthetic forensic scenario if the database is brand new."""
        if self.db is None:
            return

        try:
            if self.db.investigations.count_documents({}) == 0:
                from datetime import datetime, timezone

                demo_inv_id = "inv-demo-synthetic-01"
                now = datetime.now(timezone.utc).isoformat()

                inv_doc = {
                    "_id": demo_inv_id,
                    "title": "Incident Reconstruction Demo — Unauthorized Spreadsheet Egress",
                    "description": "Synthetic multi-source forensic scenario reconstructing authentications, file access, and network egress across 3 log sources.",
                    "status": "COMPLETED",
                    "dataset_type": "synthetic",
                    "evidence_count": 3,
                    "event_count": 4,
                    "created_at": now,
                    "updated_at": now,
                }
                self.db.investigations.insert_one(inv_doc)

                # Seed evidence files
                evidence_docs = [
                    {
                        "_id": "ev-auth-01",
                        "investigation_id": demo_inv_id,
                        "fileName": "auth.log",
                        "original_filename": "auth.log",
                        "fileType": "log",
                        "category": "AUTHENTICATION",
                        "size": "1.4 MB",
                        "sizeBytes": 1468006,
                        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                        "uploadTime": "2026-10-27T02:00:00Z",
                        "status": "PARSED",
                        "processing_status": "COMPLETED",
                        "eventCount": 1842,
                        "sourceHost": "srv-prod-auth01",
                        "description": "Linux PAM/sshd authentication logging service records.",
                        "created_at": now
                    },
                    {
                        "_id": "ev-file-01",
                        "investigation_id": demo_inv_id,
                        "fileName": "files.csv",
                        "original_filename": "files.csv",
                        "fileType": "csv",
                        "category": "FILE_SYSTEM",
                        "size": "420 KB",
                        "sizeBytes": 430080,
                        "sha256": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
                        "uploadTime": "2026-10-27T02:00:30Z",
                        "status": "PARSED",
                        "processing_status": "COMPLETED",
                        "eventCount": 630,
                        "sourceHost": "fs-shares-internal",
                        "description": "Audit log of file handles, read operations, and file access permissions.",
                        "created_at": now
                    },
                    {
                        "_id": "ev-net-01",
                        "investigation_id": demo_inv_id,
                        "fileName": "net.log",
                        "original_filename": "net.log",
                        "fileType": "log",
                        "category": "NETWORK",
                        "size": "8.9 MB",
                        "sizeBytes": 9332326,
                        "sha256": "785b07b34d3b48227b409744c803dfa1050a996df8727e4e04044a2b91873fb2",
                        "uploadTime": "2026-10-27T02:01:00Z",
                        "status": "PARSED",
                        "processing_status": "COMPLETED",
                        "eventCount": 14210,
                        "sourceHost": "gw-core-perimeter",
                        "description": "Zeek / NetFlow egress and ingress flow telemetry on perimeter gateway.",
                        "created_at": now
                    }
                ]
                self.db.evidence_files.insert_many(evidence_docs)

                # Seed the 4 key events
                events_docs = [
                    {
                        "_id": "EVT-001",
                        "investigation_id": demo_inv_id,
                        "evidence_id": "ev-auth-01",
                        "timestamp": "2026-10-27T02:03:00Z",
                        "original_timestamp": "Oct 27 02:03:12",
                        "displayTime": "02:03 UTC",
                        "title": "Five failed admin logins",
                        "eventType": "AUTH_FAILURE",
                        "event_type": "AUTH_FAILURE",
                        "category": "AUTHENTICATION",
                        "sourceFile": "auth.log",
                        "source_filename": "auth.log",
                        "sourceHost": "srv-prod-auth01",
                        "severity": "HIGH",
                        "classification": "FACT",
                        "actorIp": "198.51.100.44",
                        "source_ip": "198.51.100.44",
                        "userAccount": "admin",
                        "username": "admin",
                        "details": "Multiple invalid password attempts recorded against local administrator account within a 15-second window.",
                        "description": "Multiple invalid password attempts recorded against local administrator account within a 15-second window.",
                        "rawRecord": "Oct 27 02:03:12 srv-prod01 sshd[14022]: Failed password for invalid user admin from 198.51.100.44 port 49201 ssh2 (repeated 5 times)",
                        "raw_record": "Oct 27 02:03:12 srv-prod01 sshd[14022]: Failed password for invalid user admin from 198.51.100.44 port 49201 ssh2 (repeated 5 times)",
                        "findings": "Directly recorded in auth.log. Repeated PAM auth failures for user 'admin' originating from external IP 198.51.100.44.",
                        "limitations": "Log records attempt frequency and source socket only. Does not confirm automated brute-force tool vs mistaken user authentication without packet capture.",
                        "supportedLinks": ["EVT-002"],
                        "related_event_ids": ["EVT-002"],
                        "coordinates": [-2.2, 1.2, 0.4],
                        "created_at": now
                    },
                    {
                        "_id": "EVT-002",
                        "investigation_id": demo_inv_id,
                        "evidence_id": "ev-auth-01",
                        "timestamp": "2026-10-27T02:05:00Z",
                        "original_timestamp": "Oct 27 02:05:41",
                        "displayTime": "02:05 UTC",
                        "title": "Successful login from the same IP",
                        "eventType": "AUTH_SUCCESS",
                        "event_type": "AUTH_SUCCESS",
                        "category": "AUTHENTICATION",
                        "sourceFile": "auth.log",
                        "source_filename": "auth.log",
                        "sourceHost": "srv-prod-auth01",
                        "severity": "CRITICAL",
                        "classification": "FACT",
                        "actorIp": "198.51.100.44",
                        "source_ip": "198.51.100.44",
                        "userAccount": "admin",
                        "username": "admin",
                        "details": "Successful SSH interactive session authenticated from external IP 198.51.100.44 matching prior failed attempt origin.",
                        "description": "Successful SSH interactive session authenticated from external IP 198.51.100.44 matching prior failed attempt origin.",
                        "rawRecord": "Oct 27 02:05:41 srv-prod01 sshd[14088]: Accepted password for admin from 198.51.100.44 port 49208 ssh2; pam_unix(sshd:session): session opened for user admin by (uid=0)",
                        "raw_record": "Oct 27 02:05:41 srv-prod01 sshd[14088]: Accepted password for admin from 198.51.100.44 port 49208 ssh2; pam_unix(sshd:session): session opened for user admin by (uid=0)",
                        "findings": "Directly recorded in auth.log. Successful session opened for user 'admin' from 198.51.100.44 exactly 2 minutes following the 5 failed attempts.",
                        "limitations": "Verifies successful authentication handshake. Does not establish credential theft, credential stuffing, or authorized admin access without corroborating user interviews.",
                        "supportedLinks": ["EVT-001", "EVT-003"],
                        "related_event_ids": ["EVT-001", "EVT-003"],
                        "coordinates": [-0.8, 0.5, -0.6],
                        "created_at": now
                    },
                    {
                        "_id": "EVT-003",
                        "investigation_id": demo_inv_id,
                        "evidence_id": "ev-file-01",
                        "timestamp": "2026-10-27T02:07:00Z",
                        "original_timestamp": "2026-10-27T02:07:18Z",
                        "displayTime": "02:07 UTC",
                        "title": "salary.xlsx accessed",
                        "eventType": "FILE_ACCESS",
                        "event_type": "FILE_ACCESS",
                        "category": "FILE_SYSTEM",
                        "sourceFile": "files.csv",
                        "source_filename": "files.csv",
                        "sourceHost": "fs-shares-internal",
                        "severity": "MEDIUM",
                        "classification": "FACT",
                        "targetFile": "/shares/finance/confidential/salary.xlsx",
                        "file_path": "/shares/finance/confidential/salary.xlsx",
                        "userAccount": "admin (UID 1000)",
                        "username": "admin",
                        "details": "File handle read open request executed against confidential salary spreadsheet over internal network share.",
                        "description": "File handle read open request executed against confidential salary spreadsheet over internal network share.",
                        "rawRecord": "\"timestamp\",\"uid\",\"process\",\"file_path\",\"action\",\"result\"\n\"2026-10-27T02:07:18Z\",\"1000\",\"cat/cp\",\"/shares/finance/confidential/salary.xlsx\",\"OPEN_READ\",\"SUCCESS\"",
                        "raw_record": "\"timestamp\",\"uid\",\"process\",\"file_path\",\"action\",\"result\"\n\"2026-10-27T02:07:18Z\",\"1000\",\"cat/cp\",\"/shares/finance/confidential/salary.xlsx\",\"OPEN_READ\",\"SUCCESS\"",
                        "findings": "Directly recorded in files.csv. Read/Open handle requested for sensitive document '/shares/finance/confidential/salary.xlsx' under active session UID 1000.",
                        "limitations": "Records file read handle open operation. File access does NOT verify whether file contents were read in full, copied, staged to a temporary archive, or encrypted.",
                        "supportedLinks": ["EVT-002", "EVT-004"],
                        "related_event_ids": ["EVT-002", "EVT-004"],
                        "coordinates": [0.9, -0.4, 0.5],
                        "created_at": now
                    },
                    {
                        "_id": "EVT-004",
                        "investigation_id": demo_inv_id,
                        "evidence_id": "ev-net-01",
                        "timestamp": "2026-10-27T02:09:00Z",
                        "original_timestamp": "ts=1793066940.12",
                        "displayTime": "02:09 UTC",
                        "title": "48 MB sent to an unknown address",
                        "eventType": "NETWORK_EGRESS",
                        "event_type": "NETWORK_EGRESS",
                        "category": "NETWORK",
                        "sourceFile": "net.log",
                        "source_filename": "net.log",
                        "sourceHost": "gw-core-perimeter",
                        "severity": "CRITICAL",
                        "classification": "FACT",
                        "destinationIp": "203.0.113.89",
                        "destination_ip": "203.0.113.89",
                        "destinationPort": 443,
                        "transferSize": "48.0 MB (50,331,648 bytes)",
                        "bytes_transferred": 50331648,
                        "details": "High-volume outbound TCP/TLS session established to unknown non-whitelisted public address on port 443.",
                        "description": "High-volume outbound TCP/TLS session established to unknown non-whitelisted public address on port 443.",
                        "rawRecord": "ts=1793066940.12 uid=ChN8Q4382 id.orig_h=10.0.1.15 id.orig_p=52110 id.resp_h=203.0.113.89 id.resp_p=443 proto=tcp service=ssl orig_bytes=50331648 resp_bytes=4120 conn_state=SF duration=14.2s",
                        "raw_record": "ts=1793066940.12 uid=ChN8Q4382 id.orig_h=10.0.1.15 id.orig_p=52110 id.resp_h=203.0.113.89 id.resp_p=443 proto=tcp service=ssl orig_bytes=50331648 resp_bytes=4120 conn_state=SF duration=14.2s",
                        "findings": "Directly recorded in net.log. Outbound TCP connection to foreign IP 203.0.113.89:443 transferred 50,331,648 bytes (48 MB) in 14.2 seconds.",
                        "limitations": "Egress volume and destination IP verified. However, session was encrypted with TLS; available netflow telemetry CANNOT establish whether the 48 MB contained 'salary.xlsx' or unrelated payload.",
                        "supportedLinks": ["EVT-003"],
                        "related_event_ids": ["EVT-003"],
                        "coordinates": [2.3, 0.8, -0.3],
                        "created_at": now
                    }
                ]
                self.db.events.insert_many(events_docs)
                logger.info("Seeded initial synthetic investigation '%s' in MongoDB Atlas.", demo_inv_id)
        except Exception as err:
            logger.warning("Auto-seed demo warning: %s", err)

db_manager = DatabaseManager()

def get_database() -> Optional[Database]:
    """Dependency helper to access the active MongoDB database."""
    return db_manager.db
