# TraceX Digital Forensics — Python FastAPI & MongoDB Atlas Backend

> **"Reconstruct the Incident. Follow the Evidence."**  
> **Core Principle: "No Evidence, No Claim."**

The TraceX backend is an asynchronous, high-performance forensic analysis engine built with **Python 3**, **FastAPI**, **MongoDB Atlas**, **Pandas**, and **Pydantic**. It handles evidence log ingestion (`.log`, `.csv`, `.json`), computes cryptographic SHA-256 hashes for chain of custody, normalizes fragmented timestamps to UTC, executes rule-based explainable correlation analysis, and produces audit-ready forensic case reports.

---

## ⚡ Technology Stack

- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **Database**: MongoDB Atlas (via PyMongo 4.9+)
- **Data Validation & Schemas**: Pydantic v2
- **Log Processing & Tabular Telemetry**: Pandas
- **Multipart Form Uploads**: python-multipart
- **Testing**: Pytest & HTTPX

---

## 📁 Backend Architecture

```text
backend/
  app/
    __init__.py
    main.py                 # FastAPI application, CORS, and lifecycles
    config.py               # Settings loaded from backend/.env
    database.py             # MongoDB Atlas client, connection health, indexing, & auto-seeding
    models/                 # Pydantic request and response schemas
      __init__.py
      investigation.py      # Investigation CRUD & summary models
      evidence.py           # Evidence upload and metadata models
      event.py              # Normalized forensic event and timeline models
      report.py             # Case report and export schemas
    routes/                 # REST API endpoints
      __init__.py
      health.py             # GET /api/health with real MongoDB ping
      investigations.py     # /api/investigations CRUD & summary
      evidence.py           # /api/investigations/{id}/evidence upload & list
      events.py             # /api/investigations/{id}/events filtering & pagination
      timeline.py           # /api/investigations/{id}/timeline chronological sequence
      correlation.py        # /api/investigations/{id}/correlations 3D graph links
      reports.py            # /api/investigations/{id}/reports & JSON export
    services/               # Business logic & forensic engines
      __init__.py
      log_parser.py         # .log (sshd/NetFlow/syslog), .csv, .json parsers
      normalization.py      # UTC timestamp standardization & 3D coordinate mapping
      correlation_engine.py # Rule-based explainable correlation (FACT/LIKELY/UNKNOWN)
      evidence_service.py   # Secure upload handling, hashing, and database writes
      report_service.py     # Audit report generation
    utils/                  # Helpers
      __init__.py
      datetime_utils.py     # UTC conversion & epoch/syslog parsing
      file_validation.py    # Size limits & SHA-256 checksum calculation
      serialization.py      # MongoDB BSON ObjectId to JSON string serializer
  tests/                    # Pytest test suite
    test_health.py
    test_investigations.py
    test_log_parser.py
  .env.example              # Environment variables template
  requirements.txt          # Python dependencies
  .gitignore                # Ignore virtual environments, caches, and secrets
  README.md                 # Setup and run instructions
```

---

## 🛠️ Local Development Setup (Windows)

### 1. Create and Activate Virtual Environment
Open PowerShell in the project root:

```powershell
# Navigate to the backend directory
cd backend

# Create virtual environment using Python 3.10+
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate
```

*(If using `uv`: `uv venv .venv --python 3.12` and `uv pip install -r requirements.txt`)*

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure Environment Variables (`backend/.env`)
Copy `.env.example` to `.env` in the `backend/` folder:

```powershell
cp .env.example .env
```

Open `backend/.env` and configure your MongoDB Atlas cluster URI:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=tracex_db
HOST=127.0.0.1
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAX_UPLOAD_SIZE_MB=50
MAX_FILES_PER_REQUEST=10
```

> [!IMPORTANT]
> **MongoDB Atlas Configuration Instructions:**
> 1. In MongoDB Atlas, create a database user with **Read and Write** permissions to `tracex_db`.
> 2. Under **Network Access**, ensure your current IP address (or `0.0.0.0/0` during hackathon demo) is added to the IP Access List.
> 3. Click **Connect** &rarr; **Drivers** (Python) and copy your connection string into `MONGODB_URI`.
> 4. If `MONGODB_URI` is left blank or Atlas is unreachable, the backend boots safely in degraded mode and reports `"database": "disconnected"` on `/api/health`, allowing the frontend to fall back cleanly to client demonstration mode without crashing!

### 4. Start the FastAPI Server
From the project root:

```powershell
$env:PYTHONPATH="."
backend/.venv/Scripts/uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

- API Server: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc Documentation: `http://127.0.0.1:8000/redoc`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

### 5. Run the Automated Tests
```powershell
$env:PYTHONPATH="."
backend/.venv/Scripts/pytest backend/tests
```

---

## 🌐 Connecting with the React Frontend

1. Ensure the frontend has `VITE_API_BASE_URL` set to `http://127.0.0.1:8000`.
2. Start the React development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173/` in your browser.
4. When the backend is online with MongoDB Atlas connected, the navigation status badge displays `BACKEND LIVE`. If offline, it smoothly displays `SYNTHETIC DEMO`.
