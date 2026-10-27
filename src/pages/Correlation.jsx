import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import CorrelationGraph from '../components/3d/CorrelationGraph';
import InteractiveDemoModal from '../components/demo/InteractiveDemoModal';

export default function Correlation() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#050811] text-slate-100 overflow-hidden font-sans">
      <Sidebar onTriggerDemo={() => setIsDemoModalOpen(true)} />

      <InteractiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <CorrelationGraph />
      </div>
    </div>
  );
}
