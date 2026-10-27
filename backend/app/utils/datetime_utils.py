import re
from datetime import datetime, timezone
from typing import Optional, Tuple
from dateutil import parser as date_parser

def parse_to_utc(timestamp_str: str) -> Tuple[Optional[datetime], Optional[str]]:
    """
    Parses various timestamp strings into an explicit UTC datetime object
    and returns (datetime_obj, iso_utc_string).
    If ambiguous or invalid, returns (None, None).
    """
    if not timestamp_str or not isinstance(timestamp_str, str):
        return None, None

    cleaned = timestamp_str.strip().strip('"').strip("'")
    if not cleaned:
        return None, None

    # Check for Unix epoch (seconds or milliseconds)
    if re.match(r"^\d{10}(\.\d+)?$", cleaned):
        try:
            dt = datetime.fromtimestamp(float(cleaned), tz=timezone.utc)
            return dt, dt.isoformat()
        except (ValueError, OverflowError):
            pass

    if re.match(r"^\d{13}$", cleaned):
        try:
            dt = datetime.fromtimestamp(float(cleaned) / 1000.0, tz=timezone.utc)
            return dt, dt.isoformat()
        except (ValueError, OverflowError):
            pass

    try:
        dt = date_parser.parse(cleaned)
        if dt.tzinfo is None:
            # Assume UTC if not explicitly provided, adhering to UTC standardization
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt, dt.isoformat()
    except (ValueError, OverflowError, TypeError):
        return None, None

def format_display_time(dt: Optional[datetime]) -> str:
    """Formats datetime to 'HH:MM UTC'."""
    if not dt:
        return "--:-- UTC"
    return dt.strftime("%H:%M UTC")
