import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface Profile {
  displayName: string;
  username: string;
  bio: string;
  visibility: 'public' | 'private';
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
  };
  audio: {
    enabled: boolean;
    volume: number;
  };
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<Profile>({
    displayName: user?.displayName || '',
    username: '',
    bio: '',
    visibility: 'public'
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    notifications: {
      email: true,
      push: true
    },
    audio: {
      enabled: true,
      volume: 50
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError('');
        const response = await api.get<Profile>(`/users/${user.id}/profile`);
        setProfile(response.data);
      } catch (error: any) {
        console.error('Erro ao carregar perfil:', error);
        setError(error.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await api.put(`/users/${user.id}/profile`, profile);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      setError(error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/users/preferences', preferences);
      setSuccess('Preferências atualizadas com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar preferências');
      console.error('Erro ao atualizar preferências:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container-custom py-6">
        <div className="card-glass p-6">
          <p className="text-white">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-6">
      <div className="card-glass">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Seu Perfil</h1>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {loading ? (
            <div className="text-white text-center py-4">Carregando...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-white/70">
                  Nome
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-surface-light/50 border-white/10 text-white focus:border-white/20 focus:ring-0 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white/70">
                  Nome de usuário
                </label>
                <input
                  type="text"
                  id="username"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-surface-light/50 border-white/10 text-white focus:border-white/20 focus:ring-0 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-white/70">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="mt-1 block w-full rounded-md bg-surface-light/50 border-white/10 text-white focus:border-white/20 focus:ring-0 px-3 py-2"
                />
              </div>

              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-white/70">
                  Visibilidade
                </label>
                <select
                  id="visibility"
                  value={profile.visibility}
                  onChange={(e) => setProfile({ ...profile, visibility: e.target.value as 'public' | 'private' })}
                  className="mt-1 block w-full rounded-md bg-surface-light/50 border-white/10 text-white focus:border-white/20 focus:ring-0 px-3 py-2"
                >
                  <option value="public">Público</option>
                  <option value="private">Privado</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 