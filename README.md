# TraceX — Digital Forensics & Attack Timeline Reconstruction

![TraceX Banner](https://img.shields.io/badge/TraceX-Digital%20Forensics-00f0ff?style=for-the-badge&logo=shield&logoColor=black)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)

> **"Reconstruct the Incident. Follow the Evidence."**  
> **Core Forensic Doctrine: "No Evidence, No Claim."**

**TraceX** is a modern, 3D-accelerated, full-stack digital forensics and incident timeline reconstruction workstation. It synthesizes disjointed, multi-source log telemetry (authentication logs, file system access logs, network netflow records) into a unified, UTC-synchronized chronological timeline, computes cryptographic SHA-256 evidence integrity hashes, projects evidence relationships into an interactive 3D spatial correlation graph, and enforces audit-grade evidentiary classification.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Evidentiary Doctrine ("No Evidence, No Claim")](#-evidentiary-doctrine)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Quickstart Guide](#-quickstart-guide)
  - [Prerequisites](#1-prerequisites)
  - [MongoDB Atlas Configuration](#2-mongodb-atlas-configuration)
  - [Backend Setup & Launch (FastAPI)](#3-backend-setup--launch-fastapi)
  - [Frontend Setup & Launch (React + Vite)](#4-frontend-setup--launch-react--vite)
- [MongoDB Atlas Database Architecture](#-mongodb-atlas-database-architecture)
- [API Reference & Swagger Documentation](#-api-reference--swagger-documentation)
- [Automated Testing](#-automated-testing)
- [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🏛 System Architecture

TraceX is engineered as a decoupled, resilient full-stack application:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRACEX FRONTEND (PORT 5173)                     │
│  React 19 (JS/JSX) │ Three.js & R3F │ Tailwind CSS v4 │ Framer Motion │
│                                                                        │
│  [3D Core Hero]     [Dashboard]       [Evidence Portal]                │
│  [3D Correlation]   [Timeline View]   [Audit Case Report]              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │  REST APIs (JSON / Multipart Upload)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        TRACEX BACKEND (PORT 8000)                      │
│                Python 3.12 │ FastAPI │ PyMongo │ Pandas                │
│                                                                        │
│  • Evidence Ingestion & SHA-256 Hashing Engine                         │
│  • Multi-Format Parser (CSV, JSON, Auth Logs, Netflow)                 │
│  • UTC ISO-8601 Temporal Normalizer                                    │
│  • Correlation Engine (IP Matching, Temporal Proximity, Egress)        │
│  • Report Generator & Evidentiary Classifier                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │  MongoDB SRV Driver (`pymongo[srv]`)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         MONGODB ATLAS CLUSTER                          │
│                     Database: `tracex_db`                              │
│                                                                        │
│  • `investigations`  : Case metadata, status, dataset classification   │
│  • `evidence_files`  : Cryptographic hashes, filenames, source types   │
│  • `events`          : Normalized forensic events, 3D coordinates      │
│  • `reports`         : Audit-grade findings, timelines, sign-offs      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Key Features

1. **Interactive 3D Forensics Hero Engine (`/`)**:
   - Real-time WebGL canvas rendered via Three.js and `@react-three/fiber`.
   - Glowing digital forensics core surrounded by orbiting evidence nodes (`auth.log`, `files.csv`, `net.log`).
   - Animated data packet particles traveling along verified correlation edges.
   - Dual-ring scanning radar, wireframe spatial sphere, and automatic 2D fallback for resource-constrained devices.

2. **Interactive Synthetic Demo Mode**:
   - Zero-backend instant demonstration walkthrough for presentations and competitions.
   - Interactive playback controls: Play, Pause, Step Forward/Back, Replay, and Reset.
   - Reconstructs a 4-event incident sequence from 02:03 UTC to 02:09 UTC.

3. **Forensic Workstation Dashboard (`/investigation`)**:
   - Incident metric stat cards with animated counters and live health indicators.
   - Investigation switcher dynamically loading cases directly from MongoDB Atlas.
   - Central chronological timeline with category filters (`AUTHENTICATION`, `FILE SYSTEM`, `NETWORK`).
   - Deep inspection drawer for raw log records, normalized telemetry, and evidentiary limitations.

4. **Evidence Ingestion Portal (`/investigation/import`)**:
   - Multi-file drag-and-drop supporting `.log`, `.csv`, `.json`, and plain text logs.
   - Cryptographic SHA-256 checksum calculation for strict chain-of-custody tracking.
   - Ingests files directly into the FastAPI backend, extracts forensic events, and writes to MongoDB Atlas.

5. **Chronological Incident Timeline (`/investigation/timeline`)**:
   - Displays all sequence events with luminous category markers.
   - Real-time search across titles, hosts, raw log snippets, and IP addresses.
   - View toggle between **Visual Timeline View** and **Dense Forensic Table View**.
   - Sort toggle: Earliest First vs. Latest First.

6. **Interactive 3D Correlation Graph (`/investigation/correlation`)**:
   - Renders forensic events as 3D spatial nodes with coordinates derived from category and time.
   - Connects correlated events via animated particle vectors.
   - Interactive node selection with live property inspection.

7. **Audit-Grade Forensic Report (`/investigation/report`)**:
   - Executive incident summary with formal case metadata and investigator sign-off.
   - Complete evidence source inventory with verified SHA-256 hashes.
   - Evidentiary classification breakdown (`FACT`, `LIKELY`, `UNKNOWN`).
   - One-click Print Report, Export PDF, and Export JSON.

---

## 🔒 Evidentiary Doctrine

TraceX adheres to a strict forensic integrity standard: **"No Evidence, No Claim."** Telemetry is categorized into three strict evidentiary tiers:

| Classification | Evidentiary Standard | Real-World Scenario Example |
| :--- | :--- | :--- |
| **`FACT`** | **Directly Recorded**: Unambiguously verified by raw log telemetry. | An outbound TLS connection to foreign IP `203.0.113.89:443` transmitted 48 MB at 02:09 UTC. |
| **`LIKELY`** | **Probabilistic Link**: Supported by temporal proximity and matching attributes, but lacks cryptographic proof. | Failed logins at 02:03 UTC followed by a successful login at 02:05 UTC from the identical source IP (`198.51.100.44`). |
| **`UNKNOWN`** | **Unproven Hypothesis**: Plausible theory that cannot be proven with available artifacts. | Whether the 48 MB outbound egress contained `salary.xlsx` (payload was encrypted in transit; no memory dump exists). |

---

## ⚡ Technology Stack

### Frontend
- **Framework**: React 19 (JavaScript only, JSX, strictly no TypeScript)
- **Tooling**: Vite 8 with Hot Module Replacement (HMR)
- **Styling**: Tailwind CSS v4 with custom glassmorphism design tokens
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animations**: Framer Motion
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Data Visualizations**: Recharts

### Backend
- **Language**: Python 3.10+ (tested on Python 3.12)
- **API Framework**: FastAPI with Pydantic v2
- **ASGI Server**: Uvicorn
- **Database Driver**: PyMongo with `dnspython` for MongoDB Atlas SRV connection
- **Log Processing**: Pandas & native Python regex/datetime engines
- **Testing**: Pytest with HTTPX TestClient

### Database
- **Cloud Database**: MongoDB Atlas (Cluster tier M0 / Serverless / Dedicated)
- **Default Database**: `tracex_db`

---

## 📁 Project Structure

```text
Trace-X-/
├── backend/
│   ├── app/
│   │   ├── models/             # Pydantic data schemas
│   │   │   ├── investigation.py
│   │   │   ├── evidence.py
│   │   │   ├── event.py
│   │   │   └── report.py
│   │   ├── routes/             # FastAPI REST endpoints
│   │   │   ├── health.py       # /api/health and database ping
│   │   │   ├── investigations.py
│   │   │   ├── evidence.py     # File upload & SHA-256 ingestion
│   │   │   ├── events.py
│   │   │   ├── timeline.py
│   │   │   ├── correlation.py
│   │   │   └── reports.py
│   │   ├── services/           # Forensic parsing and analytics logic
│   │   │   ├── log_parser.py   # Multi-format parser (CSV, JSON, Auth, Netflow)
│   │   │   ├── normalization.py
│   │   │   ├── correlation_engine.py
│   │   │   ├── evidence_service.py
│   │   │   └── report_service.py
│   │   ├── utils/              # Cryptographic hashing & ISO-8601 formatting
│   │   │   ├── datetime_utils.py
│   │   │   ├── file_validation.py
│   │   │   └── serialization.py
│   │   ├── config.py           # Environment settings via Pydantic BaseSettings
│   │   ├── database.py         # PyMongo client & auto-seeding engine
│   │   └── main.py             # FastAPI entry point & CORS configuration
│   ├── tests/                  # Automated Pytest test suite
│   │   ├── test_health.py
│   │   ├── test_investigations.py
│   │   └── test_log_parser.py
│   ├── .env                    # Local environment secrets (ignored by git)
│   ├── .env.example            # Sample configuration template
│   └── requirements.txt        # Backend Python dependencies
│
├── src/
│   ├── components/
│   │   ├── 3d/                 # Three.js 3D Core, Nodes & Correlation Graph
│   │   ├── dashboard/          # Stat Cards, Timeline, and Event Inspector
│   │   ├── demo/               # Step-by-step synthetic demo walkthrough modal
│   │   ├── evidence/           # File uploader & SHA-256 evidence inventory
│   │   ├── layout/             # Cyber Navbar, Sidebar, and Footer
│   │   ├── reports/            # Audit-grade forensic case report viewer
│   │   └── ui/                 # Cyber buttons, glassmorphic cards, radar spinners
│   ├── data/                   # Default synthetic demo datasets
│   ├── pages/                  # Route views (Home, Dashboard, Import, Timeline, etc.)
│   ├── services/               # Frontend API client with fallback handling
│   ├── utils/                  # Timestamp formatters & classification badges
│   ├── App.jsx                 # Routing configuration
│   ├── main.jsx                # Application root
│   └── index.css               # Design tokens & cyber workstation glow utilities
│
├── package.json                # Frontend dependencies
├── vite.config.js              # Vite configuration
└── README.md                   # This documentation
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: Version 18.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: Version 3.10 or higher ([Download Python](https://python.org/))
- **MongoDB Atlas Cluster**: A free or paid cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

### 2. MongoDB Atlas Configuration

1. Locate the file `backend/.env` (or copy from `backend/.env.example` if starting fresh):
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Open `backend/.env` in your text editor and set your MongoDB Atlas connection string:
   ```env
   # MongoDB Atlas Connection URI
   # Replace with your own cluster connection string:
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.whtlnlc.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DATABASE=tracex_db

   # Server Configuration
   HOST=127.0.0.1
   PORT=8000
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000

   # Forensic Ingestion Constraints
   MAX_UPLOAD_SIZE_MB=50
   MAX_FILES_PER_REQUEST=10
   ```

> ⚠️ **IMPORTANT — MongoDB Atlas Network Access (IP Whitelist)**:
> In the MongoDB Atlas Console:
> 1. Go to **Security** → **Network Access**.
> 2. Ensure your current public IP address is allowed, or add `0.0.0.0/0` ("Allow Access from Anywhere") for development/testing.
> 3. Verify that your database user credentials have read and write permissions to `tracex_db`.

---

### 3. Step 1: Start the Backend Server (Terminal 1)

Open your terminal in the project root directory (`Trace-X-`).

> 💡 **Tip**: The Python virtual environment in `backend/.venv` is already configured with all dependencies (FastAPI, PyMongo, Pydantic, Pandas, etc.). You do **not** need to re-run `python -m venv`.

Choose whichever method is easiest for you:

#### Option A: One-Command via npm (Recommended)
```bash
npm run backend
```

#### Option B: PowerShell Script
```powershell
.\start-backend.ps1
```

#### Option C: Windows Batch File (or double-click it in File Explorer)
```cmd
start-backend.bat
```

#### Option D: Linux / macOS (Bash)
```bash
source backend/.venv/bin/activate
export PYTHONPATH="."
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

When started successfully, the backend connects to MongoDB Atlas, prepares indexes, seeds the demo investigation (`inv-demo-synthetic-01`), and displays:
```text
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

### 4. Step 2: Start the Frontend (Terminal 2)

Leave the backend running in Terminal 1. Open a **second terminal window** in the project root directory (`Trace-X-`):

```bash
# 1. Install Node.js dependencies (first time only)
npm install

# 2. Start the Vite development server
npm run dev
```

The frontend development server will launch and display:
```text
  VITE v8.3.5  ready in 320 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 5. Step 3: Open and Use the Web Application

> 🌐 **Notice**: Open these URLs in your **Web Browser** (Chrome, Edge, Firefox, Brave, Safari). Do **not** paste or run HTTP URLs inside your command prompt/terminal shell.

1. **Launch the Web Application**:
   Navigate to: 👉 **[http://localhost:5173/](http://localhost:5173/)** in your web browser.

2. **Explore the Core Features**:
   - **Hero & 3D Core (`/`)**:
     - View the real-time 3D forensics engine with orbiting evidence spheres and scanning radar.
     - Click **"Launch Interactive Demo"** to run a chronological playback walkthrough of a multi-source incident without requiring any setup.
     - Click **"Launch Workstation"** to enter the main investigative portal.
   - **Dashboard (`/investigation`)**:
     - Monitor active investigations loaded directly from MongoDB Atlas.
     - Review forensic stat cards (evidence count, normalized events, confirmed correlations).
     - Inspect raw event payloads and evidentiary limitations in the interactive drawer.
   - **Evidence Ingestion Portal (`/investigation/import`)**:
     - Drag and drop `.log`, `.csv`, or `.json` telemetry files.
     - Real-time client and server SHA-256 cryptographic hash verification.
     - Ingested files are automatically parsed and written to MongoDB Atlas.
   - **Chronological Timeline (`/investigation/timeline`)**:
     - Search, filter, and inspect forensic events sorted by timestamp.
     - Toggle between **Visual Timeline View** and **Dense Forensic Table View**.
     - Filter by category: `AUTHENTICATION`, `FILE SYSTEM`, `NETWORK`.
   - **3D Spatial Correlation Graph (`/investigation/correlation`)**:
     - Explore multi-source relationships rendered as spatial 3D nodes.
     - Click on any node to inspect event telemetry, timestamps, and linked evidence records.
   - **Forensic Audit Report (`/investigation/report`)**:
     - Formal incident report adhering to the **"No Evidence, No Claim"** doctrine.
     - Categorizes findings into **`FACT`**, **`LIKELY`**, and **`UNKNOWN`**.
     - Export to JSON or Print / Save to PDF for audit submissions.

3. **Explore Interactive API Documentation (Swagger UI)**:
   Navigate to: 👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** to test backend endpoints directly from your browser.


---

## 🗄 MongoDB Atlas Database Architecture

When connected, TraceX manages four dedicated collections within `tracex_db`:

### 1. `investigations`
Stores case files and forensic scenario metadata.
```json
{
  "_id": "inv-demo-synthetic-01",
  "title": "Incident Reconstruction Demo — Unauthorized Spreadsheet Egress",
  "description": "Synthetic multi-source forensic scenario reconstructing authentications, file access, and network egress.",
  "status": "COMPLETED",
  "dataset_type": "synthetic",
  "evidence_count": 3,
  "event_count": 4,
  "created_at": "2026-10-27T13:43:51.857830+00:00",
  "updated_at": "2026-10-27T13:43:51.857830+00:00"
}
```

### 2. `evidence_files`
Maintains cryptographic chain-of-custody for ingested evidence files.
```json
{
  "_id": "ev-net-01",
  "investigation_id": "inv-demo-synthetic-01",
  "fileName": "net.log",
  "original_filename": "net.log",
  "fileType": "log",
  "category": "NETWORK",
  "size": "0.48 MB",
  "sizeBytes": 503316,
  "sha256": "4b82d910f1ce8995a94d8d172e25f82989b5c3aa15f36e84865103c81219b109",
  "uploadTime": "2026-10-27T13:43:51.857830+00:00",
  "status": "PARSED",
  "eventCount": 1,
  "sourceHost": "gw-core-perimeter"
}
```

### 3. `events`
Normalized forensic events extracted from raw logs with 3D spatial mapping coordinates.
```json
{
  "_id": "EVT-004",
  "investigation_id": "inv-demo-synthetic-01",
  "evidence_id": "ev-net-01",
  "timestamp": "2026-10-27T02:09:00Z",
  "displayTime": "02:09 UTC",
  "title": "48 MB sent to an unknown address",
  "eventType": "NETWORK_EGRESS",
  "category": "NETWORK",
  "sourceFile": "net.log",
  "sourceHost": "gw-core-perimeter",
  "severity": "CRITICAL",
  "classification": "FACT",
  "destinationIp": "203.0.113.89",
  "transferSize": "48.0 MB (50,331,648 bytes)",
  "findings": "Directly recorded in net.log. Outbound TCP connection to foreign IP transferred 48 MB.",
  "limitations": "Egress volume verified, but TLS encrypted; cannot confirm whether payload contained accessed file without endpoint memory dump.",
  "coordinates": [2.3, 0.8, -0.3]
}
```

### 4. `reports`
Formal signed audit reports summarizing findings, timelines, and evidentiary limits.

---

## 📡 API Reference & Swagger Documentation

TraceX provides an extensive REST API documented interactively via Swagger UI at `http://127.0.0.1:8000/docs`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service and MongoDB Atlas database connection health check |
| `GET` | `/api/investigations` | List all digital forensic investigations |
| `POST` | `/api/investigations` | Create a new forensic investigation case |
| `GET` | `/api/investigations/{id}` | Get investigation details and status |
| `GET` | `/api/investigations/{id}/summary` | Aggregate metric summary of events, types, and classifications |
| `POST` | `/api/investigations/{id}/evidence` | Ingest multiple log files (`.log`, `.csv`, `.json`), hash, and parse |
| `GET` | `/api/investigations/{id}/evidence` | List all ingested evidence files with SHA-256 hashes |
| `GET` | `/api/investigations/{id}/timeline` | Retrieve chronological timeline and 3D correlation relationships |
| `GET` | `/api/investigations/{id}/correlation` | Retrieve 3D graph nodes and directional vectors |
| `GET` | `/api/investigations/{id}/report` | Retrieve formal audit-grade incident report |
| `POST` | `/api/investigations/{id}/report` | Generate and sign off on a forensic report |

---

## 🧪 Automated Testing

TraceX includes a comprehensive automated test suite for API endpoints, database models, correlation rules, and log parsers.

To execute the test suite:

```powershell
# Windows PowerShell
$env:PYTHONPATH="." ; backend\.venv\Scripts\pytest backend\tests -v
```

```bash
# Linux / macOS
PYTHONPATH="." backend/.venv/bin/pytest backend/tests -v
```

### Test Coverage Highlights:
- **`test_health.py`**: Verifies `/api/health` and database connectivity status.
- **`test_investigations.py`**: Tests Pydantic data models and deterministic correlation rules (IP matching, temporal sequencing, encrypted egress warnings).
- **`test_log_parser.py`**: Tests CSV parsing via Pandas, JSON parsing, and plain text auth log regex extraction into normalized UTC ISO-8601 timestamps.

---

## 🛠 Troubleshooting & FAQ

### 1. MongoDB Atlas Connection Timeout (`ServerSelectionTimeoutError`)
- **Cause**: Your current IP address is not whitelisted in the MongoDB Atlas Network Access panel.
- **Solution**: Log in to [MongoDB Atlas](https://cloud.mongodb.com/) → **Security** → **Network Access** → Click **Add IP Address** → Choose **Add Current IP Address** or `0.0.0.0/0` (for testing). Wait 60 seconds for the change to deploy.

### 2. Windows PowerShell Script Execution Policy (`Activate.ps1 cannot be loaded`)
- **Cause**: PowerShell restricts execution of unsigned scripts by default.
- **Solution**: Run PowerShell as Administrator and run:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
  Or activate using Command Prompt (`cmd.exe`):
  ```cmd
  backend\.venv\Scripts\activate.bat
  ```

### 3. Frontend Displays "OFFLINE / SYNTHETIC DEMO"
- **Cause**: The frontend cannot reach `http://127.0.0.1:8000/api/health`.
- **Solution**: Ensure your backend uvicorn process is running. The frontend gracefully falls back to synthetic demonstration data if the backend is temporarily offline, ensuring zero UI breakage.

### 4. Port Conflicts (`Address already in use`)
- If port `8000` is occupied, specify an alternate port when running uvicorn:
  ```bash
  uvicorn backend.app.main:app --host 127.0.0.1 --port 8080 --reload
  ```
  And update `src/services/api.js` `API_BASE_URL` accordingly.

---

## ⚖️ Forensic Disclaimer

This software is designed for forensic incident response training, hackathons, and threat reconstruction. The synthetic demo scenario (`inv-demo-synthetic-01`) is an artificial demonstration designed to illustrate temporal correlation across authentication, file system, and perimeter network logs. In accordance with digital forensics standards, correlation implies temporal sequence and behavioral overlap, but does not substitute for conclusive cryptographic or host memory artifact verification.

---

**Developed for the TraceX Cyber Forensics Initiative.**
Reconstruct the Incident. Follow the Evidence. Enforce the Truth.
