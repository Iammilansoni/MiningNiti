'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Float, OrbitControls, Sphere, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { 
  FileText, 
  Search, 
  Brain, 
  Shield, 
  Database,
  Pickaxe,
  HardHat,
  Truck,
  Settings,
  AlertTriangle
} from 'lucide-react';

// Document types for mining operations
const documentTypes = [
  {
    id: 'safety',
    title: 'Safety Protocols',
    icon: Shield,
    color: '#ff4444',
    position: [-3, 2, 0] as [number, number, number],
    description: 'MSHA Compliance & Safety Procedures'
  },
  {
    id: 'equipment',
    title: 'Equipment Manuals',
    icon: Settings,
    color: '#4488ff',
    position: [3, 2, 0] as [number, number, number],
    description: 'Machinery Operation & Maintenance'
  },
  {
    id: 'mining',
    title: 'Mining Operations',
    icon: Pickaxe,
    color: '#ff8800',
    position: [-3, -2, 0] as [number, number, number],
    description: 'Extraction Procedures & Plans'
  },
  {
    id: 'reports',
    title: 'Inspection Reports',
    icon: FileText,
    color: '#00ff88',
    position: [3, -2, 0] as [number, number, number],
    description: 'Quality Control & Audits'
  }
];

// Floating document component
function FloatingDocument({ doc, index }: { doc: typeof documentTypes[0], index: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.2;
      meshRef.current.position.y = doc.position[1] + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.3;
    }
  });

  const IconComponent = doc.icon;

  return (
    <Float speed={1 + index * 0.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group 
        ref={meshRef}
        position={doc.position}
        scale={hovered ? 1.1 : 1}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* Document stack */}
        <group>
          {/* Multiple document pages for depth effect */}
          {[0, 0.02, 0.04].map((offset, i) => (
            <Box 
              key={i}
              args={[1.5, 2, 0.01]} 
              position={[offset, offset, offset]}
            >
              <meshPhysicalMaterial
                color={doc.color}
                metalness={0.1}
                roughness={0.3}
                transparent
                opacity={0.8 - i * 0.1}
                transmission={0.1}
              />
            </Box>
          ))}
        </group>

        {/* Icon overlay */}
        <Html
          center
          transform
          scale={0.2}
          position={[0, 0, 0.1]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div className="flex flex-col items-center justify-center w-32 h-40 text-white">
            <div 
              className="mb-2 p-2 rounded-lg backdrop-blur-sm"
              style={{ 
                backgroundColor: doc.color + '30',
                border: `1px solid ${doc.color}80`
              }}
            >
              <IconComponent size={20} color={doc.color} />
            </div>
            <h3 
              className="text-xs font-bold text-center mb-1"
              style={{ color: doc.color }}
            >
              {doc.title}
            </h3>
            <p className="text-xs text-center opacity-80 leading-tight px-2">
              {doc.description}
            </p>
          </div>
        </Html>

        {/* Glow effect */}
        <Sphere args={[1.2]} position={[0, 0, -0.5]}>
          <meshBasicMaterial 
            color={doc.color} 
            transparent 
            opacity={0.1}
          />
        </Sphere>
      </group>
    </Float>
  );
}

// Central AI brain processing unit
function AIProcessingCore() {
  const coreRef = useRef<THREE.Group>(null);
  const dataRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    if (dataRef.current) {
      dataRef.current.rotation.y = -state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central AI core */}
      <group ref={coreRef}>
        {/* Main brain sphere */}
        <Sphere args={[0.8]}>
          <meshPhysicalMaterial
            color="#00d2ff"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.7}
            transmission={0.3}
          />
        </Sphere>

        {/* Inner neural network visualization */}
        <Sphere args={[0.6]}>
          <meshBasicMaterial 
            color="#4ECDC4" 
            transparent 
            opacity={0.3}
            wireframe
          />
        </Sphere>

        {/* Core processors */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <Box 
              key={i}
              args={[0.1, 0.1, 0.3]} 
              position={[
                Math.cos(angle) * 0.9,
                Math.sin(angle) * 0.9,
                0
              ]}
              rotation={[0, 0, angle]}
            >
              <meshPhysicalMaterial
                color="#ff6b6b"
                metalness={0.8}
                roughness={0.2}
                emissive="#ff6b6b"
                emissiveIntensity={0.2}
              />
            </Box>
          );
        })}
      </group>

      {/* Data flow visualization */}
      <group ref={dataRef}>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 1.5 + Math.sin(i) * 0.3;
          return (
            <Float key={i} speed={2 + i * 0.1} rotationIntensity={1} floatIntensity={2}>
              <Sphere 
                args={[0.05]} 
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle * 1.5) * 0.8,
                  Math.sin(angle) * radius * 0.5
                ]}
              >
                <meshBasicMaterial 
                  color="#A8E6CF" 
                  transparent 
                  opacity={0.8}
                />
              </Sphere>
            </Float>
          );
        })}
      </group>

      {/* AI label */}
      <Html
        center
        transform
        scale={0.3}
        position={[0, 1.5, 0]}
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <div className="text-center">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI PROCESSING ENGINE
          </h2>
          <p className="text-xs text-cyan-300 mt-1 opacity-80">
            Mining Document Intelligence
          </p>
        </div>
      </Html>
    </group>
  );
}

// Mining equipment visualization
function MiningEquipment() {
  const equipmentRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (equipmentRef.current) {
      equipmentRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });

  return (
    <group ref={equipmentRef} position={[0, -3.5, -2]} scale={0.6}>
      {/* Mining truck */}
      <group>
        {/* Truck body */}
        <Box args={[3, 1.5, 1.5]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#ffa500"
            metalness={0.8}
            roughness={0.3}
          />
        </Box>
        
        {/* Truck bed */}
        <Box args={[2, 1, 1.8]} position={[-0.8, 0.8, 0]}>
          <meshPhysicalMaterial
            color="#333"
            metalness={0.6}
            roughness={0.4}
          />
        </Box>

        {/* Wheels */}
        {[
          [-1.2, -0.8, 0.8],
          [1.2, -0.8, 0.8],
          [-1.2, -0.8, -0.8],
          [1.2, -0.8, -0.8]
        ].map((pos, i) => (
          <Sphere key={i} args={[0.4]} position={pos as [number, number, number]}>
            <meshPhysicalMaterial
              color="#222"
              metalness={0.1}
              roughness={0.9}
            />
          </Sphere>
        ))}
      </group>

      {/* Mining equipment labels */}
      <Html
        center
        transform
        scale={0.2}
        position={[0, 2, 0]}
        style={{
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        <div className="text-center">
          <p className="text-xs text-orange-400 font-mono">
            HAUL TRUCK CAT 797F
          </p>
        </div>
      </Html>
    </group>
  );
}

// Data streams connecting documents to AI
function DataStreams() {
  const streamsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (streamsRef.current) {
      streamsRef.current.children.forEach((child, i) => {
        const streamGroup = child as THREE.Group;
        streamGroup.rotation.z = state.clock.elapsedTime * 0.5 + i * 0.5;
      });
    }
  });

  return (
    <group ref={streamsRef}>
      {documentTypes.map((doc) => {
        const startPos = doc.position;
        const endPos = [0, 0, 0] as [number, number, number];
        
        return (
          <group key={doc.id}>
            {/* Data stream line */}
            <Box 
              args={[0.02, 0.02, 
                Math.sqrt(
                  Math.pow(endPos[0] - startPos[0], 2) + 
                  Math.pow(endPos[1] - startPos[1], 2) + 
                  Math.pow(endPos[2] - startPos[2], 2)
                )
              ]}
              position={[
                (startPos[0] + endPos[0]) / 2,
                (startPos[1] + endPos[1]) / 2,
                (startPos[2] + endPos[2]) / 2
              ]}
              rotation={[
                Math.atan2(endPos[1] - startPos[1], endPos[2] - startPos[2]),
                -Math.atan2(endPos[0] - startPos[0], endPos[2] - startPos[2]),
                0
              ]}
            >
              <meshBasicMaterial 
                color={doc.color} 
                transparent 
                opacity={0.4}
              />
            </Box>

            {/* Data particles flowing along the stream */}
            {Array.from({ length: 3 }).map((_, j) => (
              <Float key={j} speed={3 + j} rotationIntensity={0} floatIntensity={3}>
                <Sphere 
                  args={[0.03]} 
                  position={[
                    startPos[0] + (endPos[0] - startPos[0]) * (j / 3),
                    startPos[1] + (endPos[1] - startPos[1]) * (j / 3),
                    startPos[2] + (endPos[2] - startPos[2]) * (j / 3)
                  ]}
                >
                  <meshBasicMaterial 
                    color={doc.color} 
                    transparent 
                    opacity={0.8}
                  />
                </Sphere>
              </Float>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// Main scene component
function MiningDocumentScene() {
  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00D2FF" />
      <pointLight position={[10, -10, 10]} intensity={0.6} color="#FF6B6B" />
      <pointLight position={[0, 10, 0]} intensity={0.4} color="#4ECDC4" />

      {/* Central AI processing core */}
      <AIProcessingCore />

      {/* Floating documents */}
      {documentTypes.map((doc, index) => (
        <FloatingDocument
          key={doc.id}
          doc={doc}
          index={index}
        />
      ))}

      {/* Data streams */}
      <DataStreams />

      {/* Mining equipment */}
      <MiningEquipment />

      {/* Mining site background grid */}
      <group position={[0, 0, -8]}>
        <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial 
            color="#1a1a1a" 
            wireframe 
            transparent 
            opacity={0.2}
          />
        </Plane>
      </group>

      {/* Mining context elements */}
      <group position={[0, -4, 0]}>
        {/* Ground level indicators */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Box 
            key={i}
            args={[0.1, 0.5, 0.1]} 
            position={[
              (i - 2) * 2,
              0,
              -3
            ]}
          >
            <meshBasicMaterial 
              color="#666" 
              transparent 
              opacity={0.6}
            />
          </Box>
        ))}
      </group>
    </>
  );
}

// Main component
export default function MiningDocumentIntelligence() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * 0.3, y: y * 0.3 });
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden cursor-pointer"
      onMouseMove={handleMouseMove}
      style={{
        background: 'radial-gradient(ellipse at center, rgba(255, 140, 0, 0.05) 0%, rgba(0, 210, 255, 0.05) 50%, transparent 70%)'
      }}
    >
      <Canvas
        camera={{ 
          position: [0, 2, 10], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
        dpr={[1, 2]}
        className="bg-transparent"
      >
        <MiningDocumentScene />
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Corner mining operation status */}
      <div className="absolute top-4 left-4 text-orange-400 font-mono text-xs opacity-70">
        <div className="flex items-center mb-1">
          <HardHat size={12} className="mr-2" />
          MINING OPERATIONS: ACTIVE
        </div>
        <div className="flex items-center mb-1">
          <Brain size={12} className="mr-2" />
          AI ENGINE: PROCESSING
        </div>
        <div className="flex items-center">
          <Shield size={12} className="mr-2" />
          SAFETY STATUS: COMPLIANT
        </div>
      </div>

      <div className="absolute top-4 right-4 text-cyan-400 font-mono text-xs opacity-70 text-right">
        <div className="flex items-center justify-end mb-1">
          <span className="mr-2">DOCS PROCESSED: 2.5M+</span>
          <FileText size={12} />
        </div>
        <div className="flex items-center justify-end mb-1">
          <span className="mr-2">QUERIES/MIN: 15.2K</span>
          <Search size={12} />
        </div>
        <div className="flex items-center justify-end">
          <span className="mr-2">UPTIME: 99.9%</span>
          <Database size={12} />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-orange-400 font-mono text-xs opacity-70">
        <div className="flex items-center mb-1">
          <Pickaxe size={12} className="mr-2" />
          ACTIVE SITES: 47
        </div>
        <div className="flex items-center">
          <Truck size={12} className="mr-2" />
          FLEET STATUS: OPERATIONAL
        </div>
      </div>

      <div className="absolute bottom-4 right-4 text-green-400 font-mono text-xs opacity-70 text-right">
        <div className="flex items-center justify-end mb-1">
          <span className="mr-2">COMPLIANCE: 100%</span>
          <Shield size={12} />
        </div>
        <div className="flex items-center justify-end">
          <span className="mr-2">INCIDENTS: 0</span>
          <AlertTriangle size={12} />
        </div>
      </div>

      {/* Dynamic background based on mouse movement */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x * 50}% ${50 + mousePosition.y * 50}%, rgba(255, 140, 0, 0.1) 0%, transparent 50%)`
        }}
      />

      {/* Mining-themed scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="w-full h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse"
          style={{
            animation: 'miningScan 4s linear infinite',
            boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes miningScan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
