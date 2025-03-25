import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stars } from '@react-three/drei'
import { CellRenderer } from '../components/CellRenderer'
import { CellAudio } from '../components/CellAudio'
import { SpotifyPreview } from '../components/SpotifyPreview'
import { useGlimStore } from '../store/useGlimStore'
import { Fragment, Cell, Emotion, GlowType, SpotifyInfo } from '../types/cell'
import { useEffect, useState } from 'react'

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
  lastUpdate: new Date(),
  audio: {
    isEnabled: true,
    volume: 0.5
  }
}

const glowEmojis = {
  curiosity: '💠',
  impact: '🔥',
  empathy: '🌫',
  connection: '✨'
}

export const CellView = () => {
  const { currentCell, setCurrentCell } = useGlimStore()
  const [isAudioActive, setIsAudioActive] = useState(true)
  const [spotifyUrl, setSpotifyUrl] = useState('')

  // Inicializar a célula apenas uma vez quando o componente montar
  useEffect(() => {
    if (!currentCell) {
      setCurrentCell(mockCell)
    }
  }, [])

  const handleEmotionChange = (emotion: Emotion) => {
    if (currentCell) {
      setCurrentCell({
        ...currentCell,
        emotion,
        lastUpdate: new Date()
      })
    }
  }

  const handleGlow = (type: GlowType) => {
    if (currentCell) {
      const newGlow = {
        type,
        intensity: 1,
        timestamp: new Date(),
        fromCellId: 'visitor'
      }

      setCurrentCell({
        ...currentCell,
        glows: [...currentCell.glows, newGlow]
      })

      setTimeout(() => {
        if (currentCell) {
          setCurrentCell({
            ...currentCell,
            glows: currentCell.glows.filter(g => g !== newGlow)
          })
        }
      }, 3000)
    }
  }

  const toggleAudio = () => {
    setIsAudioActive(!isAudioActive)
    if (currentCell) {
      setCurrentCell({
        ...currentCell,
        audio: {
          ...currentCell.audio,
          isEnabled: !isAudioActive
        }
      })
    }
  }

  const handleSpotifyUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpotifyUrl(e.target.value)
  }

  const handleSpotifyPreviewFound = (previewUrl: string | null) => {
    if (currentCell && previewUrl) {
      setCurrentCell({
        ...currentCell,
        audio: {
          ...currentCell.audio,
          isEnabled: currentCell.audio?.isEnabled ?? true,
          spotify: {
            url: spotifyUrl,
            previewUrl
          }
        }
      })
    }
  }

  return (
    <div className="w-full h-screen bg-black">
      {/* Componente de Áudio */}
      {currentCell && (
        <CellAudio
          cell={currentCell}
          isActive={isAudioActive && (currentCell.audio?.isEnabled ?? true)}
          audioUrl={currentCell.audio?.spotify?.previewUrl ?? currentCell.audio?.url}
        />
      )}

      <Canvas camera={{ position: [0, 0, 8] }}>
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
        
        {currentCell ? (
          <CellRenderer 
            cell={currentCell}
            isInteractive={true}
          />
        ) : null}
        
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
      <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center gap-4">
        {/* Controle de Spotify */}
        <div className="flex flex-col items-center gap-2 w-full max-w-md">
          <div className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="Cole o link do Spotify aqui..."
              value={spotifyUrl}
              onChange={handleSpotifyUrlChange}
              className="flex-1 px-4 py-2 bg-secondary/20 rounded-full text-white placeholder-white/50 outline-none focus:bg-secondary/30"
            />
            <button
              className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-full text-white text-xl"
              onClick={toggleAudio}
            >
              {isAudioActive ? '🔊' : '🔇'}
            </button>
          </div>
          {spotifyUrl && (
            <SpotifyPreview
              spotifyUrl={spotifyUrl}
              onPreviewUrlFound={handleSpotifyPreviewFound}
            />
          )}
        </div>

        {/* Controles de Emoção */}
        <div className="flex justify-center gap-4">
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

        {/* Controles de Glow */}
        <div className="flex justify-center gap-4">
          {(Object.entries(glowEmojis) as [GlowType, string][]).map(([type, emoji]) => (
            <button
              key={type}
              className="px-4 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-full text-white text-xl"
              onClick={() => handleGlow(type)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 