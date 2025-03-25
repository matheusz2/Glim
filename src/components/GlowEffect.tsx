import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { Glow, GlowType } from '../types/cell'

const glowColors = {
  curiosity: '#00ffff', // Ciano brilhante
  impact: '#ff4500',    // Laranja vibrante
  empathy: '#ff69b4',   // Rosa suave
  connection: '#7fff00' // Verde neon
}

const glowProperties = {
  curiosity: { speed: 1.2, size: 0.3, trail: 15 },
  impact: { speed: 2, size: 0.4, trail: 20 },
  empathy: { speed: 0.8, size: 0.35, trail: 12 },
  connection: { speed: 1.5, size: 0.25, trail: 18 }
}

interface GlowEffectProps {
  glow: Glow
  targetPosition?: [number, number, number]
}

export const GlowEffect = ({ glow, targetPosition = [0, 0, 0] }: GlowEffectProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const sphereRef = useRef<THREE.Mesh>(null)
  
  // Calcular posição inicial aleatória em uma esfera
  const initialPosition = useMemo(() => {
    const radius = 5
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    return [
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    ] as [number, number, number]
  }, [])

  // Propriedades do glow atual
  const properties = glowProperties[glow.type]
  const color = glowColors[glow.type]

  useFrame((state, delta) => {
    if (!groupRef.current || !sphereRef.current) return

    // Movimento em direção ao alvo
    const currentPos = groupRef.current.position
    const target = new THREE.Vector3(...targetPosition)
    const direction = target.sub(currentPos).normalize()
    
    // Velocidade baseada na intensidade e tipo
    const speed = properties.speed * glow.intensity * delta
    
    // Atualizar posição
    currentPos.add(direction.multiplyScalar(speed))

    // Pulsar baseado no tipo
    const scale = 1 + Math.sin(state.clock.elapsedTime * properties.speed * 2) * 0.2
    sphereRef.current.scale.setScalar(scale)
  })

  return (
    <group ref={groupRef} position={initialPosition}>
      <Trail
        width={properties.size}
        length={properties.trail}
        color={color}
        attenuation={(t) => t * t}
      >
        <Sphere ref={sphereRef} args={[properties.size, 16, 16]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </Sphere>
      </Trail>
    </group>
  )
} 