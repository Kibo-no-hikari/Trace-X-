import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Layers,
  Database,
  ArrowRight,
  Shield,
  FileCode,
  Sparkles,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import FileUploader from '../components/evidence/FileUploader';
import EvidenceList from '../components/evidence/EvidenceList';
import InteractiveDemoModal from '../components/demo/InteractiveDemoModal';
import { DEMO_EVIDENCE_FILES } from '../data/demoEvidence';
import Button from '../components/ui/Button';

import api from '../services/api';

export default function EvidenceImport() {
  const [evidenceFiles, setEvidenceFiles] = useState(DEMO_EVIDENCE_FILES);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getEvidenceFiles().then((res) => {
      if (res && res.data && res.data.length > 0) {
        setEvidenceFiles(res.data);
      }
    });
  }, []);

  const handleEvidenceUploaded = (newFiles, mode) => {
    setEvidenceFiles((prev) => [...newFiles, ...prev]);
    setUploadMessage({
      type: 'success',
      text: mode === 'LIVE_BACKEND'
        ? `Successfully ingested ${newFiles.length} evidence logs through backend API.`
        : `Ingested ${newFiles.length} files in client forensic simulation mode. Demonstrating chronological timeline.`
    });
  };

  return (
    <div className="flex h-screen bg-[#050811] text-slate-100 overflow-hidden font-sans">
      <Sidebar onTriggerDemo={() => setIsDemoModalOpen(true)} />

      <InteractiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 px-6 border-b border-cyan-500/15 bg-[#060a17]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <h1 className="font-mono text-base font-bold text-white tracking-wide">
              Evidence Ingestion & Telemetry Normalization
            </h1>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate('/investigation/timeline')}
            className="text-xs"
          >
            Go to Timeline
          </Button>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-6xl mx-auto w-full">
          {/* Top Info Callout */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Forensic Ingestion Guarantee: </span>
                Only <code>.log</code>, <code>.csv</code>, and <code>.json</code> formats are accepted. SHA-256 hashes are verified to maintain chain of custody.
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={() => setIsDemoModalOpen(true)}
              className="text-xs shrink-0"
            >
              Demo Walkthrough
            </Button>
          </div>

          {/* Upload Component */}
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>Evidence Upload Portal</span>
            </h2>
            <FileUploader
              onEvidenceUploaded={handleEvidenceUploaded}
              onLaunchDemo={() => setIsDemoModalOpen(true)}
            />
          </div>

          {/* Active Evidence List */}
          <div className="pt-4 border-t border-slate-800">
            <EvidenceList
              files={evidenceFiles}
              onSelectFile={(f) => navigate('/investigation/timeline')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
