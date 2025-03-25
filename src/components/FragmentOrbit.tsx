import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { Fragment } from '../types/cell'

interface FragmentOrbitProps {
  fragment: Fragment
  orbitRadius?: number
  orbitSpeed?: number
}

export const FragmentOrbit = ({
  fragment,
  orbitRadius = 3,
  orbitSpeed = 0.5
}: FragmentOrbitProps) => {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return

    // Movimento orbital
    const angle = state.clock.elapsedTime * orbitSpeed
    groupRef.current.position.x = Math.cos(angle) * orbitRadius
    groupRef.current.position.z = Math.sin(angle) * orbitRadius
    
    // Rotação própria
    groupRef.current.rotation.y += 0.01
  })

  const renderFragment = () => {
    switch (fragment.type) {
      case 'text':
        return (
          <Text
            fontSize={0.5}
            maxWidth={2}
            lineHeight={1}
            letterSpacing={0.02}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            color="#ffffff"
          >
            {fragment.content}
          </Text>
        )
      
      case 'image':
        return (
          <Box args={[1, 1, 0.1]}>
            <meshStandardMaterial
              color="#ffffff"
              metalness={0.5}
              roughness={0.5}
            />
          </Box>
        )
      
      case 'sound':
        return (
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </Sphere>
        )
      
      case 'ai':
        return (
          <Box args={[0.5, 0.5, 0.5]}>
            <meshStandardMaterial
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.3}
              wireframe
            />
          </Box>
        )
    }
  }

  return (
    <group ref={groupRef} position={fragment.position}>
      {renderFragment()}
    </group>
  )
} 