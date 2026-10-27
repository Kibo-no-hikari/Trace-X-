import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Clock,
  Terminal,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getClassificationBadge, getSeverityBadge, formatTimestamp } from '../../utils/formatTimestamp';
import Button from '../ui/Button';

export default function EventDetails({ event, onClose, onSelectRelated }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!event) return null;

  const classification = getClassificationBadge(event.classification);
  const severity = getSeverityBadge(event.severity);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(event.rawRecord || event.details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="p-5 rounded-2xl glass-panel border border-cyan-500/30 flex flex-col h-full overflow-y-auto select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {event.id}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${classification.bg} ${classification.border} ${classification.text}`}>
              {classification.label}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${severity.bg} ${severity.border} ${severity.color}`}>
              {severity.label}
            </span>
          </div>

          <h3 className="text-base font-bold text-white leading-snug">
            {event.title}
          </h3>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Timestamp & Source details */}
      <div className="py-3 border-b border-slate-800/80 grid grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Timestamp</span>
          <span className="text-cyan-300 font-semibold flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            {event.displayTime}
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Evidence File</span>
          <span className="text-violet-300 font-semibold flex items-center gap-1 mt-0.5 truncate">
            <FileCode className="w-3 h-3 text-violet-400 shrink-0" />
            {event.sourceFile}
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Host Origin</span>
          <span className="text-slate-200 mt-0.5 block truncate">
            {event.sourceHost || 'srv-prod-auth01'}
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Event Category</span>
          <span className="text-slate-200 mt-0.5 block truncate">
            {event.category}
          </span>
        </div>
      </div>

      {/* Forensic Finding Note */}
      <div className="mt-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
          Forensic Finding
        </span>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
          {event.findings || event.details}
        </div>
      </div>

      {/* Critical Evidence Limitations */}
      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Evidence Limitations</span>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed font-sans">
          {event.limitations}
        </div>
      </div>

      {/* Raw Forensic Record */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <Terminal className="w-3 h-3 text-cyan-400" />
            Raw Log Telemetry
          </span>
          <button
            onClick={handleCopyRaw}
            className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy Record
              </>
            )}
          </button>
        </div>

        <pre className="p-3 rounded-xl bg-[#04060d] border border-cyan-500/20 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-tight">
          {event.rawRecord || event.details}
        </pre>
      </div>

      {/* Action Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          icon={Share2}
          onClick={() => navigate('/investigation/correlation')}
          className="flex-1 justify-center text-xs"
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
          Report
        </Button>
      </div>
    </motion.div>
  );
}
