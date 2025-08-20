import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Group } from 'three';

// --- Reusable Components for the Abacus ---

// Define the materials we'll use for the abacus
const whiteMaterial = new THREE.MeshStandardMaterial({
  color: '#FFFFFF',
  metalness: 0.1,
  roughness: 0.2,
});

const goldMaterial = new THREE.MeshStandardMaterial({
  color: '#FFD700',
  metalness: 0.7,
  roughness: 0.3,
});

// Component for a single rod
function Rod(props: any) {
  return (
    <mesh {...props} material={goldMaterial}>
      <cylinderGeometry args={[0.05, 0.05, 10, 8]} />
    </mesh>
  );
}

// Component for a single bead
function Bead(props: any) {
  return (
    <mesh {...props} material={goldMaterial}>
      <sphereGeometry args={[0.4, 16, 16]} />
    </mesh>
  );
}

// Component for the main frame
function Frame() {
  return (
    <group>
      {/* Top bar */}
      <mesh position={[0, 4.5, 0]} material={whiteMaterial}>
        <boxGeometry args={[18, 1, 1]} />
      </mesh>
      {/* Bottom bar */}
      <mesh position={[0, -4.5, 0]} material={whiteMaterial}>
        <boxGeometry args={[18, 1, 1]} />
      </mesh>
      {/* Left bar */}
      <mesh position={[-8.5, 0, 0]} material={whiteMaterial}>
        <boxGeometry args={[1, 10, 1]} />
      </mesh>
      {/* Right bar */}
      <mesh position={[8.5, 0, 0]} material={whiteMaterial}>
        <boxGeometry args={[1, 10, 1]} />
      </mesh>
      {/* Divider bar */}
       <mesh position={[0, 1.5, 0]} material={whiteMaterial}>
        <boxGeometry args={[18, 0.5, 0.8]} />
      </mesh>
    </group>
  );
}


// --- Main Abacus Model ---
// This component assembles all the parts
function AbacusModel() {
    const abacusRef = useRef<Group>(null);

  // Create 15 rods with beads
  const rods = Array.from({ length: 15 }, (_, i) => {
    const xPos = -7 + i; // Calculate x position for each rod
    return (
      <group key={i} position={[xPos, 0, 0]}>
        <Rod />
        {/* Upper deck bead (1 bead) */}
        <Bead position={[0, 2.5, 0]} />
        {/* Lower deck beads (4 beads) */}
        <Bead position={[0, 0.5, 0]} />
        <Bead position={[0, -0.5, 0]} />
        <Bead position={[0, -1.5, 0]} />
        <Bead position={[0, -2.5, 0]} />
      </group>
    );
  });

  return (
    <group ref={abacusRef} scale={0.8} rotation={[0.2, 0.5, 0]}>
      <Frame />
      {rods}
    </group>
  );
}


// --- The Main React Component to be Exported ---
// This sets up the 3D scene
const StaticAbacus = () => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        {/* Add some lighting to see the colors */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -5, -10]} intensity={0.5} />

        <AbacusModel />

        {/* This allows you to rotate the camera with your mouse */}
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8}/>
      </Canvas>
    </div>
  );
};

export default StaticAbacus;