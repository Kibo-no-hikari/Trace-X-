import json
from fastapi import APIRouter, HTTPException, Response, status
from backend.app.database import db_manager
from backend.app.models.report import ReportCreate, ReportResponse
from backend.app.services.report_service import report_service
from backend.app.utils.serialization import serialize_doc, serialize_docs

router = APIRouter(tags=["Reports"])

def check_db():
    if not db_manager.is_connected or db_manager.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is currently unavailable. Please configure MONGODB_URI."
        )
    return db_manager.db

@router.post("/api/investigations/{investigation_id}/reports")
def generate_investigation_report(investigation_id: str, payload: ReportCreate = ReportCreate()):
    db = check_db()
    try:
        report = report_service.generate_report(
            db=db,
            investigation_id=investigation_id,
            investigator_name=payload.investigator or "Forensic Lead — Security Operations",
            notes=payload.notes
        )
        return report
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate report: {str(e)}")

@router.get("/api/investigations/{investigation_id}/reports")
def list_investigation_reports(investigation_id: str):
    db = check_db()
    cursor = db.reports.find({"investigation_id": investigation_id}).sort("generated_at", -1)
    return serialize_docs(list(cursor))

@router.get("/api/reports/{report_id}")
def get_report(report_id: str):
    db = check_db()
    doc = db.reports.find_one({"_id": report_id})
    if not doc:
        # Also try by reportId field
        doc = db.reports.find_one({"reportId": report_id})

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID '{report_id}' not found."
        )
    return serialize_doc(doc)

@router.get("/api/reports/{report_id}/export")
def export_report_json(report_id: str):
    db = check_db()
    doc = db.reports.find_one({"_id": report_id}) or db.reports.find_one({"reportId": report_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with ID '{report_id}' not found."
        )

    clean_doc = serialize_doc(doc)
    json_bytes = json.dumps(clean_doc, indent=2).encode("utf-8")

    filename = f"TraceX-Report-{clean_doc.get('reportId', report_id)}.json"
    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# Backward-compatible endpoint for frontend
@router.post("/api/v1/report/generate")
@router.get("/api/v1/report")
def generate_report_generic():
    db = check_db()
    first_inv = db.investigations.find_one({})
    inv_id = str(first_inv["_id"]) if first_inv else "inv-demo-synthetic-01"
    return generate_investigation_report(inv_id)
