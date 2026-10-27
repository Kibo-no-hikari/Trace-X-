Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  TraceX - Digital Forensics API Server (FastAPI)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$env:PYTHONPATH = "."
if (Test-Path ".\backend\.venv\Scripts\python.exe") {
    Write-Host "Starting FastAPI server with MongoDB Atlas..." -ForegroundColor Green
    & ".\backend\.venv\Scripts\python.exe" -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
} else {
    Write-Host "[ERROR] Virtual environment not found in backend\.venv" -ForegroundColor Red
}
