import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { Particles } from './Particles';

interface ScannerShader {
  uniforms: {
    time: { value: number };
    color: { value: THREE.Color };
  };
  vertexShader: string;
  fragmentShader: string;
}

// Composant pour le poignet et le pouce 3D
const Finger = () => {
  const handRef = useRef<THREE.Group | null>(null);
  const thumbRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();
  const radius = 2;
  const speed = 1.5;

  useFrame(({ clock }) => {
    const hand = handRef.current;
    const thumb = thumbRef.current;
    if (hand && thumb) {
      const t = clock.getElapsedTime() * speed;
      // Mouvement circulaire plus naturel
      const x = Math.cos(t) * radius;
      const z = Math.sin(t) * radius;
      hand.position.x = x;
      hand.position.z = z;
      
      // Rotation pour suivre le mouvement
      hand.rotation.y = -t;
      
      // Animation du pouce
      const thumbAngle = Math.sin(t * 2) * 0.2;
      thumb.rotation.x = thumbAngle;
    }
  });

  useEffect(() => {
    const hand = handRef.current;
    if (hand) {
      // Animation de la caméra
      const timeline = gsap.timeline({ delay: 2 });
      
      timeline.to(camera.position, {
        x: 0,
        y: 2,
        z: 5,
        duration: 1.5,
        ease: "power2.inOut"
      });

      // Animation finale de la main vers le scanner avec effet de frappe
      timeline
        .to(hand.position, {
          x: 0,
          y: 0.5,
          z: 0,
          duration: 1,
          delay: 0.5,
          ease: "power2.out"
        })
        .to(hand.position, {
          y: 0,
          duration: 0.2,
          ease: "power4.in",
          yoyo: true,
          repeat: 2
        });
    }
  }, [camera]);

  return (
    <group ref={handRef} position={[radius, 1, 0]}>
      {/* Poignet */}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.25, 0.3, 1, 32]} />
        <meshPhongMaterial color="#ffcdb2" />
      </mesh>
      
      {/* Paume */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.3, 0.8]} />
        <meshPhongMaterial color="#ffcdb2" />
      </mesh>
      
      {/* Pouce */}
      <group ref={thumbRef} position={[-0.2, 0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
        {/* Première phalange */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.12, 0.4, 32]} />
          <meshPhongMaterial color="#ffcdb2" />
        </mesh>
        {/* Bout du pouce */}
        <mesh position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshPhongMaterial color="#ffcdb2" />
        </mesh>
      </group>
    </group>
  );
};

// Composant pour le scanner
const Scanner = () => {
  const scannerRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Shader personnalisé pour l'effet de scan
  const scannerShader: ScannerShader = {
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0x00ff00) }
    },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      
      void main() {
        float wave = sin(vUv.y * 20.0 + time * 2.0) * 0.5 + 0.5;
        float glow = sin(time) * 0.5 + 0.5;
        vec3 finalColor = color * (wave * 0.3 + 0.7) * (glow * 0.5 + 0.5);
        gl_FragColor = vec4(finalColor, 0.8);
      }
    `
  };

  useFrame(({ clock }) => {
    const material = materialRef.current;
    if (material) {
      material.uniforms.time.value = clock.getElapsedTime();
    }
  });

  useEffect(() => {
    const scanner = scannerRef.current;
    if (scanner) {
      // Animation d'apparition du scanner
      gsap.from(scanner.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)"
      });
    }
  }, []);

  return (
    <group ref={scannerRef} position={[0, -0.5, 0]}>
      {/* Base du scanner */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.5, 0.2, 1.5]} />
        <meshPhongMaterial color="#333333" />
      </mesh>
      {/* Surface de scan */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1, 1, 32, 32]} />
        <shaderMaterial
          ref={materialRef}
          {...scannerShader}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Composant principal
interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }: IntroAnimationProps) => {
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState<string>('Bienvenue dans mon portfolio\nChargement...');

  useEffect(() => {
    // Add keyframes for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glitch {
        0% {
          clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
          transform: translate(0);
        }
        2% {
          clip-path: polygon(0 15%, 100% 15%, 100% 15%, 0 15%);
          transform: translate(-2px);
        }
        4% {
          clip-path: polygon(0 10%, 100% 10%, 100% 20%, 0 20%);
          transform: translate(2px);
        }
        6% {
          clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%);
          transform: translate(0);
        }
        8% {
          clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%);
          transform: translate(0);
        }
        9% {
          clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%);
          transform: translate(0);
        }
        10% {
          clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%);
          transform: translate(-2px);
        }
        13% {
          clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%);
          transform: translate(0);
        }
        14% {
          clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%);
          transform: translate(2px);
        }
        16% {
          clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%);
          transform: translate(0);
        }
        18% {
          clip-path: polygon(0 70%, 100% 70%, 100% 80%, 0 80%);
          transform: translate(-2px);
        }
        20% {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          transform: translate(0);
        }
      }
      @keyframes scanline {
        0% {
          transform: translateY(-100%);
        }
        100% {
          transform: translateY(100%);
        }
      }
      @keyframes blink {
        0% { border-color: transparent; }
        50% { border-color: #00ff00; }
        100% { border-color: transparent; }
      }
    `;
    document.head.appendChild(style);

    const timeline = gsap.timeline({
      onComplete: () => {
        setTimeout(onComplete, 1000);
      }
    });

    const text = "SYSTEM LOADING...\nINITIALIZING...\nACCESS GRANTED\n> WELCOME TO MY PORTFOLIO";
    let currentText = '';
    let currentLine = 0;
    let charIndex = 0;
    
    const typeText = () => {
      if (!welcomeTextRef.current) return;
      
      const lines = text.split('\n');
      if (currentLine >= lines.length) {
        setTimeout(onComplete, 2000);
        return;
      }
      
      if (charIndex < lines[currentLine].length) {
        currentText += lines[currentLine][charIndex];
        const displayText = currentText.split('\n')
          .map(line => line.startsWith('>') ? line : '> ' + line)
          .join('\n');
        welcomeTextRef.current.innerText = displayText + '█';
        charIndex++;
        setTimeout(typeText, 50);
      } else {
        currentText += '\n';
        charIndex = 0;
        currentLine++;
        setTimeout(typeText, 500);
      }
    };

    timeline
      .to(welcomeTextRef.current, {
        opacity: 1,
        duration: 0.5,
        onComplete: typeText
      });
  }, [onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: '#000',
        zIndex: 9999,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(0,50,0,0.3) 0%, rgba(0,0,0,0.9) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }
      }}
    >
      <Canvas
        camera={{ position: [5, 3, 5], fov: 50 }}
        style={{
          background: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
          boxShadow: 'inset 0 0 50px rgba(0, 255, 0, 0.2)',
          position: 'relative',
          zIndex: 0
        }}
        dpr={Math.min(2, window.devicePixelRatio)}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        shadows
      >
        <Stars
          radius={300}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <fog attach="fog" args={['#000', 5, 15]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight
          position={[0, 5, 0]}
          angle={0.3}
          penumbra={1}
          intensity={1.5}
          castShadow
          color="#00ff88"
        />
        <Particles count={1000} />
        <Environment preset="night" />
        <Finger />
        <Scanner />
        <OrbitControls enabled={false} />
      </Canvas>

      <motion.div
        ref={welcomeTextRef}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0,
          scale: 0.5
        }}
      >
        <Typography
          component="pre"
          sx={{
            color: '#00ff00',
            fontFamily: 'monospace',
            fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' },
            textAlign: 'left',
            position: 'relative',
            padding: '2rem',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #00ff00',
            borderRadius: '4px',
            '@keyframes glitch': {
            '0%': {
              transform: 'translate(0)',
              textShadow: '0 0 5px #00ff00'
            },
            '2%': {
              transform: 'translate(-2px, 2px)',
              textShadow: '2px 2px 5px #00ff00'
            },
            '4%': {
              transform: 'translate(2px, -2px)',
              textShadow: '-2px -2px 5px #00ff00'
            },
            '6%': {
              transform: 'translate(0)',
              textShadow: '0 0 5px #00ff00'
            },
            '100%': {
              transform: 'translate(0)',
              textShadow: '0 0 5px #00ff00'
            }
          },
          animation: 'glitch 5s infinite',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '5px',
              background: 'linear-gradient(transparent, #00ff00)',
              '@keyframes scanline': {
                '0%': {
                  transform: 'translateY(0)'
                },
                '50%': {
                  transform: 'translateY(100%)'
                },
                '100%': {
                  transform: 'translateY(0)'
                }
              },
              animation: 'scanline 4s linear infinite',
              opacity: 0.3
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              right: '10px',
              width: '10px',
              height: '20px',
              backgroundColor: '#00ff00',
              '@keyframes blink': {
                '0%': {
                  opacity: 1
                },
                '50%': {
                  opacity: 0
                },
                '100%': {
                  opacity: 1
                }
              },
              animation: 'blink 1s steps(2) infinite'
            }
          }}
        >
          {text.split('\n')[0]}
        </Typography>
      </motion.div>
    </Box>
  );
};

export default IntroAnimation;
