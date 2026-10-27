import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Printer,
  Download,
  FileText,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  HelpCircle,
  Copy,
  Check,
  Share2,
  Lock,
  FileCode,
  Network
} from 'lucide-react';
import { DEMO_EVENTS, DEMO_CORRELATIONS, FORENSIC_WARNING } from '../../data/demoEvents';
import { DEMO_EVIDENCE_FILES } from '../../data/demoEvidence';
import { getClassificationBadge, getSeverityBadge } from '../../utils/formatTimestamp';
import Button from '../ui/Button';

export default function ReportViewer() {
  const [copiedSummary, setCopiedSummary] = useState(false);

  const reportData = {
    caseId: 'TRX-2026-OCT27-01',
    classificationLevel: 'CONFIDENTIAL // FORENSIC SENSITIVE',
    investigationTitle: 'Attack Timeline Reconstruction & Egress Telemetry Analysis',
    investigator: 'Digital Forensics Unit — Lead Analyst',
    status: 'COMPLETED // EVIDENCE-BOUND',
    generatedDate: '2026-10-27 02:45:00 UTC',
    tagline: 'Reconstruct the Incident. Follow the Evidence.',
    corePrinciple: 'No Evidence, No Claim.',
    evidenceSources: DEMO_EVIDENCE_FILES,
    events: DEMO_EVENTS,
    correlations: DEMO_CORRELATIONS,
    recordedFindings: [
      {
        id: 'FND-01',
        classification: 'FACT',
        title: 'Repeated External Authentication Failures',
        details: 'Five consecutive failed password authentication attempts were directly recorded at 02:03 UTC from external IP 198.51.100.44 against the administrative user account in auth.log.'
      },
      {
        id: 'FND-02',
        classification: 'FACT',
        title: 'Subsequent Successful Interactive Login from Same Origin',
        details: 'At 02:05 UTC, exactly two minutes after the failed attempts, an interactive SSH session was successfully authenticated for user "admin" from the exact same remote IP 198.51.100.44.'
      },
      {
        id: 'FND-03',
        classification: 'FACT',
        title: 'Confidential Salary Document Read Operation',
        details: 'At 02:07 UTC, an open/read file handle operation was logged in files.csv targeting "/shares/finance/confidential/salary.xlsx" under UID 1000.'
      },
      {
        id: 'FND-04',
        classification: 'FACT',
        title: 'High-Volume TLS Egress to External Host',
        details: 'At 02:09 UTC, net.log recorded an outbound connection to 203.0.113.89:443 transferring 50,331,648 bytes (48.0 MB) over a 14.2 second duration.'
      },
      {
        id: 'FND-05',
        classification: 'LIKELY',
        title: 'Correlated Access Sequence by Intruder',
        details: 'The identical remote IP address (198.51.100.44) and 120-second temporal gap strongly suggest that the five failed attempts and subsequent login represent a successful brute-force or credential validation attack.'
      },
      {
        id: 'FND-06',
        classification: 'UNKNOWN',
        title: 'Confirmation of Data Exfiltration Payload',
        details: 'CRITICAL LIMITATION: The 48 MB network egress on port 443 was TLS encrypted. Available perimeter NetFlow telemetry lacks packet payload decryption. It is strictly UNKNOWN whether the egress payload contained salary.xlsx or unrelated data.'
      }
    ],
    limitations: [
      'TLS / SSL encryption on perimeter network egress prevented deep content packet inspection.',
      'Endpoint memory dumps, bash history, and process execution trees were unavailable in the provided evidence log set.',
      'Audit logging on fs-shares-internal recorded file open events, but disk sector block read telemetry was not available.'
    ],
    conclusion: 'The available evidence chronologically establishes an authentication burst, a successful entry from the same IP, access to a confidential spreadsheet, and a large outbound network transfer. In strict accordance with the "No Evidence, No Claim" forensic doctrine, exfiltration is suspected but CANNOT be asserted as established fact without payload decryption or endpoint staging artifacts.'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(reportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `TraceX-Forensic-Report-${reportData.caseId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopySummary = () => {
    const summaryText = `[TraceX Forensic Incident Report: ${reportData.caseId}]
Status: ${reportData.status}
Principle: "${reportData.corePrinciple}"
Events Reconstructed: ${reportData.events.length}
Findings: ${reportData.recordedFindings.map((f) => `\n- [${f.classification}] ${f.title}: ${f.details}`).join('')}
Conclusion: ${reportData.conclusion}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="no-print p-4 rounded-xl glass-panel border border-cyan-500/25 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">
              Investigation Case Report: {reportData.caseId}
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">
              Forensic Chain-of-Custody Verified • Strict Classification
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={copiedSummary ? Check : Copy}
            onClick={handleCopySummary}
            className="text-xs"
          >
            {copiedSummary ? 'Summary Copied' : 'Copy Summary'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportJSON}
            className="text-xs"
          >
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
            className="text-xs"
          >
            Print / Export PDF
          </Button>
        </div>
      </div>

      {/* Main Forensic Report Sheet */}
      <div className="p-6 sm:p-10 rounded-2xl glass-panel border border-cyan-500/20 bg-[#060a17]/90 text-slate-100 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Formal Case Header */}
        <div className="border-b-2 border-cyan-500/40 pb-6 print:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan-400 print:text-cyan-800 uppercase">
                <Shield className="w-4 h-4" />
                <span>TraceX Forensic Investigation Workstation</span>
              </div>
              <h1 className="mt-2 text-xl sm:text-2xl font-bold font-mono text-white print:text-slate-900">
                {reportData.investigationTitle}
              </h1>
              <p className="mt-1 text-xs text-slate-400 print:text-slate-600 font-mono">
                {reportData.tagline}
              </p>
            </div>

            <div className="text-right text-xs font-mono space-y-1">
              <div className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold print:bg-slate-100 print:text-slate-900 inline-block">
                CASE ID: {reportData.caseId}
              </div>
              <div className="text-slate-400 print:text-slate-600 text-[11px]">
                Generated: {reportData.generatedDate}
              </div>
              <div className="text-emerald-400 print:text-emerald-700 text-[11px] font-semibold">
                STATUS: {reportData.status}
              </div>
            </div>
          </div>

          {/* Principle Callout */}
          <div className="mt-4 p-3 rounded-lg bg-cyan-500/10 border-l-4 border-cyan-400 text-xs font-mono text-cyan-200 print:bg-slate-50 print:text-slate-800 print:border-slate-800">
            <span className="font-bold text-cyan-300 print:text-cyan-900">Core Evidentiary Principle: </span>
            "{reportData.corePrinciple}" — Claims must be tethered to verifiable raw log artifacts. Unverified conclusions are categorized as UNKNOWN.
          </div>
        </div>

        {/* 1. Evidence Source Inventory */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 print:text-cyan-900 flex items-center gap-2">
            <span>01. Ingested Evidence Sources</span>
            <span className="text-slate-500">({reportData.evidenceSources.length} files)</span>
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Host Origin</th>
                  <th className="py-2.5 px-3">Size / Records</th>
                  <th className="py-2.5 px-3">Cryptographic SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-800">
                {reportData.evidenceSources.map((file) => (
                  <tr key={file.id}>
                    <td className="py-2 px-3 font-bold text-white print:text-black">{file.fileName}</td>
                    <td className="py-2 px-3 text-cyan-400 print:text-cyan-800">{file.category}</td>
                    <td className="py-2 px-3">{file.sourceHost}</td>
                    <td className="py-2 px-3">{file.size} ({file.eventCount} events)</td>
                    <td className="py-2 px-3 text-[10px] text-slate-400 print:text-slate-600 truncate max-w-xs">{file.sha256}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Chronological Timeline */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 print:text-cyan-900">
            02. Reconstructed Incident Timeline
          </h2>

          <div className="divide-y divide-slate-800 print:divide-slate-200 rounded-xl border border-slate-800 print:border-slate-300 overflow-hidden">
            {reportData.events.map((evt) => {
              const classification = getClassificationBadge(evt.classification);
              const severity = getSeverityBadge(evt.severity);

              return (
                <div key={evt.id} className="p-3.5 bg-slate-950/40 print:bg-white text-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300 print:text-cyan-800">{evt.displayTime}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-white print:text-black font-semibold">{evt.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${classification.bg} ${classification.border} ${classification.text}`}>
                        {classification.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Source: {evt.sourceFile}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 print:text-slate-700 font-sans text-xs">
                    {evt.findings || evt.details}
                  </p>

                  <div className="p-2 rounded bg-black/60 print:bg-slate-100 font-mono text-[10px] text-cyan-300 print:text-slate-800 truncate">
                    <code>{evt.rawRecord}</code>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Recorded Findings (Distinguishing FACT, LIKELY, UNKNOWN) */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 print:text-cyan-900">
            03. Evidentiary Findings (FACT, LIKELY, UNKNOWN)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportData.recordedFindings.map((finding) => {
              const classification = getClassificationBadge(finding.classification);

              return (
                <div
                  key={finding.id}
                  className="p-4 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-950/50 print:bg-slate-50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-white print:text-slate-900">
                      {finding.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${classification.bg} ${classification.border} ${classification.text}`}>
                      {finding.classification}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 print:text-slate-700 font-sans leading-relaxed">
                    {finding.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Unknowns & Critical Limitations */}
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 print:text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>04. Evidentiary Limitations & Gaps</span>
          </h2>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/25 print:border-amber-300 text-xs text-amber-200/90 print:text-amber-900 space-y-2">
            <p className="font-semibold font-mono">
              The following limitations preclude definitive conclusion of data theft:
            </p>
            <ul className="list-disc list-inside space-y-1 font-sans pl-1">
              {reportData.limitations.map((limit, i) => (
                <li key={i}>{limit}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. Formal Conclusion */}
        <div className="border-t-2 border-slate-800 print:border-slate-300 pt-6 space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 print:text-cyan-900">
            05. Forensic Assessment Conclusion
          </h2>
          <p className="text-xs font-sans text-slate-200 print:text-slate-800 leading-relaxed bg-slate-950/60 print:bg-slate-50 p-4 rounded-xl border border-slate-800 print:border-slate-300">
            {reportData.conclusion}
          </p>
        </div>

        {/* Forensic Sign-Off Block */}
        <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 print:text-slate-600">
          <div>
            Investigator Sign-off: <span className="text-slate-200 print:text-black font-semibold">Security Operations Forensics Team</span>
          </div>
          <div>
            Hash: SHA256:4a8c9b...Verified • TraceX Engine v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
