import api from './api';
import { UserProfile, UserPreferences, UserStats } from '../types/user';

export const userService = {
  // Perfil
  getProfile: async (userId: string): Promise<UserProfile> => {
    const response = await api.get<UserProfile>(`/users/${userId}/profile`);
    return response.data;
  },

  updateProfile: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<UserProfile>(`/users/${userId}/profile`, data);
    return response.data;
  },

  // Preferências
  getPreferences: async (userId: string): Promise<UserPreferences> => {
    const response = await api.get<UserPreferences>(`/users/${userId}/preferences`);
    return response.data;
  },

  updatePreferences: async (userId: string, data: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await api.put<UserPreferences>(`/users/${userId}/preferences`, data);
    return response.data;
  },

  // Estatísticas
  getStats: async (userId: string): Promise<UserStats> => {
    const response = await api.get<UserStats>(`/users/${userId}/stats`);
    return response.data;
  },

  // Seguir/Deixar de Seguir
  followUser: async (targetUserId: string): Promise<void> => {
    await api.post(`/users/${targetUserId}/follow`);
  },

  unfollowUser: async (targetUserId: string): Promise<void> => {
    await api.delete(`/users/${targetUserId}/follow`);
  },

  // Busca de usuários
  searchUsers: async (query: string): Promise<UserProfile[]> => {
    const response = await api.get<UserProfile[]>('/users/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Feed de usuários
  getFeed: async (userId: string, page: number = 1, limit: number = 20): Promise<UserProfile[]> => {
    const response = await api.get<UserProfile[]>(`/users/${userId}/feed`, {
      params: { page, limit }
    });
    return response.data;
  }
}; 