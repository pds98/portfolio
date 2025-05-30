import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Points } from '@react-three/drei';
import type { BufferGeometry, Points as ThreePoints, PointLight } from 'three';

type ParticlesProps = {
  count: number;
};

// Utility function to create a smooth particle gradient
const createGradient = (ctx: CanvasRenderingContext2D, width: number, height: number): CanvasGradient => {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width / 2
  );
  
  // Enhanced green particle effect
  gradient.addColorStop(0, 'rgba(0,255,150,1)');
  gradient.addColorStop(0.2, 'rgba(0,255,100,0.8)');
  gradient.addColorStop(0.4, 'rgba(0,255,50,0.6)');
  gradient.addColorStop(0.6, 'rgba(0,255,30,0.4)');
  gradient.addColorStop(0.8, 'rgba(0,255,20,0.2)');
  gradient.addColorStop(1, 'rgba(0,255,0,0)');
  
  return gradient;
};

const createParticleTexture = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');

    ctx.clearRect(0, 0, size, size);
    
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    
    gradient.addColorStop(0, 'rgba(0,255,150,1)');
    gradient.addColorStop(0.2, 'rgba(0,255,100,0.8)');
    gradient.addColorStop(0.4, 'rgba(0,255,50,0.6)');
    gradient.addColorStop(0.6, 'rgba(0,255,30,0.4)');
    gradient.addColorStop(0.8, 'rgba(0,255,20,0.2)');
    gradient.addColorStop(1, 'rgba(0,255,0,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    return canvas;
  } catch (error) {
    console.error('Error creating particle texture:', error);
    return null;
  }
};

// Create a reusable particle texture
const particleTexture = (() => {
  const fallbackTexture = new THREE.DataTexture(
    new Uint8Array([0, 255, 0]), // Green pixel
    1, 1,
    THREE.RGBFormat
  );
  fallbackTexture.needsUpdate = true;
  
  const canvas = createParticleTexture();
  return canvas
    ? new THREE.CanvasTexture(canvas)
    : fallbackTexture;
})();



export const Particles = ({ count }: ParticlesProps): JSX.Element => {
  const meshRef = useRef<ThreePoints<BufferGeometry>>(null);
  const lightRef = useRef<PointLight>(null);
  const { camera, gl } = useThree();
  const [isReady, setIsReady] = useState(false);

  // Initialize particles
  // Initialize particles with spherical distribution
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * 4; // Cube root for better distribution
      
      // Calculate particle position using spherical coordinates
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      // Store position in array
      const i3 = i * 3;
      temp[i3] = x;
      temp[i3 + 1] = y;
      temp[i3 + 2] = z;
    }
    return temp;
  }, [count]);

  // Initialize particle colors with green variations
  const colors = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const hue = 0.33 + (Math.random() * 0.1 - 0.05); // Green with slight variation
      const saturation = Math.random() * 0.3 + 0.7; // High saturation
      const lightness = Math.random() * 0.3 + 0.7; // High brightness
      
      color.setHSL(hue, saturation, lightness);
      temp[i3] = color.r;
      temp[i3 + 1] = color.g;
      temp[i3 + 2] = color.b;
    }
    return temp;
  }, [count]);

  // Setup renderer and camera
  useEffect(() => {
    if (camera && gl) {
      camera.layers.enable(1);
      gl.setPixelRatio(Math.min(2, window.devicePixelRatio));
      gl.setClearColor(new THREE.Color(0x000000), 0);
      setIsReady(true);

      return () => {
        camera.layers.disable(1);
      };
    }
  }, [camera, gl]);

  // Generate random particles
  const particlesPositions = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const radius = 15; // Increased radius for better spread
    const spherical = new THREE.Spherical();
    const vector = new THREE.Vector3();


    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Create particles in a sphere pattern with some randomization
      spherical.radius = (Math.random() * 0.5 + 0.5) * radius; // More even distribution
      spherical.phi = Math.acos(-1 + Math.random() * 2);
      spherical.theta = Math.random() * Math.PI * 2;

      vector.setFromSpherical(spherical);
      
      // Add some noise to the positions
      vector.x += (Math.random() - 0.5) * 2;
      vector.y += (Math.random() - 0.5) * 2;
      vector.z += (Math.random() - 0.5) * 2;
      
      temp[i3] = vector.x;
      temp[i3 + 1] = vector.y;
      temp[i3 + 2] = vector.z;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current || !isReady) return;

    const time = state.clock.getElapsedTime();
    
    // Smooth rotation of the entire particle system
    meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.2;
    meshRef.current.rotation.y = time * 0.15;

    // Update particle positions with organic motion
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const baseX = particles[i3];
      const baseY = particles[i3 + 1];
      const baseZ = particles[i3 + 2];

      // Calculate radial distance for scaling effect
      const radialDist = Math.sqrt(baseX * baseX + baseY * baseY + baseZ * baseZ);
      const timeFactor = time * (0.2 + radialDist * 0.02);

      // Add complex wave motion with varying amplitudes
      const waveX = Math.sin(timeFactor + baseY * 0.5) * (0.05 + radialDist * 0.01);
      const waveY = Math.cos(timeFactor + baseX * 0.5) * (0.05 + radialDist * 0.01);
      const waveZ = Math.sin(timeFactor + baseZ * 0.5) * (0.05 + radialDist * 0.01);

      // Add spiral motion
      const spiral = time * 0.1;
      const spiralX = Math.cos(spiral + radialDist) * 0.02;
      const spiralZ = Math.sin(spiral + radialDist) * 0.02;

      positions[i3] = baseX + waveX + spiralX;
      positions[i3 + 1] = baseY + waveY;
      positions[i3 + 2] = baseZ + waveZ + spiralZ;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;

    // Update light position for dynamic lighting
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(time * 0.7) * 3;
      lightRef.current.position.y = Math.cos(time * 0.5) * 4;
      lightRef.current.position.z = Math.cos(time * 0.3) * 3;
    }
  });



  return (
    <>
      {isReady && (
        <Points
          ref={meshRef}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={1}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={count}
              array={particles}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
            />
            <bufferAttribute
              attach="attributes-color"
              count={count}
              array={colors}
              itemSize={3}
              usage={THREE.StaticDrawUsage}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.02}
            vertexColors
            transparent
            sizeAttenuation
            depthWrite={false}
            toneMapped={false}
            alphaMap={particleTexture}
          />
        </Points>
      )}
      <pointLight
        ref={lightRef}
        distance={15}
        intensity={2}
        color="#00ff00"
      />
    </>
  );
}
