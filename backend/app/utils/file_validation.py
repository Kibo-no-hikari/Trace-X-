import hashlib
from pathlib import Path
from typing import Tuple
from backend.app.config import settings

def compute_sha256(file_path: Path) -> str:
    """Computes the cryptographic SHA-256 checksum of a file for chain of custody."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def validate_uploaded_file(filename: str, file_size: int) -> Tuple[bool, str]:
    """
    Validates file extension and size constraints.
    Returns (is_valid, error_message).
    """
    if not filename:
        return False, "File name cannot be empty."

    ext = Path(filename).suffix.lower()
    if ext not in settings.SUPPORTED_EXTENSIONS:
        return (
            False,
            f"Unsupported file format '{ext}'. Supported formats: {', '.join(sorted(settings.SUPPORTED_EXTENSIONS))}."
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        return (
            False,
            f"File size ({file_size / (1024 * 1024):.2f} MB) exceeds maximum allowed {settings.MAX_UPLOAD_SIZE_MB} MB."
        )

    if file_size == 0:
        return False, "Uploaded file is empty (0 bytes)."

    return True, ""
