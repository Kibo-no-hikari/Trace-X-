import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Shield,
  Clock,
  Layers,
  Database
} from 'lucide-react';
import { DEMO_EVIDENCE_FILES } from '../../data/demoEvidence';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function EvidenceList({
  files = DEMO_EVIDENCE_FILES,
  onSelectFile
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState(null);
  const navigate = useNavigate();

  const filteredFiles = files.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.fileName.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      f.sourceHost.toLowerCase().includes(q)
    );
  });

  const handleCopyHash = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Active Evidence Sources ({files.length})</span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-lg bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFiles.map((file, index) => {
          const isCopied = copiedHash === file.sha256;

          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="p-5 rounded-2xl glass-panel border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-cyan-400">
                      {file.category}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    {file.status}
                  </span>
                </div>

                {/* File Name & Host */}
                <h4 className="text-base font-bold text-white font-mono flex items-center gap-2 group-hover:text-cyan-200 transition-colors">
                  <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">{file.fileName}</span>
                </h4>

                <p className="mt-1.5 text-xs text-slate-300 font-sans leading-relaxed">
                  {file.description}
                </p>

                {/* Metadata details */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">File Size</span>
                    <span className="text-slate-200 font-medium">{file.size}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Event Count</span>
                    <span className="text-cyan-300 font-medium">{file.eventCount.toLocaleString()} parsed</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Host Origin</span>
                    <span className="text-slate-300 font-medium truncate block">{file.sourceHost}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">Format</span>
                    <span className="text-violet-300 font-medium uppercase">.{file.fileType}</span>
                  </div>
                </div>

                {/* SHA-256 Hash box */}
                <div className="mt-3.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate pr-2 font-mono">
                    SHA-256: <span className="text-slate-300">{file.sha256.substring(0, 20)}...</span>
                  </span>
                  <button
                    onClick={() => handleCopyHash(file.sha256)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
                    title="Copy full cryptographic SHA-256 checksum"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Chain of custody verified
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => navigate('/investigation/timeline')}
                  className="text-xs"
                >
                  View Events
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 font-mono text-xs">
          No evidence files matched your search.
        </div>
      )}
    </div>
  );
}
