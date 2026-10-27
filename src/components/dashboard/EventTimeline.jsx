import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Shield,
  FileCode,
  Network,
  Lock,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Table,
  GitCommitVertical,
  ChevronRight
} from 'lucide-react';
import { DEMO_EVENTS, FORENSIC_WARNING } from '../../data/demoEvents';
import { getClassificationBadge, getSeverityBadge } from '../../utils/formatTimestamp';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function EventTimeline({
  events = DEMO_EVENTS,
  selectedEventId,
  onSelectEvent,
  showWarning = true,
  compact = false
}) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'table'

  // Available unique sources
  const availableSources = useMemo(() => {
    const sources = new Set((events || []).map((e) => e.sourceFile || e.source_filename || 'System Log'));
    return ['ALL', ...Array.from(sources)];
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return (events || []).filter((evt) => {
      const matchCat = categoryFilter === 'ALL' || evt.category === categoryFilter;
      const sFile = evt.sourceFile || evt.source_filename || 'System Log';
      const matchSrc = sourceFilter === 'ALL' || sFile === sourceFilter;
      return matchCat && matchSrc;
    });
  }, [events, categoryFilter, sourceFilter]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'AUTHENTICATION':
        return Lock;
      case 'FILE_SYSTEM':
        return FileCode;
      case 'NETWORK':
        return Network;
      default:
        return Shield;
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Forensic Disclaimer Warning (Prompt requirement: Section 8) */}
      {showWarning && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-start gap-2.5 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-amber-200">Forensic Notice: </span>
            {FORENSIC_WARNING}
          </div>
        </div>
      )}

      {/* Filter and View Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Category:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
            {['ALL', 'AUTHENTICATION', 'FILE_SYSTEM', 'NETWORK'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                  categoryFilter === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,254,0.2)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {cat === 'AUTHENTICATION' ? 'AUTH' : cat === 'FILE_SYSTEM' ? 'FILES' : cat === 'NETWORK' ? 'NET' : 'ALL'}
              </button>
            ))}
          </div>

          {/* Source File Filter */}
          {availableSources.length > 2 && (
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              aria-label="Filter events by evidence source file"
              className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500/50"
            >
              {availableSources.map((src) => (
                <option key={src} value={src}>
                  {src === 'ALL' ? 'All Source Files' : src}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View mode toggle (Timeline vs Table) */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              viewMode === 'timeline'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visual Timeline View"
          >
            <GitCommitVertical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
              viewMode === 'table'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Log Table View"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Main Content: Timeline or Table View */}
      {viewMode === 'timeline' ? (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/60 before:via-violet-500/40 before:to-cyan-500/20">
          <AnimatePresence>
            {filteredEvents.map((evt, index) => {
              const isSelected = selectedEventId === evt.id;
              const classification = getClassificationBadge(evt.classification);
              const severity = getSeverityBadge(evt.severity);
              const Icon = getCategoryIcon(evt.category);

              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="relative group cursor-pointer"
                  onClick={() => onSelectEvent && onSelectEvent(evt)}
                >
                  {/* Timeline Node Marker */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-4 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/30 scale-125 shadow-[0_0_15px_#00f2fe]'
                        : 'bg-slate-900 border-2 border-cyan-500/50 text-cyan-400 group-hover:border-cyan-300 group-hover:scale-110 shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  {/* Event Card */}
                  <div
                    className={`p-4 rounded-xl border transition-all duration-200 backdrop-blur-md ${
                      isSelected
                        ? 'bg-slate-900/95 border-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.2)] translate-x-1'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                    }`}
                  >
                    {/* Top Row: Time, Classification, Severity, Source */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {evt.displayTime || (evt.timestamp ? formatTimestamp(evt.timestamp) : '--:-- UTC')}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${classification.bg} ${classification.border} ${classification.text}`}
                          title={classification.desc}
                        >
                          {classification.label}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${severity.bg} ${severity.border} ${severity.color}`}
                        >
                          {severity.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <FileCode className="w-3 h-3 text-violet-400" />
                          {evt.sourceFile || evt.source_filename || 'System Log'}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform text-slate-500 group-hover:text-cyan-400 ${
                            isSelected ? 'rotate-90 text-cyan-400' : 'group-hover:translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Event Title & Summary */}
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {evt.title}
                    </h4>

                    <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                      {evt.findings || evt.details}
                    </p>

                    {/* Quick Metadata Snippet */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-3">
                        {evt.actorIp && (
                          <span>
                            IP: <span className="text-cyan-300">{evt.actorIp}</span>
                          </span>
                        )}
                        {evt.targetFile && (
                          <span className="truncate max-w-[200px]">
                            File: <span className="text-violet-300">{evt.targetFile}</span>
                          </span>
                        )}
                        {evt.transferSize && (
                          <span>
                            Egress: <span className="text-emerald-400 font-semibold">{evt.transferSize}</span>
                          </span>
                        )}
                      </div>

                      <span className="text-slate-500 text-[10px]">
                        ID: {evt.id} • Host: {evt.sourceHost}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 font-mono text-xs">
              No forensic events match the selected filters.
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Source File</th>
                <th className="py-3 px-4">Event Summary</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredEvents.map((evt) => {
                const isSelected = selectedEventId === evt.id;
                const classification = getClassificationBadge(evt.classification);
                const severity = getSeverityBadge(evt.severity);

                return (
                  <tr
                    key={evt.id}
                    onClick={() => onSelectEvent && onSelectEvent(evt)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/40 text-cyan-200'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-cyan-400">{evt.id}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-200 font-semibold">{evt.displayTime || (evt.timestamp ? formatTimestamp(evt.timestamp) : '--:-- UTC')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${classification.bg} ${classification.border} ${classification.text}`}>
                        {classification.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-violet-300">{evt.sourceFile || evt.source_filename || 'System Log'}</td>
                    <td className="py-3 px-4 max-w-xs font-sans text-white font-medium truncate">{evt.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${severity.bg} ${severity.border} ${severity.color}`}>
                        {severity.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent && onSelectEvent(evt);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 text-[11px] underline underline-offset-2"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
