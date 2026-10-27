import { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileCode, Network, Lock, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import EvidenceSphere from './EvidenceSphere';

// Check if WebGL is supported
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

// 2D Interactive Fallback component if WebGL is unsupported or disabled
function Non3DFallback({ onSelectNode, activeNode }) {
  const nodes = [
    {
      id: 'node-auth',
      title: 'Authentication Logs',
      sourceFile: 'auth.log',
      category: 'AUTHENTICATION',
      icon: Lock,
      color: 'border-cyan-400 text-cyan-400',
      description: 'PAM SSH authentication attempts & session tokens'
    },
    {
      id: 'node-file',
      title: 'File Activity Logs',
      sourceFile: 'files.csv',
      category: 'FILE_SYSTEM',
      icon: FileCode,
      color: 'border-violet-400 text-violet-400',
      description: 'Sensitive spreadsheet read operations & handle events'
    },
    {
      id: 'node-net',
      title: 'Network Records',
      sourceFile: 'net.log',
      category: 'NETWORK',
      icon: Network,
      color: 'border-sky-400 text-sky-400',
      description: '48 MB outbound connection stream over port 443'
    }
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#080d1e] to-[#04060d] rounded-2xl border border-cyan-500/20">
      <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-400/40 flex items-center justify-center animate-pulse mb-8 shadow-[0_0_30px_rgba(0,242,254,0.3)]">
        <Shield className="w-10 h-10 text-cyan-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => onSelectNode(node)}
            className={`p-4 rounded-xl border backdrop-blur-md transition-all text-left group ${
              activeNode?.id === node.id
                ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40'
            }`}
          >
            <node.icon className={`w-5 h-5 mb-2 ${node.color}`} />
            <div className="text-xs font-mono font-semibold text-slate-200">{node.title}</div>
            <div className="text-[10px] font-mono text-cyan-400">{node.sourceFile}</div>
          </button>
        ))}
      </div>
      <p className="mt-6 text-xs font-mono text-slate-500">
        [2D Fallback Active • Hardware acceleration disabled or WebGL unavailable]
      </p>
    </div>
  );
}

export default function HeroScene({ onNodeClick }) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    if (onNodeClick) onNodeClick(node);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[520px] lg:h-[620px] select-none">
      {/* Ambient background glow behind 3D engine */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative cyber grid boundary */}
      <div className="absolute inset-0 border border-cyan-500/10 rounded-2xl pointer-events-none" />

      {/* Crosshairs at canvas corners */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-cyan-400/50 pointer-events-none" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-cyan-400/50 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-cyan-400/50 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-cyan-400/50 pointer-events-none" />

      {/* Top watermark status badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>RECONSTRUCTION ENGINE • 3D ACTIVE</span>
      </div>

      {/* 3D Canvas / WebGL fallback */}
      {hasWebGL ? (
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 48 }}
          dpr={[1, 2]} // Performance optimization for high-DPI displays
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="cursor-grab active:cursor-grabbing rounded-2xl"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={0.6} color="#8b5cf6" />

          <Suspense fallback={null}>
            <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.4}>
              <EvidenceSphere
                onSelectNode={handleNodeSelect}
                activeNodeId={selectedNode?.id}
              />
            </Float>
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 2.3}
            rotateSpeed={0.5}
            dampingFactor={0.05}
          />
        </Canvas>
      ) : (
        <Non3DFallback onSelectNode={handleNodeSelect} activeNode={selectedNode} />
      )}

      {/* Interactive Evidence Details Card (When a 3D node is clicked) */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 p-4 rounded-xl glass-panel border border-cyan-400/40 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase text-cyan-300 font-semibold tracking-wider">
                  {selectedNode.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white transition-colors p-0.5"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="mt-2 text-sm font-bold text-white flex items-center gap-2">
              <span>{selectedNode.title}</span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                {selectedNode.sourceFile}
              </span>
            </h4>

            <p className="mt-1.5 text-xs text-slate-300 leading-relaxed font-sans">
              {selectedNode.description}
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Validated Hash
              </span>
              <span className="text-cyan-400">Sha-256 Verified</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper hint at bottom center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center">
        <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase bg-slate-950/70 px-3 py-1 rounded-full border border-slate-800/80 backdrop-blur-sm">
          Interactive 3D Engine • Click Nodes to Inspect • Drag to Orbit
        </span>
      </div>
    </div>
  );
}
