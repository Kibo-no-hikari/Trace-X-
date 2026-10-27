import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function EvidenceNode({
  position,
  title,
  category,
  sourceFile,
  active = false,
  onClick,
  onHover,
  color = '#00f2fe',
  pulseSpeed = 2
}) {
  const meshRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
    }
    if (meshRef.current) {
      const scale = hovered || active ? 1.35 : 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.08;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  const getCategoryColor = () => {
    switch (category) {
      case 'AUTHENTICATION':
        return '#00f2fe'; // Cyan
      case 'FILE_SYSTEM':
        return '#a78bfa'; // Violet
      case 'NETWORK':
        return '#38bdf8'; // Sky blue
      default:
        return color;
    }
  };

  const nodeColor = getCategoryColor();

  return (
    <group position={position}>
      {/* Outer Pulse/Scanning Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.35, 0.42, 32]} />
        <meshBasicMaterial
          color={nodeColor}
          side={THREE.DoubleSide}
          transparent
          opacity={hovered || active ? 0.8 : 0.35}
        />
      </mesh>

      {/* Main Core Node */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover && onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          onHover && onHover(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick && onClick();
        }}
      >
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={hovered || active ? 1.4 : 0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Point Light for glowing ambient cast */}
      <pointLight color={nodeColor} distance={2.5} intensity={hovered || active ? 3 : 1.2} />

      {/* HTML floating label above node */}
      <Html position={[0, 0.45, 0]} center distanceFactor={10} pointerEvents="none">
        <div
          className={`transition-all duration-200 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap select-none backdrop-blur-md ${
            hovered || active
              ? 'bg-slate-900/90 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.4)] scale-110'
              : 'bg-slate-950/70 text-slate-400 border border-slate-800'
          }`}
        >
          <span className="font-semibold">{sourceFile || title}</span>
        </div>
      </Html>
    </group>
  );
}
