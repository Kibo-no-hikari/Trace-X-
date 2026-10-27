# TraceX — Digital Forensics & Attack Timeline Reconstruction

> **"Reconstruct the Incident. Follow the Evidence."**  
> **Core Principle: "No Evidence, No Claim."**

TraceX is a modern, 3D-accelerated digital forensics workstation that reconstructs security incidents by combining scattered log files into a synchronized chronological timeline. It automatically normalizes timestamps, maps evidence relationships in 3D, and distinguishes between confirmed facts and unverified claims.

---

## ⚡ Technology Stack

- **Frontend Core**: React 19 (JavaScript only, JSX, no TypeScript)
- **Build & Dev Server**: Vite 8 with HMR
- **Styling**: Tailwind CSS v4 with glassmorphism and cybersecurity workstation theme
- **3D Engine**: Three.js, `@react-three/fiber`, and `@react-three/drei`
- **Animations**: Framer Motion
- **Navigation**: React Router DOM (v7)
- **Icons**: Lucide React
- **Analytics & Graphs**: Recharts

---

## 🔬 Key Forensic Features

1. **Interactive 3D Forensics Engine (`/`)**:
   - Central digital core representing the TraceX reconstruction engine.
   - Orbiting evidence nodes for `auth.log`, `files.csv`, and `net.log`.
   - Real-time traveling packet particles along validated correlation edges.
   - Dual-ring scanning radars, wireframe sphere, and 2D fallback for devices without WebGL.

2. **Interactive Demo Mode**:
   - Built-in synthetic demonstration walkthrough requiring **no backend**.
   - Chronological step-by-step playback controls (Play, Pause, Step Forward/Back, Replay, Reset).
   - Reconstructs the 4 synthetic events from 02:03 UTC to 02:09 UTC.

3. **Investigation Dashboard (`/investigation`)**:
   - Collapsible workstation sidebar.
   - Forensic stat cards with animated counters and status indicators.
   - Central chronological timeline with category filters (`AUTH`, `FILES`, `NET`).
   - Deep inspection drawer for raw log telemetry and limitations.

4. **Evidence Ingestion Portal (`/investigation/import`)**:
   - Drag-and-drop file ingestion supporting `.log`, `.csv`, and `.json`.
   - Client-side validation against unsupported formats and file size limits.
   - Cryptographic SHA-256 checksum calculation for chain-of-custody tracking.
   - Backend API connection test with graceful synthetic demo fallback.

5. **Chronological Incident Timeline (`/investigation/timeline`)**:
   - Displays all 4 sequence events with glowing markers.
   - Full search across title, host, raw log text, and IP addresses.
   - Sort toggle: Earliest First vs. Latest First.
   - Visual Timeline View vs. Dense Forensic Table View.
   - Prominent forensic notice: *"Possible incident sequence. Correlation does not prove causation or confirm data theft. Synthetic demonstration data."*

6. **Interactive 3D Correlation Graph (`/investigation/correlation`)**:
   - Renders evidence events as 3D nodes and verified relationships as edges.
   - Animated flow particles along supported connections.
   - Distinguishes between direct records and supported correlations.
   - Category filtering, real-time node inspection, and legend.

7. **Official Forensic Case Report (`/investigation/report`)**:
   - Formal case header with Case ID, status, and lead investigator sign-off.
   - Evidence source inventory with cryptographic SHA-256 hashes.
   - Categorized findings with strict evidentiary classification:
     - **`FACT`**: Directly recorded in raw logs.
     - **`LIKELY`**: Strong probabilistic correlation supported by timestamps and IP match.
     - **`UNKNOWN`**: Something available evidence cannot prove (e.g., encrypted egress payloads).
   - One-click Print Report, Export PDF, and Export JSON.

---

## 📁 Project Structure

```text
src/
  components/
    3d/
      HeroScene.jsx          # Interactive 3D hero canvas & 2D fallback
      EvidenceSphere.jsx     # Central glowing engine, orbiting nodes & scanning rings
      EvidenceNode.jsx       # Individual 3D evidence node with HTML labels
      CorrelationGraph.jsx   # Full 3D network graph with interactive edges
    dashboard/
      StatCard.jsx           # Animated forensic metric cards
      EventTimeline.jsx      # Chronological timeline & table toggle
      EventDetails.jsx       # Raw log inspector & forensic limitation viewer
    demo/
      InteractiveDemoModal.jsx # Step-by-step synthetic incident walkthrough
    evidence/
      FileUploader.jsx       # Drag-and-drop log ingestion (.log, .csv, .json)
      EvidenceList.jsx       # Ingested evidence inventory & SHA-256 verification
    layout/
      Navbar.jsx             # Cyber navbar with backend status & quick demo CTA
      Sidebar.jsx            # Collapsible forensic workstation sidebar
      Footer.jsx             # Workstation footer with methodology links
    reports/
      ReportViewer.jsx       # Forensic incident report with export controls
    ui/
      Button.jsx             # Sleek cybersecurity button with sheen animations
      Card.jsx               # Glassmorphic card with cyber crosshairs
      LoadingSpinner.jsx     # Radar pulse spinner
  data/
    demoEvents.js            # Synthetic incident events & correlation links
    demoEvidence.js          # Raw evidence files metadata (auth.log, files.csv, net.log)
  hooks/
    useDemoTimeline.js       # Playback ticker hook for step-by-step timeline demo
  pages/
    Home.jsx                 # Landing page with 3D hero & 5-stage workflow
    Dashboard.jsx            # /investigation main workstation
    EvidenceImport.jsx       # /investigation/import evidence ingestion portal
    Timeline.jsx             # /investigation/timeline chronological sequence
    Correlation.jsx          # /investigation/correlation 3D network graph
    Report.jsx               # /investigation/report audit-grade report
    NotFound.jsx             # 404 Cyber error screen
  services/
    api.js                   # Unified API service with backend health checking
  utils/
    formatTimestamp.js       # UTC formatting, byte parser, FACT/LIKELY/UNKNOWN badges
  App.jsx                    # React Router configuration
  main.jsx                   # React root entry point
  index.css                  # Cyber workstation design tokens & neon glow utilities
```

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Production Build
```bash
npm run build
```
Creates an optimized, minified production bundle in `dist/`.

---

## 🔒 Evidentiary Taxonomy

| Classification | Definition | Example in Scenario |
| :--- | :--- | :--- |
| **`FACT`** | Directly recorded in verifiable log records. | Outbound transfer of 48 MB occurred at 02:09 UTC from internal host. |
| **`LIKELY`** | Strong relationship supported by temporal proximity and identical origin. | Failed logins at 02:03 and successful login at 02:05 from IP 198.51.100.44. |
| **`UNKNOWN`** | Available evidence cannot establish the claim without further artifacts. | Whether the 48 MB egress contained `salary.xlsx` (TLS encrypted stream). |
