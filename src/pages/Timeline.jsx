import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCommitVertical,
  Share2,
  FileText,
  AlertTriangle,
  Play,
  ArrowUpDown,
  Search,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import EventTimeline from '../components/dashboard/EventTimeline';
import EventDetails from '../components/dashboard/EventDetails';
import InteractiveDemoModal from '../components/demo/InteractiveDemoModal';
import { DEMO_EVENTS } from '../data/demoEvents';
import Button from '../components/ui/Button';

export default function Timeline() {
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(DEMO_EVENTS[0]);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleToggleSort = () => {
    const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(nextOrder);
    setEvents((prev) => [...prev].reverse());
  };

  const filteredEvents = events.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.sourceFile.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      e.rawRecord.toLowerCase().includes(q)
    );
  });

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
            <GitCommitVertical className="w-5 h-5 text-cyan-400" />
            <h1 className="font-mono text-base font-bold text-white tracking-wide">
              Incident Attack Timeline
            </h1>
            <span className="text-xs font-mono text-slate-400">
              (Chronological UTC Sequence)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={Share2}
              onClick={() => navigate('/investigation/correlation')}
              className="text-xs"
            >
              View in 3D Graph
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => navigate('/investigation/report')}
              className="text-xs"
            >
              Generate Report
            </Button>
          </div>
        </header>

        {/* Search & Sort Controls Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event title, IP, file, or log text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSort}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sort: {sortOrder === 'asc' ? 'Earliest First (UTC)' : 'Latest First (UTC)'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Timeline Stream */}
            <div className="lg:col-span-8 space-y-4">
              <EventTimeline
                events={filteredEvents}
                selectedEventId={selectedEvent?.id}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
                showWarning={true}
              />
            </div>

            {/* Evidence Inspector Side Panel */}
            <div className="lg:col-span-4 sticky top-0">
              <div className="h-[620px]">
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
  );
}
