import { api } from './api'
import { Cell, Glow } from '../types/api'

export const cellService = {
  async createInitialCell(): Promise<Cell> {
    const response = await api.post<Cell>('/cells/initial')
    return response.data
  },

  async getUserCells(): Promise<Cell[]> {
    const response = await api.get<Cell[]>('/cells/user')
    return response.data
  },

  async getNearbyCells(x: number, y: number, z: number): Promise<Cell[]> {
    const response = await api.get<Cell[]>('/cells/nearby', {
      params: { x, y, z }
    })
    return response.data
  },

  async updateCell(cellId: string, updates: Partial<Cell>): Promise<Cell> {
    const response = await api.put<Cell>(`/cells/${cellId}`, updates)
    return response.data
  },

  async sendGlow(cellId: string, emotion: string, intensity: number): Promise<void> {
    await api.post(`/cells/glow`, {
      cellId,
      emotion,
      intensity
    })
  }
} 