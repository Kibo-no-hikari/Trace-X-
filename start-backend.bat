@echo off
title TraceX Forensic Backend Server
echo ========================================================
echo   TraceX - Digital Forensics API Server (FastAPI)
echo ========================================================
cd /d "%~dp0"
set PYTHONPATH=.
if exist "backend\.venv\Scripts\python.exe" (
    echo Starting FastAPI server with MongoDB Atlas...
    backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo [ERROR] Virtual environment not found in backend\.venv
    echo Please make sure the backend environment exists.
)
pause
