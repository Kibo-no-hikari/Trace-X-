/**
 * Synthetic demonstration evidence files
 * Represents raw forensic logs uploaded by investigators
 */

export const DEMO_EVIDENCE_FILES = [
  {
    id: 'ev-auth-01',
    fileName: 'auth.log',
    fileType: 'log',
    category: 'AUTHENTICATION',
    size: '1.4 MB',
    sizeBytes: 1468006,
    eventCount: 1842,
    sourceHost: 'srv-prod-auth01',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    uploadTime: '2026-10-27T02:00:00Z',
    status: 'PARSED',
    description: 'Linux PAM/sshd authentication logging service records.'
  },
  {
    id: 'ev-file-01',
    fileName: 'files.csv',
    fileType: 'csv',
    category: 'FILE_SYSTEM',
    size: '420 KB',
    sizeBytes: 430080,
    eventCount: 630,
    sourceHost: 'fs-shares-internal',
    sha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    uploadTime: '2026-10-27T02:00:30Z',
    status: 'PARSED',
    description: 'Audit log of file handles, read operations, and file access permissions.'
  },
  {
    id: 'ev-net-01',
    fileName: 'net.log',
    fileType: 'log',
    category: 'NETWORK',
    size: '8.9 MB',
    sizeBytes: 9332326,
    eventCount: 14210,
    sourceHost: 'gw-core-perimeter',
    sha256: '785b07b34d3b48227b409744c803dfa1050a996df8727e4e04044a2b91873fb2',
    uploadTime: '2026-10-27T02:01:00Z',
    status: 'PARSED',
    description: 'Zeek / NetFlow egress and ingress flow telemetry on perimeter gateway.'
  },
  {
    id: 'ev-sys-01',
    fileName: 'syslog.json',
    fileType: 'json',
    category: 'SYSTEM',
    size: '2.1 MB',
    sizeBytes: 2202009,
    eventCount: 3400,
    sourceHost: 'srv-prod-auth01',
    sha256: '9f83c60517b4d0ad720ac928bc4f4c10c4517e999f7cbc32e8e2b2f8871fdd47',
    uploadTime: '2026-10-27T02:01:30Z',
    status: 'PARSED',
    description: 'Systemd daemon lifecycle and cron task execution metrics.'
  }
];
