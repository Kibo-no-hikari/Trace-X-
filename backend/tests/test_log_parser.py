import tempfile
from pathlib import Path
from backend.app.services.log_parser import log_parser_service
from backend.app.utils.datetime_utils import parse_to_utc

def test_parse_to_utc_epoch():
    dt, iso = parse_to_utc("1793066940.12")
    assert iso is not None
    assert "T" in iso

def test_parse_to_utc_iso():
    dt, iso = parse_to_utc("2026-10-27T02:07:18Z")
    assert iso is not None
    assert "2026-10-27" in iso

def test_parse_csv_file():
    csv_content = """timestamp,uid,process,file_path,action,result
2026-10-27T02:07:18Z,1000,cat/cp,/shares/finance/confidential/salary.xlsx,OPEN_READ,SUCCESS
"""
    with tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False) as f:
        f.write(csv_content)
        temp_path = Path(f.name)

    try:
        events, errors = log_parser_service.parse_csv(temp_path, "files.csv")
        assert len(errors) == 0
        assert len(events) == 1
        event = events[0]
        assert event["category"] == "FILE_SYSTEM"
        assert event["targetFile"] == "/shares/finance/confidential/salary.xlsx"
        assert event["classification"] == "FACT"
    finally:
        temp_path.unlink()

def test_parse_json_file():
    json_content = """[
        {
            "timestamp": "2026-10-27T02:01:30Z",
            "event_type": "AUTH_LOGIN",
            "host": "srv-prod01",
            "user": "analyst",
            "ip": "10.0.1.20"
        }
    ]"""
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        f.write(json_content)
        temp_path = Path(f.name)

    try:
        events, errors = log_parser_service.parse_json(temp_path, "syslog.json")
        assert len(errors) == 0
        assert len(events) == 1
        assert events[0]["category"] == "AUTHENTICATION"
        assert events[0]["userAccount"] == "analyst"
    finally:
        temp_path.unlink()

def test_parse_auth_log_file():
    log_content = """Oct 27 02:03:12 srv-prod01 sshd[14022]: Failed password for invalid user admin from 198.51.100.44 port 49201 ssh2
Oct 27 02:05:41 srv-prod01 sshd[14088]: Accepted password for admin from 198.51.100.44 port 49208 ssh2
"""
    with tempfile.NamedTemporaryFile("w", suffix=".log", delete=False) as f:
        f.write(log_content)
        temp_path = Path(f.name)

    try:
        events, errors = log_parser_service.parse_log(temp_path, "auth.log")
        assert len(events) == 2
        assert events[0]["event_type"] == "AUTH_FAILURE"
        assert events[0]["actorIp"] == "198.51.100.44"
        assert events[1]["event_type"] == "AUTH_SUCCESS"
        assert events[1]["actorIp"] == "198.51.100.44"
    finally:
        temp_path.unlink()
