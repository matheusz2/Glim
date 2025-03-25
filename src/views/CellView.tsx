import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stars } from '@react-three/drei'
import { CellRenderer } from '../components/CellRenderer'
import { useGlimStore } from '../store/useGlimStore'
import { Fragment, Cell, Emotion } from '../types/cell'
import { useEffect } from 'react'

// Célula de exemplo para desenvolvimento
const mockCell = {
  id: '1',
  userId: '1',
  emotion: 'excited' as const,
  intensity: 1,
  color: '#646cff',
  fragments: [
    {
      id: '1',
      type: 'text' as const,
      content: '✨ Primeira memória',
      emotion: 'happy' as const,
      timestamp: new Date(),
      position: [2, 0, 2] as [number, number, number]
    },
    {
      id: '2',
      type: 'sound' as const,
      content: '🎵',
      emotion: 'calm' as const,
      timestamp: new Date(),
      position: [-2, 0, -2] as [number, number, number]
    }
  ],
  glows: [],
  position: [0, 0, 0] as [number, number, number],
  scale: [1, 1, 1] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  lastUpdate: new Date()
}

export const CellView = () => {
  const { currentCell, setCurrentCell } = useGlimStore()

  // Inicializar a célula apenas uma vez quando o componente montar
  useEffect(() => {
    if (!currentCell) {
      setCurrentCell(mockCell)
    }
  }, []) // Dependência vazia para executar apenas uma vez

  const handleEmotionChange = (emotion: Emotion) => {
    if (currentCell) {
      setCurrentCell({
        ...currentCell,
        emotion,
        lastUpdate: new Date()
      })
    }
  }

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 8] }}>
        {/* Ambiente e Iluminação */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        
        {/* Célula Principal */}
        {currentCell ? (
          <CellRenderer 
            cell={currentCell}
            isInteractive={true}
          />
        ) : null}
        
        {/* Controles e Ambiente */}
        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={20}
          enableDamping
          dampingFactor={0.05}
        />
        <Environment preset="night" />
      </Canvas>

      {/* Interface de Controle */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-4">
        <button
          className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-full text-white"
          onClick={() => handleEmotionChange('happy')}
        >
          😊 Feliz
        </button>
        <button
          className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-full text-white"
          onClick={() => handleEmotionChange('excited')}
        >
          ✨ Empolgado
        </button>
        <button
          className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-full text-white"
          onClick={() => handleEmotionChange('calm')}
        >
          😌 Calmo
        </button>
      </div>
    </div>
  )
} 