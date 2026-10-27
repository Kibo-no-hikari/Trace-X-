import { useState, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import {
  GitCommitVertical,
  Shield,
  Search,
  Filter,
  ArrowLeft,
  X,
  ExternalLink,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { DEMO_EVENTS, DEMO_CORRELATIONS, FORENSIC_WARNING } from '../../data/demoEvents';
import { getClassificationBadge, getSeverityBadge, formatTimestamp } from '../../utils/formatTimestamp';
import Button from '../ui/Button';
import Card from '../ui/Card';

// Traveling particle along edge
function EdgeParticle({ start, end, speed = 0.6, color = '#00f2fe' }) {
  const meshRef = useRef();
  const progress = useRef(Math.random());

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * speed) % 1;
    if (meshRef.current) {
      meshRef.current.position.lerpVectors(
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
        progress.current
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshBasicMaterial color={color} />
      <pointLight color={color} intensity={1.5} distance={0.6} />
    </mesh>
  );
}

// 3D Graph Node
function GraphNode({
  event,
  isSelected,
  onClick,
  isDimmed
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const categoryColor = useMemo(() => {
    switch (event.category) {
      case 'AUTHENTICATION':
        return '#00f2fe';
      case 'FILE_SYSTEM':
        return '#c084fc';
      case 'NETWORK':
        return '#38bdf8';
      default:
        return '#94a3b8';
    }
  }, [event.category]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.4 : hovered ? 1.25 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group position={event.coordinates}>
      {/* Halo for selected / active node */}
      {(isSelected || hovered) && (
        <mesh>
          <ringGeometry args={[0.38, 0.45, 32]} />
          <meshBasicMaterial
            color={categoryColor}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {/* Main Node Sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(event);
        }}
      >
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial
          color={categoryColor}
          emissive={categoryColor}
          emissiveIntensity={isSelected || hovered ? 1.2 : isDimmed ? 0.2 : 0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <pointLight
        color={categoryColor}
        distance={2}
        intensity={isSelected ? 3 : isDimmed ? 0.3 : 1.2}
      />

      {/* Persistent 3D Label */}
      <Html position={[0, 0.42, 0]} center distanceFactor={8} pointerEvents="none">
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all backdrop-blur-md select-none ${
            isSelected
              ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.5)] scale-110 font-bold'
              : hovered
              ? 'bg-slate-900/90 text-white border border-slate-600 scale-105'
              : isDimmed
              ? 'opacity-30 bg-slate-950/60 text-slate-500 border border-slate-900'
              : 'bg-slate-950/80 text-slate-300 border border-slate-800'
          }`}
        >
          <span>{event.displayTime} • {event.sourceFile}</span>
        </div>
      </Html>
    </group>
  );
}

// 3D Graph Edge between two nodes
function GraphEdge({ correlation, nodesMap }) {
  const sourceNode = nodesMap[correlation.sourceEventId];
  const targetNode = nodesMap[correlation.targetEventId];

  const points = useMemo(() => {
    if (!sourceNode || !targetNode) return null;
    return [
      new THREE.Vector3(...sourceNode.coordinates),
      new THREE.Vector3(...targetNode.coordinates)
    ];
  }, [sourceNode, targetNode]);

  const geometry = useMemo(() => {
    if (!points) return null;
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  if (!points || !geometry) return null;

  const isUnknown = correlation.classification === 'UNKNOWN';
  const edgeColor = isUnknown ? '#a78bfa' : '#00f2fe';

  // Middle position for HTML relationship label
  const midPoint = [
    (sourceNode.coordinates[0] + targetNode.coordinates[0]) / 2,
    (sourceNode.coordinates[1] + targetNode.coordinates[1]) / 2 + 0.15,
    (sourceNode.coordinates[2] + targetNode.coordinates[2]) / 2,
  ];

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial
          color={edgeColor}
          transparent
          opacity={isUnknown ? 0.35 : 0.65}
          linewidth={isUnknown ? 1 : 2}
        />
      </line>

      {/* Traveling flow particle */}
      <EdgeParticle
        start={sourceNode.coordinates}
        end={targetNode.coordinates}
        color={edgeColor}
        speed={isUnknown ? 0.3 : 0.6}
      />

      {/* Edge relationship badge */}
      <Html position={midPoint} center distanceFactor={9} pointerEvents="none">
        <div className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-slate-950/80 border border-slate-700/80 text-slate-400 select-none shadow">
          {correlation.classification}
        </div>
      </Html>
    </group>
  );
}

export default function CorrelationGraph() {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(DEMO_EVENTS[0]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Map nodes by ID for fast lookup
  const nodesMap = useMemo(() => {
    const map = {};
    DEMO_EVENTS.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, []);

  // Filter events based on UI controls
  const filteredEvents = useMemo(() => {
    return DEMO_EVENTS.filter((e) => {
      const matchesCategory = filterCategory === 'ALL' || e.category === filterCategory;
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.sourceFile.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.eventType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [filterCategory, searchQuery]);

  // Find relationships for selected event
  const relatedCorrelations = useMemo(() => {
    if (!selectedEvent) return [];
    return DEMO_CORRELATIONS.filter(
      (c) => c.sourceEventId === selectedEvent.id || c.targetEventId === selectedEvent.id
    );
  }, [selectedEvent]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#050811] overflow-hidden select-none">
      {/* Top Controls Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 p-4 border-b border-cyan-500/15 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/investigation/timeline')}
            className="text-xs"
          >
            Back to Timeline
          </Button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-white tracking-wide">
              3D Forensic Correlation Graph
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              {DEMO_EVENTS.length} Evidence Nodes • {DEMO_CORRELATIONS.length} Validated Edges
            </span>
          </div>
        </div>

        {/* Filter & Search controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search evidence node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-44 sm:w-52"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="ALL">All Categories</option>
            <option value="AUTHENTICATION">Authentication</option>
            <option value="FILE_SYSTEM">File System</option>
            <option value="NETWORK">Network Traffic</option>
          </select>
        </div>
      </div>

      {/* Warning banner */}
      <div className="relative z-10 bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center text-[11px] font-mono text-amber-300/90 flex items-center justify-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>{FORENSIC_WARNING}</span>
      </div>

      {/* 3D Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        {/* Background Ambient Grid */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

        <Canvas
          camera={{ position: [0, 0, 4.8], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          className="cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-5, -10, -5]} intensity={0.8} color="#8b5cf6" />

          <Suspense fallback={null}>
            <group>
              {/* Render edges */}
              {DEMO_CORRELATIONS.map((corr) => (
                <GraphEdge
                  key={corr.id}
                  correlation={corr}
                  nodesMap={nodesMap}
                />
              ))}

              {/* Render nodes */}
              {DEMO_EVENTS.map((evt) => {
                const isFiltered = !filteredEvents.some((f) => f.id === evt.id);
                return (
                  <GraphNode
                    key={evt.id}
                    event={evt}
                    isSelected={selectedEvent?.id === evt.id}
                    isDimmed={isFiltered}
                    onClick={(e) => setSelectedEvent(e)}
                  />
                );
              })}
            </group>
          </Suspense>

          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={2.5}
            maxDistance={8}
            dampingFactor={0.05}
          />
        </Canvas>

        {/* Legend Overlay at bottom-left */}
        <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl glass-panel max-w-xs text-xs font-mono pointer-events-auto">
          <div className="font-semibold text-white mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Graph Legend</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00f2fe]" />
              <span>Authentication (auth.log)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]" />
              <span>File Activity (files.csv)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <span>Network Telemetry (net.log)</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-[#00f2fe]" />
              <span>LIKELY Correlation (Evidence-supported)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-[#a78bfa] border-b border-dashed" />
              <span>UNKNOWN (Payload unverified)</span>
            </div>
          </div>
        </div>

        {/* Side Details Drawer (When a node is selected) */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2 }}
              className="absolute top-4 right-4 bottom-4 w-96 z-30 p-5 rounded-2xl glass-panel border border-cyan-500/30 overflow-y-auto pointer-events-auto flex flex-col justify-between shadow-2xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
                        {selectedEvent.id}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {selectedEvent.displayTime}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-white">
                      {selectedEvent.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Evidence Source & Badges */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Evidence Source:</span>
                    <span className="text-cyan-400 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {selectedEvent.sourceFile}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Classification:</span>
                    <span className="text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                      FACT — Directly Logged
                    </span>
                  </div>
                </div>

                {/* Forensic Detail Description */}
                <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedEvent.details}
                </div>

                {/* Raw Record */}
                <div className="mt-4">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                    Raw Evidence Record:
                  </span>
                  <pre className="mt-1.5 p-3 rounded-lg bg-[#04060d] border border-cyan-500/20 text-[10px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-tight">
                    {selectedEvent.rawRecord}
                  </pre>
                </div>

                {/* Relationships & Limitations */}
                <div className="mt-4">
                  <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                    Supported Correlations:
                  </span>
                  <div className="mt-2 space-y-2">
                    {relatedCorrelations.length > 0 ? (
                      relatedCorrelations.map((corr) => (
                        <div
                          key={corr.id}
                          className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                            <span className="text-cyan-400">{corr.relationship}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                corr.classification === 'LIKELY'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-violet-500/20 text-violet-300'
                              }`}
                            >
                              {corr.classification}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] font-sans">
                            {corr.explanation}
                          </p>
                          <p className="mt-1 text-[10px] font-mono text-slate-400 italic">
                            Limitation: {corr.limitation}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 font-mono">No direct supported links.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <Button
                  variant="primary"
                  size="sm"
                  icon={GitCommitVertical}
                  onClick={() => navigate('/investigation/timeline')}
                  className="w-full justify-center text-xs"
                >
                  Inspect in Timeline
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
