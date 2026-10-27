import { Shield, Terminal, Cpu, FileSearch, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative bg-[#04060d] border-t border-cyan-500/15 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-mono text-lg font-bold text-white tracking-tight">
                Trace<span className="text-cyan-400">X</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Digital forensics platform that reconstructs possible security incidents by combining scattered log files into an evidence-backed chronological timeline.
            </p>

            <div className="flex flex-col gap-1.5 font-mono text-xs">
              <span className="text-cyan-300/90 font-medium">
                "Reconstruct the Incident. Follow the Evidence."
              </span>
              <span className="text-violet-400/90">
                Core principle: "No Evidence, No Claim."
              </span>
            </div>
          </div>

          {/* Forensic Capabilities */}
          <div>
            <h4 className="font-mono text-xs font-semibold tracking-wider text-slate-300 uppercase mb-3">
              Forensic Stages
            </h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                <span className="text-cyan-500">01.</span> IMPORT (Raw Logs)
              </li>
              <li className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                <span className="text-cyan-500">02.</span> NORMALIZE (Timestamps)
              </li>
              <li className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                <span className="text-cyan-500">03.</span> TIMELINE (Chronology)
              </li>
              <li className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                <span className="text-cyan-500">04.</span> CORRELATE (3D Graph)
              </li>
              <li className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                <span className="text-cyan-500">05.</span> REPORT (Findings)
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="font-mono text-xs font-semibold tracking-wider text-slate-300 uppercase mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-cyan-300 transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/investigation" className="hover:text-cyan-300 transition-colors">
                  Forensic Workstation
                </Link>
              </li>
              <li>
                <Link to="/investigation/import" className="hover:text-cyan-300 transition-colors">
                  Evidence Ingestion
                </Link>
              </li>
              <li>
                <Link to="/investigation/timeline" className="hover:text-cyan-300 transition-colors">
                  Chronological Timeline
                </Link>
              </li>
              <li>
                <Link to="/investigation/correlation" className="hover:text-cyan-300 transition-colors">
                  3D Correlation Graph
                </Link>
              </li>
              <li>
                <Link to="/investigation/report" className="hover:text-cyan-300 transition-colors">
                  Investigation Report
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Warning */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 mb-8 flex items-start gap-2.5">
          <FileSearch className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-cyan-400 font-medium">Forensic Disclaimer:</span> Correlation does not prove causation or confirm data theft without corroborating decrypted packet payloads or memory artifacts. Synthetic demonstration data is provided for educational & evaluation purposes.
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} TraceX Forensics. Built for Digital Forensics & Attack Timeline Reconstruction.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Three.js + React R3F</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400">v1.0.0 Stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
