import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Cell } from '../types/cell';
import { cellService } from '../services/cellService';
import { getEmotionColor } from '../utils/emotions';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userCells, setUserCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserCells = async () => {
      try {
        setLoading(true);
        const cells = await cellService.getUserCells();
        setUserCells(cells);
      } catch (err) {
        console.error('Erro ao carregar células:', err);
        setError('Erro ao carregar suas células');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserCells();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            Bem-vindo ao GLIM
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-white/70 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Uma plataforma para visualizar e interagir com emoções em um espaço 3D virtual.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to="/register"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-white/90 md:py-4 md:text-lg md:px-10"
              >
                Começar
              </Link>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link
                to="/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 md:py-4 md:text-lg md:px-10"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Glim</h1>
          <p className="text-white/70">Explore o universo de células e conecte-se com outros usuários</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-full">
            <h2 className="text-xl font-bold text-white mb-4">Suas Células</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : userCells.length === 0 ? (
              <div className="text-white/70">Você ainda não tem células. Crie uma no Vista!</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userCells.map((cell) => (
                  <div
                    key={cell.id}
                    className="bg-card p-4 rounded-lg hover:bg-card/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/cell/${cell.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Célula {cell.id.slice(0, 6)}</span>
                      <span className="text-white/70 text-sm">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/70">Emoção:</span>
                      <span className="text-white">{cell.emotion}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-white/70">Intensidade:</span>
                      <span className="text-white">{cell.intensity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-full">
            <h2 className="text-xl font-bold text-white mb-4">Células Recentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* ... existing cells grid ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 