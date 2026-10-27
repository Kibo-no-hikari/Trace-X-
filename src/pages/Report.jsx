import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Printer, Shield } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import ReportViewer from '../components/reports/ReportViewer';
import InteractiveDemoModal from '../components/demo/InteractiveDemoModal';
import Button from '../components/ui/Button';

export default function Report() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#050811] text-slate-100 overflow-hidden font-sans">
      <Sidebar onTriggerDemo={() => setIsDemoModalOpen(true)} />

      <InteractiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="no-print h-16 px-6 border-b border-cyan-500/15 bg-[#060a17]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="font-mono text-base font-bold text-white tracking-wide">
              Official Forensic Investigation Case Report
            </h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/investigation/timeline')}
            className="text-xs"
          >
            Back to Timeline
          </Button>
        </header>

        {/* Scrollable Report Body */}
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
          <ReportViewer />
        </div>
      </div>
    </div>
  );
}
