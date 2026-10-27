/**
 * Synthetic demonstration forensic timeline events
 *
 * Core Principle: "No Evidence, No Claim."
 * Warning: Possible incident sequence. Correlation does not prove causation or confirm data theft. Synthetic demonstration data.
 */

export const DEMO_EVENTS = [
  {
    id: 'EVT-001',
    timestamp: '2026-10-27T02:03:00Z',
    displayTime: '02:03 UTC',
    title: 'Five failed admin logins',
    eventType: 'AUTH_FAILURE',
    category: 'AUTHENTICATION',
    sourceFile: 'auth.log',
    sourceHost: 'srv-prod-auth01',
    severity: 'HIGH',
    classification: 'FACT',
    sourceEvidenceId: 'ev-auth-01',
    actorIp: '198.51.100.44',
    userAccount: 'admin',
    details: 'Multiple invalid password attempts recorded against local administrator account within a 15-second window.',
    rawRecord: 'Oct 27 02:03:12 srv-prod01 sshd[14022]: Failed password for invalid user admin from 198.51.100.44 port 49201 ssh2 (repeated 5 times)',
    findings: 'Directly recorded in auth.log. Repeated PAM auth failures for user "admin" originating from external IP 198.51.100.44.',
    limitations: 'Log records attempt frequency and source socket only. Does not confirm automated brute-force tool vs mistaken user authentication without packet capture.',
    supportedLinks: ['EVT-002'],
    coordinates: [-2.2, 1.2, 0.4] // 3D graph position
  },
  {
    id: 'EVT-002',
    timestamp: '2026-10-27T02:05:00Z',
    displayTime: '02:05 UTC',
    title: 'Successful login from the same IP',
    eventType: 'AUTH_SUCCESS',
    category: 'AUTHENTICATION',
    sourceFile: 'auth.log',
    sourceHost: 'srv-prod-auth01',
    severity: 'CRITICAL',
    classification: 'FACT',
    sourceEvidenceId: 'ev-auth-01',
    actorIp: '198.51.100.44',
    userAccount: 'admin',
    details: 'Successful SSH interactive session authenticated from external IP 198.51.100.44 matching prior failed attempt origin.',
    rawRecord: 'Oct 27 02:05:41 srv-prod01 sshd[14088]: Accepted password for admin from 198.51.100.44 port 49208 ssh2; pam_unix(sshd:session): session opened for user admin by (uid=0)',
    findings: 'Directly recorded in auth.log. Successful session opened for user "admin" from 198.51.100.44 exactly 2 minutes following the 5 failed attempts.',
    limitations: 'Verifies successful authentication handshake. Does not establish credential theft, credential stuffing, or authorized admin access without corroborating user interviews.',
    supportedLinks: ['EVT-001', 'EVT-003'],
    coordinates: [-0.8, 0.5, -0.6] // 3D graph position
  },
  {
    id: 'EVT-003',
    timestamp: '2026-10-27T02:07:00Z',
    displayTime: '02:07 UTC',
    title: 'salary.xlsx accessed',
    eventType: 'FILE_ACCESS',
    category: 'FILE_SYSTEM',
    sourceFile: 'files.csv',
    sourceHost: 'fs-shares-internal',
    severity: 'MEDIUM',
    classification: 'FACT',
    sourceEvidenceId: 'ev-file-01',
    targetFile: '/shares/finance/confidential/salary.xlsx',
    userAccount: 'admin (UID 1000)',
    details: 'File handle read open request executed against confidential salary spreadsheet over internal network share.',
    rawRecord: '"timestamp","uid","process","file_path","action","result"\n"2026-10-27T02:07:18Z","1000","cat/cp","/shares/finance/confidential/salary.xlsx","OPEN_READ","SUCCESS"',
    findings: 'Directly recorded in files.csv. Read/Open handle requested for sensitive document "/shares/finance/confidential/salary.xlsx" under active session UID 1000.',
    limitations: 'Records file read handle open operation. File access does NOT verify whether file contents were read in full, copied, staged to a temporary archive, or encrypted.',
    supportedLinks: ['EVT-002', 'EVT-004'],
    coordinates: [0.9, -0.4, 0.5] // 3D graph position
  },
  {
    id: 'EVT-004',
    timestamp: '2026-10-27T02:09:00Z',
    displayTime: '02:09 UTC',
    title: '48 MB sent to an unknown address',
    eventType: 'NETWORK_EGRESS',
    category: 'NETWORK',
    sourceFile: 'net.log',
    sourceHost: 'gw-core-perimeter',
    severity: 'CRITICAL',
    classification: 'FACT',
    sourceEvidenceId: 'ev-net-01',
    destinationIp: '203.0.113.89',
    destinationPort: 443,
    transferSize: '48.0 MB (50,331,648 bytes)',
    details: 'High-volume outbound TCP/TLS session established to unknown non-whitelisted public address on port 443.',
    rawRecord: 'ts=1793066940.12 uid=ChN8Q4382 id.orig_h=10.0.1.15 id.orig_p=52110 id.resp_h=203.0.113.89 id.resp_p=443 proto=tcp service=ssl orig_bytes=50331648 resp_bytes=4120 conn_state=SF duration=14.2s',
    findings: 'Directly recorded in net.log. Outbound TCP connection to foreign IP 203.0.113.89:443 transferred 50,331,648 bytes (48 MB) in 14.2 seconds.',
    limitations: 'Egress volume and destination IP verified. However, session was encrypted with TLS; available netflow telemetry CANNOT establish whether the 48 MB contained "salary.xlsx" or unrelated payload.',
    supportedLinks: ['EVT-003'],
    coordinates: [2.3, 0.8, -0.3] // 3D graph position
  }
];

/**
 * Forensically supported correlations
 * Strict distinction between FACT, LIKELY, and UNKNOWN
 */
export const DEMO_CORRELATIONS = [
  {
    id: 'CORR-01',
    sourceEventId: 'EVT-001',
    targetEventId: 'EVT-002',
    relationship: 'IP_MATCH_AND_TEMPORAL_PROXIMITY',
    classification: 'LIKELY',
    strength: 'HIGH',
    explanation: 'The successful admin login (02:05) originated from the exact same remote IP (198.51.100.44) as the five failed attempts (02:03), separated by 120 seconds.',
    limitation: 'Available logs cannot eliminate the possibility of a legitimate administrator who mistyped their password 5 times before successfully logging in.'
  },
  {
    id: 'CORR-02',
    sourceEventId: 'EVT-002',
    targetEventId: 'EVT-003',
    relationship: 'SESSION_UID_TEMPORAL_SEQUENCE',
    classification: 'LIKELY',
    strength: 'MEDIUM',
    explanation: 'Interactive admin session opened at 02:05 is followed 2 minutes later (02:07) by read access to salary.xlsx under the admin user context.',
    limitation: 'File access logs show action under UID 1000, which aligns with the admin session. However, concurrent background jobs under UID 1000 cannot be ruled out without process tree telemetry.'
  },
  {
    id: 'CORR-03',
    sourceEventId: 'EVT-003',
    targetEventId: 'EVT-004',
    relationship: 'POST_ACCESS_DATA_EGRESS',
    classification: 'UNKNOWN',
    strength: 'UNCONFIRMED',
    explanation: 'A 48 MB outbound egress occurred at 02:09, two minutes after the salary.xlsx file handle was accessed at 02:07.',
    limitation: 'CRITICAL LIMITATION: The network transfer was TLS encrypted. No endpoint memory dump, packet decryption key, or staging archive log exists to prove the 48 MB payload contained salary.xlsx. "No Evidence, No Claim."'
  }
];

export const FORENSIC_WARNING = "Possible incident sequence. Correlation does not prove causation or confirm data theft. Synthetic demonstration data.";
