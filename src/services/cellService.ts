import { api } from './api'
import { ApiCell } from '../types/api'
import { Cell, Object3D, Emotion } from '../types/cell'

const mapApiCellToCell = (apiCell: ApiCell): Cell => {
  // Tratamento seguro da data
  let lastUpdate: string;
  try {
    const date = new Date(apiCell.updatedAt.seconds * 1000);
    if (isNaN(date.getTime())) {
      lastUpdate = new Date().toISOString();
    } else {
      lastUpdate = date.toISOString();
    }
  } catch (error) {
    lastUpdate = new Date().toISOString();
  }

  // Mapeamento dos objetos 3D
  const objects: Object3D[] = apiCell.objects?.map(obj => ({
    id: obj.id,
    type: obj.type as 'cube' | 'sphere' | 'cylinder',
    position: obj.position,
    rotation: obj.rotation,
    scale: obj.scale,
    color: obj.color
  })) || [];

  return {
    id: apiCell.id,
    userId: apiCell.userId,
    emotion: apiCell.emotion as Emotion,
    intensity: apiCell.intensity,
    color: apiCell.color || '#646cff',
    position: [apiCell.position.x, apiCell.position.y, apiCell.position.z],
    scale: [apiCell.scale?.x || 1, apiCell.scale?.y || 1, apiCell.scale?.z || 1],
    rotation: [apiCell.rotation?.x || 0, apiCell.rotation?.y || 0, apiCell.rotation?.z || 0],
    lastUpdate,
    audio: {
      isEnabled: true,
      volume: 0.5
    },
    fragments: [],
    objects
  };
}

export const cellService = {
  async createInitialCell(): Promise<Cell> {
    const response = await api.post<ApiCell>('/cells/initial')
    return mapApiCellToCell(response.data)
  },

  async getUserCells(): Promise<Cell[]> {
    const response = await api.get<ApiCell[]>('/cells/user')
    return response.data.map(mapApiCellToCell)
  },

  async getNearbyCells(x: number, y: number, z: number): Promise<Cell[]> {
    const response = await api.get<ApiCell[]>('/cells/nearby', {
      params: { x, y, z }
    })
    return response.data.map(mapApiCellToCell)
  },

  async updateCell(cellId: string, updates: Partial<Cell>): Promise<Cell> {
    // Converter os objetos para o formato esperado pelo Firebase
    const firebaseUpdates = {
      ...updates,
      objects: updates.objects?.map(obj => ({
        id: obj.id,
        type: obj.type,
        position: obj.position,
        rotation: obj.rotation,
        scale: obj.scale,
        color: obj.color
      }))
    }
    const response = await api.put<ApiCell>(`/cells/${cellId}`, firebaseUpdates)
    return mapApiCellToCell(response.data)
  },

  async sendGlow(cellId: string, emotion: string, intensity: number): Promise<void> {
    await api.post(`/cells/glow`, {
      cellId,
      emotion,
      intensity
    })
  }
} 