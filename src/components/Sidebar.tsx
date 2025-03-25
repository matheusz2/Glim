import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)]">
      <nav className="mt-5 px-2">
        <Link
          to="/"
          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
            isActive('/')
              ? 'bg-primary-100 text-primary-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          Início
        </Link>

        <Link
          to="/vista"
          className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${
            isActive('/vista')
              ? 'bg-primary-100 text-primary-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          Vista
        </Link>

        <Link
          to="/profile"
          className={`mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md ${
            isActive('/profile')
              ? 'bg-primary-100 text-primary-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          Perfil
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar; 