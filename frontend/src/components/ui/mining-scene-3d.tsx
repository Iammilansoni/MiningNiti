'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function MiningTruck({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#ffa500" />
      </mesh>
      {/* Wheels */}
      <mesh position={[position[0] - 0.8, position[1] - 0.7, position[2] + 1.2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[position[0] + 0.8, position[1] - 0.7, position[2] + 1.2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[position[0] - 0.8, position[1] - 0.7, position[2] - 1.2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[position[0] + 0.8, position[1] - 0.7, position[2] - 1.2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.2, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </Float>
  );
}

function RotatingCube({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#64748b" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Point light for dramatic effect */}
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
      
      {/* Mining truck */}
      <MiningTruck position={[0, 0, 0]} />
      
      {/* Floating ore cubes */}
      <RotatingCube position={[-3, 2, -2]} />
      <RotatingCube position={[3, 1, 2]} />
      <RotatingCube position={[0, 3, -3]} />
      
      {/* Sparkles for magical effect */}
      <Sparkles
        count={100}
        scale={[10, 10, 10]}
        size={2}
        speed={0.4}
        color="#00ffff"
      />
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2d3748" opacity={0.8} transparent />
      </mesh>
    </>
  );
}

export default function MiningScene3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        shadows
        className="bg-transparent"
      >
        <Scene />
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
