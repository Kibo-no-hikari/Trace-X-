import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  GitCommitVertical,
  Share2,
  Activity,
  Play,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';
import { DEMO_EVENTS, DEMO_CORRELATIONS, FORENSIC_WARNING } from '../data/demoEvents';
import { DEMO_EVIDENCE_FILES } from '../data/demoEvidence';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import EventTimeline from '../components/dashboard/EventTimeline';
import EventDetails from '../components/dashboard/EventDetails';
import InteractiveDemoModal from '../components/demo/InteractiveDemoModal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Dashboard() {
  const [selectedEvent, setSelectedEvent] = useState(DEMO_EVENTS[0]);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [backendMode, setBackendMode] = useState('SYNTHETIC_DEMO');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      setIsDemoModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    api.checkBackendHealth().then((res) => {
      setBackendMode(res.mode);
    });
  }, []);

  return (
    <div className="flex h-screen bg-[#050811] text-slate-100 overflow-hidden font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar onTriggerDemo={() => setIsDemoModalOpen(true)} />

      {/* Interactive Demo Modal */}
      <InteractiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      {/* Main Forensic Workstation Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 px-6 border-b border-cyan-500/15 bg-[#060a17]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="font-mono text-base font-bold text-white tracking-wide">
                Investigation Overview
              </h1>
            </div>

            {/* Mode badge */}
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
              {backendMode === 'LIVE_BACKEND' ? 'LIVE BACKEND CONNECTED' : 'SYNTHETIC DEMONSTRATION DATA'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={Play}
              onClick={() => setIsDemoModalOpen(true)}
              className="text-xs"
            >
              Interactive Demo
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={UploadCloud}
              onClick={() => navigate('/investigation/import')}
              className="text-xs"
            >
              Import Logs
            </Button>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stat Cards Grid (Section 6 Prompt Requirement) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Evidence Sources"
              value="4 Files"
              subtext="12.8 MB total ingested logs"
              trend="SHA-256 Validated"
              icon={Database}
              variant="cyan"
            />

            <StatCard
              title="Total Events"
              value="20,082"
              subtext="Normalized to UTC chronology"
              trend="4 Key Incident Events"
              icon={GitCommitVertical}
              variant="violet"
            />

            <StatCard
              title="Potentially Related"
              value="3 Links"
              subtext="2 Likely • 1 Unknown Payload"
              trend="Correlation Active"
              icon={Share2}
              variant="amber"
            />

            <StatCard
              title="Investigation Status"
              value="Active Review"
              subtext="No Evidence, No Claim"
              trend="Egress Unconfirmed"
              icon={Shield}
              variant="emerald"
            />
          </div>

          {/* Quick Principle Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Forensic Doctrine: <strong className="text-white">"No Evidence, No Claim."</strong> Every conclusion requires an anchored artifact.</span>
            </div>
            <button
              onClick={() => navigate('/investigation/correlation')}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              <span>Explore in 3D Graph</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Center Timeline + Right Side Details Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Center Timeline Column */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCommitVertical className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    Reconstructed Incident Sequence
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Click an event to inspect original raw record
                </span>
              </div>

              <EventTimeline
                events={DEMO_EVENTS}
                selectedEventId={selectedEvent?.id}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
                showWarning={true}
              />
            </div>

            {/* Right Details Column */}
            <div className="lg:col-span-4 sticky top-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Evidence Inspector
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Live Record View
                  </span>
                </div>

                <div className="h-[580px]">
                  <EventDetails
                    event={selectedEvent}
                    onClose={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
