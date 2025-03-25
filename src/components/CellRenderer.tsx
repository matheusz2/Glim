import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { Cell, Emotion } from '../types/cell'
import { useGlimStore } from '../store/useGlimStore'
import { FragmentOrbit } from './FragmentOrbit'
import { GlowEffect } from './GlowEffect'

const emotionColors = {
  happy: '#FFD700',
  sad: '#4169E1',
  excited: '#FF4500',
  calm: '#98FB98',
  neutral: '#646cff'
}

const emotionIntensities = {
  happy: 1.2,
  sad: 0.8,
  excited: 1.5,
  calm: 0.6,
  neutral: 1.0
}

interface CellRendererProps {
  cell: Cell
  isInteractive?: boolean
}

export const CellRenderer = ({ cell, isInteractive = true }: CellRendererProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const { updateEmotion } = useGlimStore()
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    // Animação de pulsação baseada na emoção
    const baseIntensity = emotionIntensities[cell.emotion]
    const pulseSpeed = baseIntensity * 2
    
    meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1 * baseIntensity
    meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1 * baseIntensity
    meshRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1 * baseIntensity
    
    // Rotação suave
    meshRef.current.rotation.y += delta * 0.5 * baseIntensity
  })

  // Efeito de rastro baseado na emoção
  const trailColor = new THREE.Color(emotionColors[cell.emotion])
  const trailLength = emotionIntensities[cell.emotion] * 20

  return (
    <group position={cell.position}>
      {/* Renderizar Glows ativos */}
      {cell.glows.map((glow) => (
        <GlowEffect
          key={`${glow.fromCellId}-${glow.timestamp.getTime()}`}
          glow={glow}
          targetPosition={[0, 0, 0]} // Centro da célula
        />
      ))}

      {/* Célula principal */}
      <Trail
        width={1}
        length={trailLength}
        color={trailColor}
        attenuation={(t) => t * t}
      >
        <Sphere ref={meshRef} args={[1, 32, 32]}>
          <meshStandardMaterial
            color={emotionColors[cell.emotion]}
            roughness={0.3}
            metalness={0.7}
            emissive={emotionColors[cell.emotion]}
            emissiveIntensity={0.2}
          />
        </Sphere>
      </Trail>
      
      {/* Renderizar fragmentos orbitais */}
      {cell.fragments.map((fragment) => (
        <FragmentOrbit
          key={fragment.id}
          fragment={fragment}
          orbitRadius={3}
          orbitSpeed={0.5}
        />
      ))}
    </group>
  )
} 