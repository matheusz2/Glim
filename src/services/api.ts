import axios from 'axios';
import { Cell, Glow, VistaSession } from '../types/api';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@Glim:token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Enviando requisição:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Erro na requisição:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Resposta recebida:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Erro na resposta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Personaliza a mensagem de erro baseado no status
    if (error.response?.status === 400) {
      error.message = error.response.data.error || 'Dados inválidos';
    } else if (error.response?.status === 401) {
      error.message = error.response.data.error || 'Não autorizado';
    } else if (error.response?.status === 404) {
      error.message = error.response.data.error || 'Recurso não encontrado';
    } else if (!error.response) {
      error.message = 'Erro ao conectar com o servidor';
    }

    return Promise.reject(error);
  }
);

export const cellService = {
  getNearbyCells: async (x: number, y: number, z: number, radius?: number): Promise<Cell[]> => {
    const response = await api.get<Cell[]>('/cells/nearby', {
      params: { x, y, z, radius }
    });
    return response.data;
  },

  sendGlow: async (cellId: string, emotion: string, intensity: number): Promise<Glow> => {
    const response = await api.post<Glow>('/cells/glow', {
      cellId,
      emotion,
      intensity
    });
    return response.data;
  },

  startVistaSession: async (): Promise<VistaSession> => {
    const response = await api.post<VistaSession>('/cells/vista/start');
    return response.data;
  }
};

export default api; 