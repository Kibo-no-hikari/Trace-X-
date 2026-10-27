import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import EvidenceNode from './EvidenceNode';

// Generate random points along a curve for traveling packet particles
function TravelingPacket({ start, end, speed = 0.8, color = '#00f2fe' }) {
  const meshRef = useRef();
  const progress = useRef(Math.random());

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * speed) % 1;
    if (meshRef.current) {
      // Lerp position along straight line
      meshRef.current.position.lerpVectors(
        new THREE.Vector3(...start),
        new THREE.Vector3(...end),
        progress.current
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.045, 12, 12]} />
      <meshBasicMaterial color={color} />
      <pointLight color={color} intensity={1.5} distance={0.8} />
    </mesh>
  );
}

// Glowing connection line between two 3D vectors
function ConnectionLine({ start, end, color = '#00f2fe', opacity = 0.35 }) {
  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={1.5} />
    </line>
  );
}

// Floating data particles / fragments
function DataFragments({ count = 35 }) {
  const points = useMemo(() => {
    const coords = [];
    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      coords.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }
    return new Float32Array(coords);
  }, [count]);

  const pointsRef = useRef();

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#38bdf8"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

export default function EvidenceSphere({ onSelectNode, activeNodeId }) {
  const coreRef = useRef();
  const wireframeRef = useRef();
  const scanRingRef1 = useRef();
  const scanRingRef2 = useRef();
  const outerRingRef = useRef();

  // Floating evidence nodes orbiting the central engine
  const nodes = useMemo(() => [
    {
      id: 'node-auth',
      title: 'Auth Logs',
      sourceFile: 'auth.log',
      category: 'AUTHENTICATION',
      position: [-2.1, 0.9, 0.6],
      color: '#00f2fe',
      description: 'PAM SSH authentication attempts & session tokens'
    },
    {
      id: 'node-file',
      title: 'File Audit',
      sourceFile: 'files.csv',
      category: 'FILE_SYSTEM',
      position: [1.8, 1.2, -0.7],
      color: '#c084fc',
      description: 'Sensitive spreadsheet read operations & handle events'
    },
    {
      id: 'node-net',
      title: 'NetFlow Logs',
      sourceFile: 'net.log',
      category: 'NETWORK',
      position: [0.2, -1.8, 1.1],
      color: '#38bdf8',
      description: '48 MB outbound connection stream over port 443'
    }
  ], []);

  useFrame((state, delta) => {
    // Rotate wireframe sphere
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += delta * 0.25;
      wireframeRef.current.rotation.x += delta * 0.12;
    }

    // Core pulsing effect
    if (coreRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.04;
      coreRef.current.scale.set(pulse, pulse, pulse);
    }

    // Scanning rings rotation
    if (scanRingRef1.current) {
      scanRingRef1.current.rotation.z += delta * 0.8;
      scanRingRef1.current.rotation.x += delta * 0.3;
    }
    if (scanRingRef2.current) {
      scanRingRef2.current.rotation.z -= delta * 0.6;
      scanRingRef2.current.rotation.y += delta * 0.4;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <group>
      {/* Central Glowing Digital Sphere (The TraceX Forensics Engine) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshStandardMaterial
          color="#001428"
          emissive="#00f2fe"
          emissiveIntensity={0.8}
          roughness={0.15}
          metalness={0.9}
          wireframe={false}
        />
      </mesh>

      {/* Internal Core Light */}
      <pointLight color="#00f2fe" intensity={5} distance={5} />
      <pointLight color="#8b5cf6" intensity={3} distance={4} />

      {/* Rotating Outer Wireframe Sphere */}
      <mesh ref={wireframeRef}>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Circular Scanning Rings */}
      <mesh ref={scanRingRef1} rotation={[Math.PI / 4, 0, 0]}>
        <ringGeometry args={[1.5, 1.54, 64]} />
        <meshBasicMaterial
          color="#00f2fe"
          side={THREE.DoubleSide}
          transparent
          opacity={0.45}
        />
      </mesh>

      <mesh ref={scanRingRef2} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <ringGeometry args={[1.7, 1.73, 64]} />
        <meshBasicMaterial
          color="#a855f7"
          side={THREE.DoubleSide}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Outer subtle radar ring */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.52, 64]} />
        <meshBasicMaterial
          color="#22d3ee"
          side={THREE.DoubleSide}
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* Evidence Nodes */}
      {nodes.map((node) => (
        <group key={node.id}>
          <EvidenceNode
            position={node.position}
            title={node.title}
            category={node.category}
            sourceFile={node.sourceFile}
            color={node.color}
            active={activeNodeId === node.id}
            onClick={() => onSelectNode && onSelectNode(node)}
          />

          {/* Connection line between center engine and evidence node */}
          <ConnectionLine
            start={[0, 0, 0]}
            end={node.position}
            color={node.color}
            opacity={0.3}
          />

          {/* Traveling packet on connection line */}
          <TravelingPacket
            start={[0, 0, 0]}
            end={node.position}
            color={node.color}
            speed={0.7}
          />
        </group>
      ))}

      {/* Inter-node correlation connection line (Auth -> File and File -> Net) */}
      <ConnectionLine
        start={nodes[0].position}
        end={nodes[1].position}
        color="#00f2fe"
        opacity={0.25}
      />
      <TravelingPacket
        start={nodes[0].position}
        end={nodes[1].position}
        color="#00f2fe"
        speed={0.4}
      />

      <ConnectionLine
        start={nodes[1].position}
        end={nodes[2].position}
        color="#a78bfa"
        opacity={0.25}
      />
      <TravelingPacket
        start={nodes[1].position}
        end={nodes[2].position}
        color="#a78bfa"
        speed={0.45}
      />

      {/* Floating digital data fragments */}
      <DataFragments count={45} />
    </group>
  );
}
