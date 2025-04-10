
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3, Euler } from 'three';

// Create a simplified Kenya map shape
const KenyaMapShape = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 1, 
  viewMode = 'front' 
}: { 
  position?: [number, number, number],
  rotation?: [number, number, number],
  scale?: number,
  viewMode?: string
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef(new THREE.Euler(...rotation));
  
  // Define Kenya's rough shape as a custom geometry
  useEffect(() => {
    if (viewMode === 'south') {
      targetRotation.current = new THREE.Euler(Math.PI / 4, 0, 0);
    } else {
      targetRotation.current = new THREE.Euler(0, 0, 0);
    }
  }, [viewMode]);

  useFrame(() => {
    if (meshRef.current) {
      // Smooth transition to target rotation
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        targetRotation.current.x,
        0.05
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        targetRotation.current.y,
        0.05
      );
    }
  });
  
  return (
    <group position={new THREE.Vector3(...position)} scale={scale}>
      <mesh ref={meshRef}>
        <meshStandardMaterial 
          color="#FF0000" 
          emissive="#330000" 
          roughness={0.5} 
          metalness={0.8}
        />
        {/* Use SVG path from Kenya map as shape */}
        <shapeGeometry args={[createKenyaShape()]} />
        <meshStandardMaterial 
          color="#00FF00" 
          emissive="#003300" 
          roughness={0.3} 
          metalness={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Add glow effect */}
      <mesh scale={1.05}>
        <shapeGeometry args={[createKenyaShape()]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          emissive="#FFFFFF" 
          transparent={true} 
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Create Kenya shape based on SVG path
const createKenyaShape = () => {
  const shape = new THREE.Shape();
  
  // Simplified path based on Kenya's outline
  shape.moveTo(0, 0);
  shape.bezierCurveTo(70, 20, 110, 70, 130, 140);
  shape.bezierCurveTo(150, 210, 140, 280, 120, 330);
  shape.bezierCurveTo(100, 380, 60, 420, 10, 440);
  shape.bezierCurveTo(-40, 460, -100, 470, -150, 450);
  shape.bezierCurveTo(-200, 430, -240, 390, -270, 340);
  shape.bezierCurveTo(-300, 290, -310, 230, -290, 170);
  shape.bezierCurveTo(-270, 110, -230, 60, -180, 30);
  shape.bezierCurveTo(-130, 0, -70, -20, 0, 0);
  
  return shape;
};

// Main 3D Kenya map component
const KenyaMap3D = ({ viewMode = 'front', visible = true, flying = false }: {
  viewMode?: string,
  visible?: boolean,
  flying?: boolean
}) => {
  const mapRef = useRef<THREE.Group>(null);
  const targetPosition = useRef(new Vector3(0, 0, 0));
  
  useEffect(() => {
    if (flying) {
      targetPosition.current = new Vector3(0, 0, -50);
    } else {
      targetPosition.current = new Vector3(0, 0, 0);
    }
  }, [flying]);
  
  useFrame(() => {
    if (mapRef.current) {
      // Smooth transition to target position
      mapRef.current.position.z = THREE.MathUtils.lerp(
        mapRef.current.position.z,
        targetPosition.current.z,
        0.05
      );
      
      // Constant gentle rotation
      mapRef.current.rotation.y += 0.002;
    }
  });

  if (!visible) return null;
  
  return (
    <group ref={mapRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <KenyaMapShape viewMode={viewMode} scale={0.01} />
    </group>
  );
};

export default KenyaMap3D;
