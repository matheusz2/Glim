export type Emotion = 'happy' | 'sad' | 'excited' | 'calm' | 'neutral'

export type GlowType = 'curiosity' | 'impact' | 'empathy' | 'connection'

export interface Glow {
  type: GlowType
  intensity: number
  timestamp: Date
  fromCellId: string
}

export interface Fragment {
  id: string
  type: 'text' | 'sound' | 'image' | 'ai'
  content: string
  emotion: Emotion
  timestamp: Date
  position: [number, number, number] // Posição orbital
}

export interface Cell {
  id: string
  userId: string
  emotion: Emotion
  intensity: number
  color: string
  fragments: Fragment[]
  glows: Glow[]
  position: [number, number, number]
  scale: [number, number, number]
  rotation: [number, number, number]
  lastUpdate: Date
} 