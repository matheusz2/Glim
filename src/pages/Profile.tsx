import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface UserProfile {
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
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: user?.displayName || '',
    username: user?.email?.split('@')[0] || '',
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/users/profile', profile);
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err) {
      setError('Erro ao atualizar perfil');
      console.error('Erro ao atualizar perfil:', err);
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
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-8">Seu Perfil</h2>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Perfil */}
          <div className="bg-surface shadow-lg rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">Informações Pessoais</h3>
            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-white/70">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-input border-white/10 text-white placeholder-white/50 focus:border-white/20 focus:ring-0"
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
                    className="mt-1 block w-full rounded-md bg-input border-white/10 text-white placeholder-white/50 focus:border-white/20 focus:ring-0"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-white/70">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="mt-1 block w-full rounded-md bg-input border-white/10 text-white placeholder-white/50 focus:border-white/20 focus:ring-0"
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
                    className="mt-1 block w-full rounded-md bg-input border-white/10 text-white focus:border-white/20 focus:ring-0"
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
            ) : (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Nome</p>
                    <p className="mt-1 text-sm text-white/90">{profile.displayName}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm font-medium text-white hover:text-white/90"
                  >
                    Editar
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-white/70">Nome de usuário</p>
                  <p className="mt-1 text-sm text-white/90">@{profile.username}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-white/70">Bio</p>
                  <p className="mt-1 text-sm text-white/90">{profile.bio || 'Nenhuma bio definida'}</p>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-white/70">Visibilidade</p>
                  <p className="mt-1 text-sm text-white/90">
                    {profile.visibility === 'public' ? 'Público' : 'Privado'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preferências */}
          <div className="bg-surface shadow-lg rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-medium text-white mb-4">Preferências</h3>
            <form onSubmit={handlePreferencesSubmit} className="space-y-4">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-white/70">
                  Tema
                </label>
                <select
                  id="theme"
                  value={preferences.theme}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' })}
                  className="mt-1 block w-full rounded-md bg-input border-white/10 text-white focus:border-white/20 focus:ring-0"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </div>

              <div>
                <fieldset>
                  <legend className="text-sm font-medium text-white/70">Notificações</legend>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="email-notifications"
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, email: e.target.checked },
                          })
                        }
                        className="h-4 w-4 text-white border-white/10 rounded bg-input focus:ring-0"
                      />
                      <label htmlFor="email-notifications" className="ml-2 text-sm text-white/70">
                        Email
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="push-notifications"
                        type="checkbox"
                        checked={preferences.notifications.push}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, push: e.target.checked },
                          })
                        }
                        className="h-4 w-4 text-white border-white/10 rounded bg-input focus:ring-0"
                      />
                      <label htmlFor="push-notifications" className="ml-2 text-sm text-white/70">
                        Push
                      </label>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div>
                <fieldset>
                  <legend className="text-sm font-medium text-white/70">Áudio</legend>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="audio-enabled"
                        type="checkbox"
                        checked={preferences.audio.enabled}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            audio: { ...preferences.audio, enabled: e.target.checked },
                          })
                        }
                        className="h-4 w-4 text-white border-white/10 rounded bg-input focus:ring-0"
                      />
                      <label htmlFor="audio-enabled" className="ml-2 text-sm text-white/70">
                        Ativar áudio
                      </label>
                    </div>
                    {preferences.audio.enabled && (
                      <div>
                        <label htmlFor="volume" className="block text-sm text-white/70">
                          Volume
                        </label>
                        <input
                          type="range"
                          id="volume"
                          min="0"
                          max="100"
                          value={preferences.audio.volume}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              audio: { ...preferences.audio, volume: Number(e.target.value) },
                            })
                          }
                          className="mt-1 w-full"
                        />
                      </div>
                    )}
                  </div>
                </fieldset>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Preferências'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 