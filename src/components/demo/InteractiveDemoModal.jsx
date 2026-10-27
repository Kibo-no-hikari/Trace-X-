import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  X,
  Clock,
  Shield,
  FileCode,
  Network,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Sparkles,
  Info
} from 'lucide-react';
import { DEMO_EVENTS, DEMO_CORRELATIONS, FORENSIC_WARNING } from '../../data/demoEvents';
import { DEMO_EVIDENCE_FILES } from '../../data/demoEvidence';
import { getClassificationBadge, getSeverityBadge } from '../../utils/formatTimestamp';
import Button from '../ui/Button';

export default function InteractiveDemoModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0); 
  // 0: Introduction to Evidence Sources
  // 1: Event 1 (02:03 UTC)
  // 2: Event 2 (02:05 UTC)
  // 3: Event 3 (02:07 UTC)
  // 4: Event 4 (02:09 UTC)
  // 5: Investigation Summary & Limitations
  const [isPlaying, setIsPlaying] = useState(false);

  const totalSteps = 5;

  useEffect(() => {
    let timer;
    if (isPlaying && isOpen) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps) {
            setIsPlaying(false);
            return totalSteps;
          }
          return prev + 1;
        });
      }, 4200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, totalSteps]);

  if (!isOpen) return null;

  const currentEvent = currentStep >= 1 && currentStep <= 4 ? DEMO_EVENTS[currentStep - 1] : null;
  const currentCorrelation = currentStep >= 2 && currentStep <= 4 ? DEMO_CORRELATIONS[currentStep - 2] : null;

  const handleNext = () => {
    setCurrentStep((p) => Math.min(totalSteps, p + 1));
  };

  const handlePrev = () => {
    setCurrentStep((p) => Math.max(0, p - 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto glass-panel border border-cyan-400/50 rounded-2xl shadow-[0_0_50px_rgba(0,242,254,0.25)] flex flex-col p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-cyan-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Interactive Forensic Reconstruction • Synthetic Demo
                </span>
              </div>
              <h2 className="mt-1 text-lg sm:text-xl font-bold font-mono text-white">
                Chronological Attack Timeline Walkthrough
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              aria-label="Close interactive demo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">
                Step {currentStep} of {totalSteps}: {
                  currentStep === 0
                    ? 'Evidence Sources'
                    : currentStep === 5
                    ? 'Forensic Findings Summary'
                    : `Event ${currentStep} (${DEMO_EVENTS[currentStep - 1]?.displayTime})`
                }
              </span>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                {isPlaying ? 'Auto-Advancing (Playing)' : 'Paused / Manual Control'}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 h-2">
              {[0, 1, 2, 3, 4, 5].map((stepIdx) => (
                <button
                  key={stepIdx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(stepIdx);
                  }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    currentStep === stepIdx
                      ? 'bg-cyan-400 shadow-[0_0_10px_#00f2fe]'
                      : stepIdx < currentStep
                      ? 'bg-cyan-600/70'
                      : 'bg-slate-800'
                  }`}
                  title={`Jump to step ${stepIdx}`}
                />
              ))}
            </div>
          </div>

          {/* Dynamic Step Content */}
          <div className="my-4 min-h-[320px] flex flex-col justify-center">
            {/* Step 0: Evidence Introduction */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-200">
                  <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Scenario Setup: Digital Evidence Ingestion</span>
                  </div>
                  <p className="font-sans leading-relaxed text-slate-300">
                    TraceX ingests scattered forensic logs across diverse infrastructure. In this synthetic scenario, three primary evidence artifacts have been loaded into memory with cryptographic hashes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {DEMO_EVIDENCE_FILES.slice(0, 3).map((file) => (
                    <div
                      key={file.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                          {file.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{file.size}</span>
                      </div>
                      <div className="font-bold font-mono text-sm text-white flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span>{file.fileName}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans leading-snug">
                        {file.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>Principle: "No Evidence, No Claim."</span>
                  <span className="text-cyan-400">Click Play or Next Event to begin temporal reconstruction &rarr;</span>
                </div>
              </motion.div>
            )}

            {/* Steps 1 to 4: Individual Events */}
            {currentEvent && (
              <motion.div
                key={currentEvent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Event Card */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-400/40 shadow-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,242,254,0.3)]">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        {currentEvent.displayTime}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        {currentEvent.classification}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-violet-400" />
                      Origin: {currentEvent.sourceFile}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {currentEvent.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {currentEvent.findings}
                  </p>

                  {/* Raw telemetry box */}
                  <div className="p-3 rounded-xl bg-black/80 border border-cyan-500/20 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                    <code>{currentEvent.rawRecord}</code>
                  </div>
                </div>

                {/* Correlation Note if available */}
                {currentCorrelation && (
                  <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs font-mono text-violet-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-violet-300">
                      <Share2 className="w-4 h-4 text-violet-400" />
                      <span>Correlation Link ({currentCorrelation.relationship}): [{currentCorrelation.classification}]</span>
                    </div>
                    <p className="font-sans text-slate-300">
                      {currentCorrelation.explanation}
                    </p>
                    <p className="text-[11px] text-amber-300/90 font-mono italic">
                      Limitation: {currentCorrelation.limitation}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 5: Final Summary & Limitations */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-400/40 space-y-3">
                  <div className="flex items-center gap-2 font-mono font-bold text-sm text-cyan-300">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    <span>Investigation Reconstruction Complete</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                    Four sequential events were reconstructed across three independent log sources. While the temporal sequence strongly points towards unauthorized intrusion followed by network egress, forensic integrity mandates acknowledging what cannot be confirmed.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 font-mono space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Key Forensic Distinction: FACT vs UNKNOWN</span>
                  </div>
                  <p className="font-sans text-slate-300 leading-relaxed">
                    The 48 MB egress is a verifiable FACT. Access to salary.xlsx is a verifiable FACT. However, because the outbound network stream was TLS encrypted, asserting that salary.xlsx was in fact exfiltrated remains <span className="text-amber-400 font-bold uppercase">UNKNOWN</span>.
                  </p>
                </div>

                <div className="text-center pt-2">
                  <span className="font-mono text-xs text-cyan-400 font-semibold tracking-wider">
                    "Reconstruct the Incident. Follow the Evidence."
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Warning notice */}
          <div className="py-2 text-[10px] font-mono text-slate-500 text-center">
            {FORENSIC_WARNING}
          </div>

          {/* Footer Controls: Play, Pause, Next, Prev, Reset, Replay */}
          <div className="pt-4 border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={handleReset}
                className="text-xs"
              >
                Reset
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={SkipBack}
                disabled={currentStep === 0}
                onClick={handlePrev}
                className="text-xs"
              >
                Prev Event
              </Button>

              <Button
                variant={isPlaying ? 'secondary' : 'primary'}
                size="sm"
                icon={isPlaying ? Pause : Play}
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-xs"
              >
                {isPlaying ? 'Pause' : 'Play Auto-Demo'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={SkipForward}
                disabled={currentStep === totalSteps}
                onClick={handleNext}
                className="text-xs"
              >
                Next Event
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {currentStep === totalSteps && (
                <Button
                  variant="violet"
                  size="sm"
                  icon={RotateCcw}
                  onClick={handleReplay}
                  className="text-xs"
                >
                  Replay Demo
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Close Demo
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
