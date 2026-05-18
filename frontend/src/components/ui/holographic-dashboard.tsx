'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Float, OrbitControls, Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Upload, 
  MessageSquare, 
  Database, 
  Brain, 
  Shield, 
  Search
} from 'lucide-react';

// Interface tile data
const dashboardTiles = [
  {
    id: 'upload',
    title: 'Upload PDF',
    description: 'Intelligent document processing',
    icon: Upload,
    color: '#00D2FF',
    position: [-2.5, 1.5, 0] as [number, number, number],
    scale: 0.8,
    delay: 0
  },
  {
    id: 'chat',
    title: 'Ask Questions',
    description: 'AI-powered conversations',
    icon: MessageSquare,
    color: '#FF6B6B',
    position: [2.5, 1.5, 0] as [number, number, number],
    scale: 0.8,
    delay: 0.2
  },
  {
    id: 'extract',
    title: 'Extracted Data',
    description: 'Structured information',
    icon: Database,
    color: '#4ECDC4',
    position: [-2.5, -1.5, 0] as [number, number, number],
    scale: 0.8,
    delay: 0.4
  },
  {
    id: 'intelligence',
    title: 'AI Intelligence',
    description: 'Smart analysis & insights',
    icon: Brain,
    color: '#A8E6CF',
    position: [2.5, -1.5, 0] as [number, number, number],
    scale: 0.8,
    delay: 0.6
  },
  {
    id: 'security',
    title: 'Secure Processing',
    description: 'Enterprise-grade security',
    icon: Shield,
    color: '#FFD93D',
    position: [0, 3, -1] as [number, number, number],
    scale: 0.7,
    delay: 0.8
  },
  {
    id: 'search',
    title: 'Smart Search',
    description: 'Semantic document search',
    icon: Search,
    color: '#FF8A80',
    position: [0, -3, -1] as [number, number, number],
    scale: 0.7,
    delay: 1.0
  }
];

// Floating holographic tile component
function HolographicTile({ tile, onClick }: { tile: typeof dashboardTiles[0], onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + tile.delay) * 0.1;
      meshRef.current.position.y = tile.position[1] + Math.sin(state.clock.elapsedTime * 0.8 + tile.delay) * 0.1;
    }
    
    if (glowRef.current && glowRef.current.material) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2 + tile.delay) * 0.1;
      glowRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  const IconComponent = tile.icon;

  return (
    <Float 
      speed={1 + tile.delay * 0.5} 
      rotationIntensity={0.3} 
      floatIntensity={0.5}
    >
      <group 
        position={tile.position}
        scale={hovered ? tile.scale * 1.1 : tile.scale}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
      >
        {/* Glow effect */}
        <mesh ref={glowRef}>
          <ringGeometry args={[1.2, 1.8, 32]} />
          <meshBasicMaterial 
            color={tile.color} 
            transparent 
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Main tile */}
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[2, 1.5, 0.1]} />
          <meshPhysicalMaterial
            color={tile.color}
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.8}
            transmission={0.9}
            thickness={0.5}
          />
        </mesh>

        {/* Border wireframe */}
        <mesh>
          <boxGeometry args={[2.1, 1.6, 0.11]} />
          <meshBasicMaterial 
            color={tile.color} 
            wireframe 
            transparent 
            opacity={0.6}
          />
        </mesh>

        {/* HTML content overlay */}
        <Html
          center
          transform
          scale={0.15}
          distanceFactor={1.2}
          style={{
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div className="flex flex-col items-center justify-center w-48 h-32 text-white">
            <div 
              className="mb-2 p-2 rounded-lg"
              style={{ 
                backgroundColor: tile.color + '20',
                border: `1px solid ${tile.color}60`
              }}
            >
              <IconComponent size={24} color={tile.color} />
            </div>
            <h3 
              className="text-sm font-bold text-center mb-1"
              style={{ color: tile.color }}
            >
              {tile.title}
            </h3>
            <p className="text-xs text-center opacity-80 leading-tight">
              {tile.description}
            </p>
          </div>
        </Html>

        {/* Particle effects */}
        <group>
          {Array.from({ length: 5 }).map((_, i) => (
            <Sphere key={i} args={[0.02]} position={[
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 0.5
            ]}>
              <meshBasicMaterial 
                color={tile.color} 
                transparent 
                opacity={0.6}
              />
            </Sphere>
          ))}
        </group>
      </group>
    </Float>
  );
}

// Central holographic core
function HolographicCore() {
  const coreRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central core sphere */}
      <group ref={coreRef}>
        <Sphere args={[0.5]} castShadow>
          <meshPhysicalMaterial
            color="#00D2FF"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.8}
            transmission={0.9}
          />
        </Sphere>
        
        {/* Inner glow */}
        <Sphere args={[0.4]}>
          <meshBasicMaterial 
            color="#00D2FF" 
            transparent 
            opacity={0.3}
          />
        </Sphere>
      </group>

      {/* Rotating rings */}
      <group ref={ringsRef}>
        <Ring args={[0.8, 1.0, 32]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial 
            color="#4ECDC4" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </Ring>
        <Ring args={[1.2, 1.4, 32]} rotation={[0, 0, 0]}>
          <meshBasicMaterial 
            color="#FF6B6B" 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </Ring>
        <Ring args={[1.0, 1.1, 32]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <meshBasicMaterial 
            color="#A8E6CF" 
            transparent 
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </Ring>
      </group>

      {/* Energy particles */}
      <group>
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 2 + Math.sin(i) * 0.5;
          return (
            <Float key={i} speed={2 + i * 0.1} rotationIntensity={1} floatIntensity={2}>
              <Sphere 
                args={[0.03]} 
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle * 2) * 0.5,
                  Math.sin(angle) * radius
                ]}
              >
                <meshBasicMaterial 
                  color="#00D2FF" 
                  transparent 
                  opacity={0.8}
                />
              </Sphere>
            </Float>
          );
        })}
      </group>
    </group>
  );
}

// Data stream visualization
function DataStreams() {
  const streamsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (streamsRef.current) {
      streamsRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 2;
        child.rotation.z = state.clock.elapsedTime * 0.5 + i;
      });
    }
  });

  return (
    <group ref={streamsRef}>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 4;
        return (
          <group 
            key={i}
            position={[
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            ]}
          >
            <mesh>
              <cylinderGeometry args={[0.02, 0.02, 1]} />
              <meshBasicMaterial 
                color="#00D2FF" 
                transparent 
                opacity={0.6}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Main scene component
function HolographicScene() {
  useThree();
  const handleTileClick = (tileId: string) => {
    void tileId;
    // Add haptic feedback or sound here
  };

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

      {/* Central holographic core */}
      <HolographicCore />

      {/* Data streams */}
      <DataStreams />

      {/* Holographic tiles */}
      {dashboardTiles.map((tile) => (
        <HolographicTile
          key={tile.id}
          tile={tile}
          onClick={() => handleTileClick(tile.id)}
        />
      ))}

      {/* Background grid */}
      <group position={[0, 0, -5]}>
        <mesh>
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial 
            color="#00D2FF" 
            wireframe 
            transparent 
            opacity={0.1}
          />
        </mesh>
      </group>

      {/* Floating text */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <Html
          center
          transform
          scale={0.3}
          position={[0, 4, 0]}
          distanceFactor={1.5}
          style={{
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              AI DOCUMENT INTELLIGENCE
            </h2>
            <p className="text-sm text-cyan-300 mt-1 opacity-80">
              Next-Generation Mining Platform
            </p>
          </div>
        </Html>
      </Float>
    </>
  );
}

// Main component
export default function HolographicDashboard() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * 0.5, y: y * 0.5 });
  };

  return (
    <div 
      className="w-full h-full relative overflow-hidden cursor-pointer"
      onMouseMove={handleMouseMove}
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0, 210, 255, 0.1) 0%, transparent 70%)'
      }}
    >
      <Canvas
        camera={{ 
          position: [0, 0, 12], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
        dpr={[1, 2]}
        className="bg-transparent"
      >
        <HolographicScene />
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
          }}
        />
      </Canvas>

      {/* Overlay effects */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${50 + mousePosition.x * 50}% ${50 + mousePosition.y * 50}%, rgba(0, 210, 255, 0.1) 0%, transparent 50%)`
        }}
      />

      {/* Corner UI elements */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono text-xs opacity-60">
        <div>SYSTEM: ONLINE</div>
        <div>AI ENGINE: ACTIVE</div>
        <div>SECURITY: ENABLED</div>
      </div>

      <div className="absolute top-4 right-4 text-cyan-400 font-mono text-xs opacity-60 text-right">
        <div>CPU: 98%</div>
        <div>MEM: 76%</div>
        <div>NET: 124 Mbps</div>
      </div>

      <div className="absolute bottom-4 left-4 text-cyan-400 font-mono text-xs opacity-60">
        <div>DOCUMENTS: 2.5M+</div>
        <div>QUERIES: 15.2K/min</div>
      </div>

      <div className="absolute bottom-4 right-4 text-cyan-400 font-mono text-xs opacity-60 text-right">
        <div>UPTIME: 99.9%</div>
        <div>LATENCY: 12ms</div>
      </div>

      {/* Scan lines effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
          style={{
            animation: 'scan 3s linear infinite',
            boxShadow: '0 0 10px rgba(0, 210, 255, 0.5)'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
