export type Emotion = 'happy' | 'sad' | 'angry' | 'calm' | 'excited' | 'neutral'

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
  timestamp: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
}

export interface Glow {
  type: GlowType
  intensity: number
  timestamp: string
  fromCellId: string
}

export interface Object3D {
  id: string
  type: 'cube' | 'sphere' | 'cylinder' | 'tv'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  youtubeUrl?: string
}

export interface Cell {
  id: string
  userId: string
  emotion: Emotion
  intensity: number
  color: string
  position: [number, number, number]
  scale: [number, number, number]
  rotation: [number, number, number]
  audio: AudioConfig
  fragments: Fragment[]
  objects: Object3D[]
  glows: Glow[]
  youtubeVideo?: string
  lastUpdate: string
} 