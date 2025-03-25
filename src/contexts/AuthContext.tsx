import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { AuthResponse, User } from '../types/api';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@Glim:token');
    const storedUser = localStorage.getItem('@Glim:user');

    if (token && storedUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentando fazer login com:', { email });
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password
      });

      console.log('Resposta do login:', response.data);

      const { token, user } = response.data;

      localStorage.setItem('@Glim:token', token);
      localStorage.setItem('@Glim:user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } catch (err: any) {
      console.error('Erro detalhado no login:', err);
      if (err.response) {
        console.error('Dados do erro:', err.response.data);
        throw new Error(err.response.data.error || 'Erro ao fazer login');
      }
      throw new Error('Erro ao conectar com o servidor');
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      console.log('Enviando requisição de registro:', { email, displayName });
      const response = await api.post<AuthResponse>('/auth/register', {
        email,
        password,
        displayName
      });

      console.log('Resposta do registro:', response.data);

      const { token, user } = response.data;

      localStorage.setItem('@Glim:token', token);
      localStorage.setItem('@Glim:user', JSON.stringify(user));

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
    } catch (err: any) {
      console.error('Erro detalhado no registro:', err);
      if (err.response) {
        console.error('Dados do erro:', err.response.data);
        throw new Error(err.response.data.error || 'Erro ao criar conta');
      }
      throw new Error('Erro ao conectar com o servidor');
    }
  };

  const signOut = () => {
    localStorage.removeItem('@Glim:token');
    localStorage.removeItem('@Glim:user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthProvider; 