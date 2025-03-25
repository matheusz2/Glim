import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">GLIM</span>
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Perfil
                </Link>
                <button
                  onClick={logout}
                  className="ml-4 text-gray-700 hover:text-primary-600 px-3 py-2"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="ml-4 bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 