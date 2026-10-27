from typing import Any
from bson import ObjectId
from datetime import datetime

def serialize_object_id(obj_id: Any) -> str:
    """Safely converts an ObjectId or other identifier to string."""
    if isinstance(obj_id, ObjectId):
        return str(obj_id)
    return str(obj_id) if obj_id is not None else ""

def serialize_doc(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """
    Recursively transforms MongoDB BSON document for clean API consumption.
    Converts `_id` to string `id` and `_id`, and formats datetime objects.
    """
    if doc is None:
        return None

    serialized = {}
    for key, value in doc.items():
        if key == "_id":
            serialized["id"] = str(value)
            serialized["_id"] = str(value)
        elif isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, dict):
            serialized[key] = serialize_doc(value)
        elif isinstance(value, list):
            serialized[key] = [
                serialize_doc(item) if isinstance(item, dict)
                else str(item) if isinstance(item, ObjectId)
                else item.isoformat() if isinstance(item, datetime)
                else item
                for item in value
            ]
        else:
            serialized[key] = value

    return serialized

def serialize_docs(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Serializes a list of MongoDB documents."""
    return [serialize_doc(d) for d in docs if d is not None]
