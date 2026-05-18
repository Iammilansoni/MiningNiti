'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Box, MeshDistortMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Glowing Orb representing AI Core
function AICore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Core sphere */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere ref={meshRef} args={[1.2, 64, 64]}>
          <MeshDistortMaterial
            color="#00ffa3"
            emissive="#00ffa3"
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.8}
            distort={0.3}
            speed={2}
          />
        </Sphere>
      </Float>
      
      {/* Outer glow */}
      <Sphere ref={glowRef} args={[1.8, 32, 32]}>
        <meshBasicMaterial
          color="#00ffa3"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Inner energy rings */}
      {[0, 1, 2].map((i) => (
        <EnergyRing key={i} radius={1.5 + i * 0.4} speed={0.5 + i * 0.2} delay={i * 0.3} />
      ))}
    </group>
  );
}

// Energy ring orbiting the core
function EnergyRing({ radius, speed, delay }: { radius: number; speed: number; delay: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * speed + delay;
      ringRef.current.rotation.y = state.clock.elapsedTime * speed * 0.7 + delay;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color="#00ffa3" transparent opacity={0.4} />
    </mesh>
  );
}

// Floating data cubes representing documents
function FloatingDataCube({ position, color, delay }: { 
  position: [number, number, number]; 
  color: string; 
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5 + delay;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.7 + delay;
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime + delay) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <Box ref={meshRef} args={[0.4, 0.4, 0.4]} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.9}
        />
      </Box>
    </Float>
  );
}

// Data stream particles flowing to center
function DataParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const z = positions[i3 + 2];
        const angle = Math.atan2(z, x);
        const radius = Math.sqrt(x * x + z * z);
        
        // Spiral inward
        const newRadius = radius - 0.02;
        if (newRadius < 0.5) {
          // Reset to outer edge
          const resetRadius = 5;
          positions[i3] = Math.cos(angle) * resetRadius;
          positions[i3 + 2] = Math.sin(angle) * resetRadius;
        } else {
          positions[i3] = Math.cos(angle + 0.01) * newRadius;
          positions[i3 + 2] = Math.sin(angle + 0.01) * newRadius;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ffa3"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Mining helmet floating element
function MiningElement({ position, rotation }: { 
  position: [number, number, number]; 
  rotation?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Simple pickaxe representation */}
      <Box args={[0.1, 0.8, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
      </Box>
      <Box args={[0.5, 0.15, 0.08]} position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </Box>
    </group>
  );
}

// Main scene component
function HeroScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ffa3" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7c3aed" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        color="#00ffa3"
        castShadow
      />

      {/* Background stars */}
      <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

      {/* Central AI Core */}
      <AICore />

      {/* Floating data cubes */}
      <FloatingDataCube position={[-2.5, 1, -1]} color="#00ffa3" delay={0} />
      <FloatingDataCube position={[2.5, -0.5, 1]} color="#7c3aed" delay={1} />
      <FloatingDataCube position={[-1.5, -1.5, 2]} color="#06b6d4" delay={2} />
      <FloatingDataCube position={[1.5, 1.5, -2]} color="#f59e0b" delay={3} />
      <FloatingDataCube position={[3, 0.5, 0]} color="#ef4444" delay={4} />
      <FloatingDataCube position={[-3, -0.5, -1]} color="#10b981" delay={5} />

      {/* Data particles */}
      <DataParticles />

      {/* Mining elements */}
      <MiningElement position={[-4, 0, 0]} rotation={[0, 0.5, 0.2]} />
      <MiningElement position={[4, -1, -1]} rotation={[0, -0.5, -0.2]} />
    </>
  );
}

// Main exported component
export default function HeroMiningScene() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <HeroScene />
      </Canvas>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>
    </div>
  );
}
