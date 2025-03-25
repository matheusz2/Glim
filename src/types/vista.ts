import { Cell } from './cell'

export type VistaIntensity = 'light' | 'complete' | 'guided'

export interface VistaSession {
  id: string
  hostCellId: string
  visitorCellId: string
  intensity: VistaIntensity
  startTime: Date
  duration: number // em minutos
  sponsoredContent?: SponsoredContent[]
}

export interface SponsoredContent {
  id: string
  brandId: string
  type: 'fragment' | 'glow' | 'environment'
  content: string
  position: [number, number, number]
  duration: number // em segundos
}

export interface VistaState {
  isActive: boolean
  session?: VistaSession
  hostCell?: Cell
  originalCell?: Cell
  sponsoredContentQueue: SponsoredContent[]
} 