import { DEMO_EVENTS, DEMO_CORRELATIONS } from '../data/demoEvents';
import { DEMO_EVIDENCE_FILES } from '../data/demoEvidence';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ForensicsApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isBackendConnected = false;
    this.hasCheckedConnection = false;
  }

  /**
   * Check if backend FastAPI service is reachable
   */
  async checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);
      
      this.isBackendConnected = response.ok;
      this.hasCheckedConnection = true;
      return {
        connected: response.ok,
        url: this.baseUrl,
        mode: response.ok ? 'LIVE_BACKEND' : 'SYNTHETIC_DEMO'
      };
    } catch {
      this.isBackendConnected = false;
      this.hasCheckedConnection = true;
      return {
        connected: false,
        url: this.baseUrl,
        mode: 'SYNTHETIC_DEMO',
        reason: 'Backend service offline or unreachable. Using synthetic demonstration dataset.'
      };
    }
  }

  /**
   * Upload evidence files (.log, .csv, .json)
   */
  async uploadEvidence(files) {
    if (!files || files.length === 0) {
      throw new Error('No evidence files provided.');
    }

    // Check backend connection first
    const health = await this.checkBackendHealth();
    
    if (health.connected) {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${this.baseUrl}/api/v1/evidence/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
      }

      return await response.json();
    } else {
      // Return synthetic uploaded files structure with clear demo notice
      const simulatedFiles = Array.from(files).map((f, idx) => ({
        id: `ev-local-${Date.now()}-${idx}`,
        fileName: f.name,
        fileType: f.name.split('.').pop()?.toLowerCase() || 'unknown',
        category: f.name.includes('auth') ? 'AUTHENTICATION' : f.name.includes('net') ? 'NETWORK' : 'FILE_SYSTEM',
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        sizeBytes: f.size,
        eventCount: Math.floor(f.size / 450) + 50,
        sourceHost: 'investigation-workstation',
        sha256: 'simulated-' + Math.random().toString(36).substring(2, 15),
        uploadTime: new Date().toISOString(),
        status: 'SIMULATED_DEMO_PARSED',
        isSynthetic: true,
        description: 'Uploaded in demonstration mode without active backend parser.'
      }));

      return {
        status: 'success',
        mode: 'SYNTHETIC_DEMO',
        message: 'Evidence received in offline demonstration mode.',
        files: simulatedFiles
      };
    }
  }

  /**
   * Get all evidence files
   */
  async getEvidenceFiles() {
    const health = await this.checkBackendHealth();
    if (health.connected) {
      try {
        const response = await fetch(`${this.baseUrl}/api/v1/evidence`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Failed to fetch from backend, falling back to demo data:', err);
      }
    }
    return {
      mode: 'SYNTHETIC_DEMO',
      data: DEMO_EVIDENCE_FILES
    };
  }

  /**
   * Get timeline events
   */
  async getTimelineEvents(filters = {}) {
    const health = await this.checkBackendHealth();
    if (health.connected) {
      try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${this.baseUrl}/api/v1/timeline?${queryParams}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Backend timeline fetch failed, using synthetic timeline:', err);
      }
    }
    return {
      mode: 'SYNTHETIC_DEMO',
      data: DEMO_EVENTS,
      correlations: DEMO_CORRELATIONS,
      totalCount: DEMO_EVENTS.length,
      warning: "Possible incident sequence. Correlation does not prove causation or confirm data theft. Synthetic demonstration data."
    };
  }

  /**
   * Get correlation network data
   */
  async getCorrelationNetwork() {
    const health = await this.checkBackendHealth();
    if (health.connected) {
      try {
        const response = await fetch(`${this.baseUrl}/api/v1/correlations`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Backend correlation fetch failed:', err);
      }
    }
    return {
      mode: 'SYNTHETIC_DEMO',
      nodes: DEMO_EVENTS,
      links: DEMO_CORRELATIONS,
      principle: "No Evidence, No Claim."
    };
  }

  /**
   * Generate forensic report
   */
  async generateReport() {
    return {
      reportId: `TRX-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      mode: 'SYNTHETIC_DEMO',
      title: 'Digital Forensics Incident Timeline Reconstruction',
      tagline: 'Reconstruct the Incident. Follow the Evidence.',
      principle: 'No Evidence, No Claim.',
      investigator: 'Forensic Lead — Security Operations',
      scope: 'Temporal reconstruction of authentications, file access, and network egress across 3 log sources.',
      evidenceSources: DEMO_EVIDENCE_FILES,
      timelineEvents: DEMO_EVENTS,
      correlations: DEMO_CORRELATIONS,
      recordedFindings: [
        {
          id: 'FND-01',
          classification: 'FACT',
          title: 'Repeated External Authentication Failures',
          description: 'Five consecutive failed login attempts were recorded at 02:03 UTC from external IP 198.51.100.44 targeting the "admin" user account.'
        },
        {
          id: 'FND-02',
          classification: 'FACT',
          title: 'Subsequent Successful Authentication from Same Origin',
          description: 'At 02:05 UTC, exactly two minutes after the failed attempts, a successful SSH session was opened for "admin" from the identical remote IP 198.51.100.44.'
        },
        {
          id: 'FND-03',
          classification: 'FACT',
          title: 'Sensitive File Access Handle Initiated',
          description: 'At 02:07 UTC, a read handle for "/shares/finance/confidential/salary.xlsx" was logged under active UID 1000.'
        },
        {
          id: 'FND-04',
          classification: 'FACT',
          title: 'High Volume Outbound TLS Egress',
          description: 'At 02:09 UTC, 50,331,648 bytes (48 MB) were transmitted outbound to unknown destination IP 203.0.113.89:443.'
        },
        {
          id: 'FND-05',
          classification: 'LIKELY',
          title: 'Correlated Access by Compromised Session',
          description: 'The close temporal proximity (120s) and identical IP address make it likely that the failed logins and successful access represent an unauthorized intrusion attempt.'
        },
        {
          id: 'FND-06',
          classification: 'UNKNOWN',
          title: 'Exfiltration Payload Verification',
          description: 'CRITICAL LIMITATION: The available network telemetry does not contain packet payload decryption. It is UNKNOWN and unconfirmed whether the 48 MB egress contained salary.xlsx or unrelated traffic.'
        }
      ],
      limitations: [
        'TLS encryption prevented deep payload inspection on the perimeter network log.',
        'Endpoint memory dump and command-line execution arguments were not captured in the supplied log set.',
        'File access logging confirms file handle open event, but does not provide sector-level disk read telemetry.'
      ],
      conclusion: 'The available evidence establishes a chronological sequence of failed logins, successful entry, file access, and high-volume egress. In accordance with the "No Evidence, No Claim" principle, exfiltration of salary.xlsx is suspected but remains strictly UNKNOWN until decrypted payload or endpoint artifact proof is provided.'
    };
  }
}

export const api = new ForensicsApiService();
export default api;
