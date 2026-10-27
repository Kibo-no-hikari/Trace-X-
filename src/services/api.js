import { DEMO_EVENTS, DEMO_CORRELATIONS } from '../data/demoEvents';
import { DEMO_EVIDENCE_FILES } from '../data/demoEvidence';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ForensicsApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.isBackendConnected = false;
    this.isDbConnected = false;
    this.activeInvestigationId = 'inv-demo-synthetic-01';
  }

  /**
   * Check real status of backend FastAPI server and MongoDB Atlas
   */
  async checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${this.baseUrl}/api/health`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.isBackendConnected = true;
        this.isDbConnected = data.database === 'connected';
        return {
          connected: true,
          databaseConnected: this.isDbConnected,
          url: this.baseUrl,
          mode: this.isDbConnected ? 'LIVE_BACKEND' : 'SYNTHETIC_DEMO',
          status: data.status,
          details: data.details,
        };
      }
      this.isBackendConnected = false;
      this.isDbConnected = false;
      return {
        connected: false,
        databaseConnected: false,
        url: this.baseUrl,
        mode: 'SYNTHETIC_DEMO',
        reason: 'Backend returned non-200 status.',
      };
    } catch {
      this.isBackendConnected = false;
      this.isDbConnected = false;
      return {
        connected: false,
        databaseConnected: false,
        url: this.baseUrl,
        mode: 'SYNTHETIC_DEMO',
        reason: 'Backend offline or unreachable. Using synthetic demonstration dataset.',
      };
    }
  }

  /**
   * Investigations CRUD
   */
  async createInvestigation(data) {
    const health = await this.checkBackendHealth();
    if (health.connected && health.databaseConnected) {
      const response = await fetch(`${this.baseUrl}/api/investigations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create investigation');
      }
      const created = await response.json();
      this.activeInvestigationId = created.id;
      return created;
    }
    return {
      id: `inv-local-${Date.now()}`,
      title: data.title,
      description: data.description,
      status: 'ACTIVE',
      dataset_type: 'synthetic',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isSynthetic: true,
    };
  }

  async listInvestigations() {
    const health = await this.checkBackendHealth();
    if (health.connected && health.databaseConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/api/investigations`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Investigations list fetch failed, falling back:', err);
      }
    }
    return [
      {
        id: 'inv-demo-synthetic-01',
        title: 'Incident Reconstruction Demo — Unauthorized Spreadsheet Egress',
        description: 'Synthetic multi-source scenario across 3 forensic log sources.',
        status: 'COMPLETED',
        dataset_type: 'synthetic',
        evidence_count: 3,
        event_count: 4,
        isSynthetic: true,
      },
    ];
  }

  async getInvestigationSummary(investigationId = this.activeInvestigationId) {
    const health = await this.checkBackendHealth();
    if (health.connected && health.databaseConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/api/investigations/${investigationId}/summary`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Summary fetch failed:', err);
      }
    }
    return {
      investigation_id: investigationId,
      title: 'Incident Reconstruction Demo — Unauthorized Spreadsheet Egress',
      status: 'ACTIVE',
      dataset_type: 'synthetic',
      evidence_source_count: 4,
      total_event_count: 20082,
      event_counts_by_type: { AUTH_FAILURE: 5, AUTH_SUCCESS: 1, FILE_ACCESS: 1, NETWORK_EGRESS: 1 },
      event_counts_by_classification: { FACT: 4, LIKELY: 2, UNKNOWN: 1 },
      earliest_event_timestamp: '2026-10-27T02:03:00Z',
      latest_event_timestamp: '2026-10-27T02:09:00Z',
      relationships_count: 3,
      processing_status: 'COMPLETED',
      isSynthetic: true,
    };
  }

  /**
   * Upload evidence files (.log, .csv, .json)
   */
  async uploadEvidence(files, investigationId = this.activeInvestigationId) {
    if (!files || files.length === 0) {
      throw new Error('No evidence files provided.');
    }

    const health = await this.checkBackendHealth();

    if (health.connected && health.databaseConnected) {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`${this.baseUrl}/api/investigations/${investigationId}/evidence`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
      }

      return await response.json();
    } else {
      // Clear demo simulation fallback
      const simulatedFiles = Array.from(files).map((f, idx) => ({
        id: `ev-local-${Date.now()}-${idx}`,
        fileName: f.name,
        original_filename: f.name,
        fileType: f.name.split('.').pop()?.toLowerCase() || 'unknown',
        category: f.name.includes('auth')
          ? 'AUTHENTICATION'
          : f.name.includes('net')
          ? 'NETWORK'
          : 'FILE_SYSTEM',
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        sizeBytes: f.size,
        eventCount: Math.floor(f.size / 450) + 50,
        sourceHost: 'investigation-workstation',
        sha256: 'simulated-' + Math.random().toString(36).substring(2, 15),
        uploadTime: new Date().toISOString(),
        status: 'PARSED',
        isSynthetic: true,
        description: 'Uploaded in demonstration mode without active database parser.',
      }));

      return {
        status: 'success',
        mode: 'SYNTHETIC_DEMO',
        message: 'Evidence received in demonstration mode.',
        investigation_id: investigationId,
        files: simulatedFiles,
      };
    }
  }

  /**
   * Get all evidence files
   */
  async getEvidenceFiles(investigationId = this.activeInvestigationId) {
    const health = await this.checkBackendHealth();
    if (health.connected && health.databaseConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/api/investigations/${investigationId}/evidence`);
        if (response.ok) {
          const files = await response.json();
          return {
            mode: 'LIVE_BACKEND',
            data: files,
          };
        }
      } catch (err) {
        console.warn('Failed to fetch evidence from backend:', err);
      }
    }
    return {
      mode: 'SYNTHETIC_DEMO',
      data: DEMO_EVIDENCE_FILES,
      isSynthetic: true,
    };
  }

  /**
   * Get chronological timeline events
   */
  async getTimelineEvents(filters = {}, investigationId = this.activeInvestigationId) {
    const health = await this.checkBackendHealth();
    if (health.connected && health.databaseConnected) {
      try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${this.baseUrl}/api/investigations/${investigationId}/timeline?${queryParams}`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Backend timeline fetch failed:', err);
      }
    }
    return {
      mode: 'SYNTHETIC_DEMO',
      data: DEMO_EVENTS,
      events: DEMO_EVENTS,
      correlations: DEMO_CORRELATIONS,
      totalCount: DEMO_EVENTS.length,
      warning:
        'Possible incident sequence. Correlation does not prove causation or confirm data theft. Synthetic demonstration data.',
      isSynthetic: true,
    };
  }

  /**
   * Get correlation network data
   */
  async getCorrelationNetwork(investigationId = this.activeInvestigationId) {
    const health = await this.checkBackendHealth();
    if (health.connected && health.databaseConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/api/investigations/${investigationId}/correlations`);
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Backend correlation fetch failed:', err);
      }
    }
    return {
      mode: 'SYNTHETIC_DEMO',
      nodes: DEMO_EVENTS,
      links: DEMO_CORRELATIONS,
      principle: 'No Evidence, No Claim.',
      isSynthetic: true,
    };
  }

  /**
   * Generate formal forensic report
   */
  async generateReport(investigationId = this.activeInvestigationId, payload = {}) {
    const health = await this.checkBackendHealth();
    if (health.connected && health.databaseConnected) {
      try {
        const response = await fetch(`${this.baseUrl}/api/investigations/${investigationId}/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) return await response.json();
      } catch (err) {
        console.warn('Backend report generation failed:', err);
      }
    }

    // Default synthetic report format
    return {
      reportId: `TRX-${Date.now().toString(36).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      mode: 'SYNTHETIC_DEMO',
      isSynthetic: true,
      title: 'Digital Forensics Incident Timeline Reconstruction',
      tagline: 'Reconstruct the Incident. Follow the Evidence.',
      principle: 'No Evidence, No Claim.',
      investigator: payload.investigator || 'Forensic Lead — Security Operations',
      scope: 'Temporal reconstruction of authentications, file access, and network egress across 3 log sources.',
      evidenceSources: DEMO_EVIDENCE_FILES,
      timelineEvents: DEMO_EVENTS,
      correlations: DEMO_CORRELATIONS,
      recordedFindings: [
        {
          id: 'FND-01',
          classification: 'FACT',
          title: 'Repeated External Authentication Failures',
          details:
            'Five consecutive failed password attempts were recorded at 02:03 UTC from external IP 198.51.100.44 targeting "admin".',
        },
        {
          id: 'FND-02',
          classification: 'FACT',
          title: 'Subsequent Successful Authentication from Same Origin',
          details:
            'At 02:05 UTC, exactly two minutes after the failed attempts, a successful SSH session was opened for "admin" from the identical remote IP 198.51.100.44.',
        },
        {
          id: 'FND-03',
          classification: 'FACT',
          title: 'Sensitive File Access Handle Initiated',
          details:
            'At 02:07 UTC, a read handle for "/shares/finance/confidential/salary.xlsx" was logged under active UID 1000.',
        },
        {
          id: 'FND-04',
          classification: 'FACT',
          title: 'High Volume Outbound TLS Egress',
          details:
            'At 02:09 UTC, 50,331,648 bytes (48 MB) were transmitted outbound to unknown destination IP 203.0.113.89:443.',
        },
        {
          id: 'FND-05',
          classification: 'LIKELY',
          title: 'Correlated Access by Compromised Session',
          details:
            'The close temporal proximity (120s) and identical IP address make it likely that the failed logins and successful access represent an unauthorized intrusion attempt.',
        },
        {
          id: 'FND-06',
          classification: 'UNKNOWN',
          title: 'Exfiltration Payload Verification',
          details:
            'CRITICAL LIMITATION: The available network telemetry does not contain packet payload decryption. It is UNKNOWN and unconfirmed whether the 48 MB egress contained salary.xlsx or unrelated traffic.',
        },
      ],
      limitations: [
        'TLS encryption prevented deep payload inspection on perimeter network log.',
        'Endpoint memory dump and command-line execution arguments were not captured in the supplied log set.',
        'File access logging confirms file handle open event, but does not provide sector-level disk read telemetry.',
      ],
      conclusion:
        'The available evidence establishes a chronological sequence of failed logins, successful entry, file access, and high-volume egress. In accordance with the "No Evidence, No Claim" principle, exfiltration of salary.xlsx is suspected but remains strictly UNKNOWN until decrypted payload or endpoint artifact proof is provided.',
    };
  }
}

export const api = new ForensicsApiService();
export default api;
