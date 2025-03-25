import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Cell } from '../types/api';
import { cellService } from '../services/cellService';

const Home = () => {
  const { user } = useAuth();
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCells = async () => {
      try {
        // Busca as células do usuário
        const userCells = await cellService.getUserCells();
        setCells(userCells);
      } catch (err) {
        setError('Erro ao carregar células');
        console.error('Erro ao carregar células:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCells();
    } else {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white">Suas Células</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cells.map((cell) => (
            <div key={cell.id} className="bg-card overflow-hidden shadow-lg rounded-lg border border-white/10">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div
                    className="h-12 w-12 rounded-full"
                    style={{ backgroundColor: getEmotionColor(cell.emotion) }}
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">
                      {cell.emotion}
                    </h3>
                    <p className="text-sm text-white/70">
                      Intensidade: {cell.intensity}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/vista?cellId=${cell.id}`}
                    className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    Visualizar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getEmotionColor = (emotion: string): string => {
  const colors: { [key: string]: string } = {
    alegria: '#FCD34D',
    tristeza: '#60A5FA',
    raiva: '#F87171',
    medo: '#A78BFA',
    surpresa: '#34D399',
    nojo: '#FBBF24',
    amor: '#F472B6',
    paz: '#9CA3AF'
  };
  return colors[emotion.toLowerCase()] || '#9CA3AF';
};

export default Home; 