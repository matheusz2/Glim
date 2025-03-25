export type Emotion = 'happy' | 'excited' | 'calm'

export type FragmentType = 'text' | 'sound' | 'image' | 'video'

export type GlowType = 'curiosity' | 'impact' | 'empathy' | 'connection'

export interface SpotifyInfo {
  url: string
  previewUrl?: string
  trackName?: string
  artistName?: string
  albumArt?: string
}

export interface AudioConfig {
  url?: string
  volume?: number
  isEnabled: boolean
  spotify?: SpotifyInfo
}

export interface Fragment {
  id: string
  type: FragmentType
  content: string
  emotion: Emotion
  timestamp: Date
  position: [number, number, number]
}

export interface Glow {
  type: GlowType
  intensity: number
  timestamp: Date
  fromCellId: string
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
  audio?: AudioConfig
} 