import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserPreferences, UserStats } from '../types/user';
import { userService } from '../services/userService';
import { useAuth } from './AuthContext';

interface UserContextData {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextData>({} as UserContextData);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      const [profileData, preferencesData, statsData] = await Promise.all([
        userService.getProfile(user.uid),
        userService.getPreferences(user.uid),
        userService.getStats(user.uid)
      ]);

      setProfile(profileData);
      setPreferences(preferencesData);
      setStats(statsData);
    } catch (err) {
      setError('Erro ao carregar dados do usuário');
      console.error('Erro ao carregar dados do usuário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user?.uid]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.uid) return;

    try {
      setError(null);
      const updatedProfile = await userService.updateProfile(user.uid, data);
      setProfile(updatedProfile);
    } catch (err) {
      setError('Erro ao atualizar perfil');
      console.error('Erro ao atualizar perfil:', err);
      throw err;
    }
  };

  const updatePreferences = async (data: Partial<UserPreferences>) => {
    if (!user?.uid) return;

    try {
      setError(null);
      const updatedPreferences = await userService.updatePreferences(user.uid, data);
      setPreferences(updatedPreferences);
    } catch (err) {
      setError('Erro ao atualizar preferências');
      console.error('Erro ao atualizar preferências:', err);
      throw err;
    }
  };

  const refreshProfile = async () => {
    await loadUserData();
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        preferences,
        stats,
        loading,
        error,
        updateProfile,
        updatePreferences,
        refreshProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve ser usado dentro de um UserProvider');
  }
  return context;
}; 