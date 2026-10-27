import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Terminal,
  PlayCircle,
  ArrowRight,
  Database,
  GitCommitVertical,
  Share2,
  FileText,
  Lock,
  FileCode,
  Network,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Eye,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroScene from '../components/3d/HeroScene';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import InteractiveDemoModal from '../components/demo/InteractiveDemoModal';
import { DEMO_EVENTS } from '../data/demoEvents';

export default function Home() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [activeStage, setActiveStage] = useState(0);
  const navigate = useNavigate();

  const forensicStages = [
    {
      step: '01',
      name: 'IMPORT',
      title: 'Upload Supported Evidence Files',
      desc: 'Ingest raw logs from authentications (.log), file systems (.csv), and network egress monitoring (.json) with SHA-256 validation.',
      icon: Database,
      tag: 'Multi-Source Log Telemetry'
    },
    {
      step: '02',
      name: 'NORMALIZE',
      title: 'Standardize Timestamps & Schemas',
      desc: 'Converts fragmented local server clocks, epoch timestamps, and event naming into a unified ISO-8601 UTC chronological sequence.',
      icon: Cpu,
      tag: 'Temporal Normalization'
    },
    {
      step: '03',
      name: 'TIMELINE',
      title: 'Sort Events Chronologically',
      desc: 'Reconstructs what happened step-by-step across all combined logs, pinpointing exact minutes between critical actions.',
      icon: GitCommitVertical,
      tag: 'Sequence Reconstruction'
    },
    {
      step: '04',
      name: 'CORRELATE',
      title: 'Link Supported Relationships',
      desc: 'Discovers verified connections using matching IP addresses, session handles, and temporal proximity in a 3D network graph.',
      icon: Share2,
      tag: 'Interactive 3D Correlation'
    },
    {
      step: '05',
      name: 'REPORT',
      title: 'Generate Evidentiary Case Reports',
      desc: 'Produces audit-ready findings strictly categorizing FACT, LIKELY, and UNKNOWN to prevent baseless claims without proof.',
      icon: FileText,
      tag: 'Audit-Grade Forensic Report'
    }
  ];

  const features = [
    {
      title: 'Real-time 3D Correlation Graph',
      desc: 'Explore forensic relationships in an interactive Three.js 3D space with particle telemetry indicating communication volume.',
      icon: Share2,
      color: 'text-cyan-400'
    },
    {
      title: 'Unified Chronological Timeline',
      desc: 'Synthesizes auth, file, and network streams into a single cohesive story with millimeter-accurate UTC sequencing.',
      icon: GitCommitVertical,
      color: 'text-violet-400'
    },
    {
      title: 'Rigorous Evidentiary Taxonomy',
      desc: 'Clear, uncompromised separation of FACT (recorded), LIKELY (strongly correlated), and UNKNOWN (unverified payload).',
      icon: ShieldAlert,
      color: 'text-emerald-400'
    },
    {
      title: 'Multi-Format Telemetry Parser',
      desc: 'Pre-configured parsers for Linux PAM/SSH auth logs, CSV audit shares, Zeek NetFlow records, and JSON system telemetry.',
      icon: Database,
      color: 'text-sky-400'
    },
    {
      title: 'Cryptographic Chain-of-Custody',
      desc: 'Computes SHA-256 checksums upon ingest to protect digital evidence integrity from tampering or accidental corruption.',
      icon: Lock,
      color: 'text-amber-400'
    },
    {
      title: 'Audit-Ready Report Generation',
      desc: 'One-click export to printable PDF and structured JSON reports with full source references and documented unknowns.',
      icon: FileText,
      color: 'text-pink-400'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 relative overflow-hidden flex flex-col">
      {/* Background cyber grid and glow elements */}
      <div className="absolute inset-0 cyber-grid opacity-75 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation */}
      <Navbar onLaunchDemo={() => setIsDemoModalOpen(true)} />

      {/* Interactive Demo Modal */}
      <InteractiveDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-36 lg:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading and CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-6 space-y-6 text-left"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-semibold tracking-wider">NEXT-GEN DIGITAL FORENSICS</span>
                </div>

                {/* Main Hero Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                  Every Log Tells a Story.{' '}
                  <span className="text-gradient-cyan block mt-2">
                    We Reconstruct the Incident.
                  </span>
                </h1>

                {/* Hero Description */}
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-xl">
                  Transform fragmented digital evidence into a chronological, evidence-backed incident timeline. Discover relationships, inspect original records, and understand what the available evidence can establish.
                </p>

                {/* Core Principle Callout */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20 max-w-lg flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span className="font-semibold">Core Principle:</span>
                  </div>
                  <span className="text-violet-300 font-bold italic">
                    "No Evidence, No Claim."
                  </span>
                </div>

                {/* Hero Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Terminal}
                    onClick={() => navigate('/investigation')}
                  >
                    Launch Investigation
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    icon={PlayCircle}
                    onClick={() => setIsDemoModalOpen(true)}
                  >
                    Explore Demo
                  </Button>
                </div>

                {/* Quick Telemetry summary */}
                <div className="pt-4 flex items-center gap-6 text-xs font-mono text-slate-400 border-t border-slate-800/80">
                  <div>
                    <span className="text-white font-bold block text-sm">3D WebGL</span>
                    <span>Three.js Engine</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div>
                    <span className="text-cyan-400 font-bold block text-sm">4 Sources</span>
                    <span>Synthetic Incident</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div>
                    <span className="text-emerald-400 font-bold block text-sm">0 Pseudocode</span>
                    <span>Full Live Stack</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Interactive 3D Hero Scene */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-6 relative"
              >
                <div className="relative rounded-2xl glass-panel p-2 shadow-[0_0_50px_rgba(0,242,254,0.15)]">
                  <HeroScene />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION: INCIDENT SEQUENCE PREVIEW CAROUSEL */}
        <section className="py-12 border-y border-cyan-500/15 bg-slate-950/60 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Live Synthetic Sequence Preview
                </span>
                <h3 className="text-lg font-bold text-white font-mono">
                  4 Synchronized Incident Events
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={ArrowRight}
                onClick={() => navigate('/investigation/timeline')}
                className="text-xs"
              >
                Open Full Timeline
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DEMO_EVENTS.map((evt, idx) => (
                <div
                  key={evt.id}
                  onClick={() => navigate('/investigation/timeline')}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-400/50 hover:bg-slate-900 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-cyan-400 font-bold">{evt.displayTime}</span>
                    <span className="text-[10px] text-slate-500">{evt.sourceFile}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {evt.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-400 font-sans line-clamp-2">
                    {evt.details}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 font-bold">{evt.classification}</span>
                    <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: HOW IT WORKS (Section 11 Prompt Requirement) */}
        <section id="how-it-works" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-400">
                <span>FORENSIC METHODOLOGY</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                How TraceX Reconstructs The Timeline
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
                A connected five-stage pipeline designed for digital forensic analysts, incident response teams, and security investigators.
              </p>
            </div>

            {/* 5 Stages Workflow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {forensicStages.map((stage, idx) => (
                <div
                  key={stage.step}
                  onMouseEnter={() => setActiveStage(idx)}
                  className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group ${
                    activeStage === idx
                      ? 'bg-slate-900/95 border-cyan-400 shadow-[0_0_25px_rgba(0,242,254,0.2)] -translate-y-1'
                      : 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div>
                    {/* Step indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black font-mono text-slate-700 group-hover:text-cyan-400/50 transition-colors">
                        {stage.step}
                      </span>
                      <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                        <stage.icon className="w-4 h-4" />
                      </div>
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                      {stage.tag}
                    </span>

                    <h3 className="text-base font-bold text-white font-mono mb-2">
                      {stage.name}
                    </h3>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Stage {idx + 1}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeStage === idx ? 'text-cyan-400 translate-x-1' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: FEATURES */}
        <section id="features" className="py-24 bg-[#060913] border-t border-cyan-500/15 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-400">
                <span>CYBERSECURITY WORKSTATION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Built for High-Stakes Forensic Investigations
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-sans">
                Never invent connections to make visuals look impressive. TraceX guarantees strict fidelity to provided artifacts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl glass-panel border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="p-3 w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-cyan-500/40 transition-all">
                    <feat.icon className={`w-6 h-6 ${feat.color}`} />
                  </div>

                  <h3 className="text-base font-bold text-white font-mono mb-2">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: CTA BANNER */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-cyan-400/40 text-center space-y-6 shadow-[0_0_50px_rgba(0,242,254,0.15)]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-400/40 text-xs font-mono text-cyan-300">
                <span>READY FOR TIMELINE RECONSTRUCTION</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Reconstruct Your Incident with Forensic Accuracy
              </h2>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
                Import your authentication logs, file audits, and network flow telemetry to reveal correlated attack progression in 3D.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Terminal}
                  onClick={() => navigate('/investigation')}
                >
                  Enter Forensic Workstation
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  icon={PlayCircle}
                  onClick={() => setIsDemoModalOpen(true)}
                >
                  Launch Interactive Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
