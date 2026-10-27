import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileCode,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  Terminal,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import Button from '../ui/Button';

const SUPPORTED_EXTENSIONS = ['.log', '.csv', '.json'];
const MAX_FILE_SIZE_MB = 50;

export default function FileUploader({ onEvidenceUploaded, onLaunchDemo }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState(null); // null | 'uploading' | 'parsing' | 'complete' | 'demo_active'
  const fileInputRef = useRef(null);

  // Validate individual file
  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return `File "${file.name}" has an unsupported format. Supported formats: .log, .csv, .json.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`;
    }
    return null;
  };

  const handleFiles = (incomingFiles) => {
    const valid = [];
    const errors = [];

    Array.from(incomingFiles).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        // Prevent exact duplicates
        if (!selectedFiles.some((f) => f.name === file.name && f.size === file.size)) {
          valid.push(file);
        }
      }
    });

    setValidationErrors(errors);
    if (valid.length > 0) {
      setSelectedFiles((prev) => [...prev, ...valid]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setValidationErrors([]);
    setAnalysisStatus(null);
    setUploadProgress(0);
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setAnalysisStatus('uploading');
    setUploadProgress(20);

    const progressTimer = setInterval(() => {
      setUploadProgress((p) => {
        if (p < 85) return p + 15;
        return p;
      });
    }, 250);

    try {
      const res = await api.uploadEvidence(selectedFiles);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setAnalysisStatus(res.mode === 'LIVE_BACKEND' ? 'complete' : 'demo_active');

      if (onEvidenceUploaded) {
        onEvidenceUploaded(res.files || selectedFiles, res.mode);
      }
    } catch (err) {
      clearInterval(progressTimer);
      setValidationErrors([err.message || 'Evidence upload failed.']);
      setAnalysisStatus(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDemoDataset = () => {
    if (onLaunchDemo) {
      onLaunchDemo();
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_35px_rgba(0,242,254,0.3)] scale-[1.01]'
            : 'border-cyan-500/30 bg-slate-900/40 hover:border-cyan-400/60 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".log,.csv,.json"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="file-upload-input"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white tracking-wide">
            Drag & Drop Evidence Logs
          </h3>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed font-sans">
            Ingest forensic records from endpoints, firewalls, and authentication servers.
          </p>

          {/* Supported Format Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
              .LOG (Auth/NetFlow)
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-violet-950/80 text-violet-300 border border-violet-500/40">
              .CSV (File Audits)
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              .JSON (Syslog/EDR)
            </span>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              icon={FileCode}
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              onClick={handleLoadDemoDataset}
            >
              Load Demo Forensic Evidence
            </Button>
          </div>

          <p className="mt-4 text-[11px] font-mono text-slate-500">
            Maximum file size: 50MB per log • SHA-256 hash automatically computed for chain of custody
          </p>
        </div>
      </div>

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Evidence Ingestion Warnings</span>
            </div>
            {validationErrors.map((err, i) => (
              <div key={i} className="pl-6 text-rose-300/90">
                • {err}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected File Review List */}
      {selectedFiles.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-white">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Selected Evidence Files ({selectedFiles.length})</span>
            </div>
            <button
              onClick={clearAll}
              className="text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-white font-medium truncate block">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB • {file.type || 'plain/text'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                  aria-label="Remove evidence file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-mono text-cyan-300">
                <span>Normalizing timestamps & parsing event schema...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 shadow-[0_0_10px_#00f2fe]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-mono text-slate-400">
              Ready to construct chronological timeline
            </span>
            <Button
              variant="primary"
              size="md"
              icon={Terminal}
              loading={isUploading}
              onClick={handleAnalyze}
            >
              Analyze Evidence
            </Button>
          </div>
        </div>
      )}

      {/* Analysis Status Callout */}
      {analysisStatus === 'demo_active' && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-400/40 text-xs font-mono text-cyan-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white mb-0.5">Offline Demonstration Mode Active</div>
            <p className="text-slate-300 leading-relaxed font-sans">
              No active backend server was reached at <code>VITE_API_BASE_URL</code>. Files have been loaded into the client-side forensic sandbox with full simulation parsing. Real data was not transmitted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
