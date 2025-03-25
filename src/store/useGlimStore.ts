import { create } from 'zustand'
import { Cell, Fragment, Glow, Emotion } from '../types/cell'
import { VistaState, VistaSession, VistaIntensity } from '../types/vista'

interface GlimState {
  // Estado da célula atual
  currentCell: Cell | null
  setCurrentCell: (cell: Cell) => void
  updateEmotion: (emotion: Emotion) => void
  addFragment: (fragment: Fragment) => void
  addGlow: (glow: Glow) => void

  // Estado do VISTA
  vistaState: VistaState
  startVistaSession: (hostCellId: string, intensity: VistaIntensity, duration: number) => void
  endVistaSession: () => void

  // Estado do feed
  nearbyCells: Cell[]
  setNearbyCells: (cells: Cell[]) => void
  updateNearbyCell: (cell: Cell) => void
}

export const useGlimStore = create<GlimState>((set) => ({
  // Estado inicial da célula atual
  currentCell: null,
  setCurrentCell: (cell) => set({ currentCell: cell }),
  updateEmotion: (emotion) => 
    set((state) => ({
      currentCell: state.currentCell 
        ? { ...state.currentCell, emotion, lastUpdate: new Date() }
        : null
    })),
  addFragment: (fragment) =>
    set((state) => ({
      currentCell: state.currentCell
        ? { 
            ...state.currentCell, 
            fragments: [...state.currentCell.fragments, fragment],
            lastUpdate: new Date()
          }
        : null
    })),
  addGlow: (glow) =>
    set((state) => ({
      currentCell: state.currentCell
        ? {
            ...state.currentCell,
            glows: [...state.currentCell.glows, glow],
            lastUpdate: new Date()
          }
        : null
    })),

  // Estado inicial do VISTA
  vistaState: {
    isActive: false,
    sponsoredContentQueue: []
  },
  startVistaSession: (hostCellId, intensity, duration) =>
    set((state) => ({
      vistaState: {
        ...state.vistaState,
        isActive: true,
        session: {
          id: Math.random().toString(36).substr(2, 9),
          hostCellId,
          visitorCellId: state.currentCell?.id || '',
          intensity,
          startTime: new Date(),
          duration
        }
      }
    })),
  endVistaSession: () =>
    set((state) => ({
      vistaState: {
        ...state.vistaState,
        isActive: false,
        session: undefined,
        hostCell: undefined
      }
    })),

  // Estado inicial do feed
  nearbyCells: [],
  setNearbyCells: (cells) => set({ nearbyCells: cells }),
  updateNearbyCell: (updatedCell) =>
    set((state) => ({
      nearbyCells: state.nearbyCells.map(cell =>
        cell.id === updatedCell.id ? updatedCell : cell
      )
    }))
})) 