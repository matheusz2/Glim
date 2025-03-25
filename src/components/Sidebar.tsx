import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-surface-light/50 backdrop-blur-md border-r border-white/10">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 hover-scale">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <span className="text-2xl font-bold text-gradient">GLIM</span>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        <Link
          to="/"
          className={`menu-item ${isActive('/') ? 'active' : ''}`}
        >
          <span className="text-xl">🏠</span>
          <span className="font-medium">Início</span>
        </Link>

        <Link
          to="/vista"
          className={`menu-item ${isActive('/vista') ? 'active' : ''}`}
        >
          <span className="text-xl">🌌</span>
          <span className="font-medium">Vista</span>
        </Link>

        <Link
          to="/profile"
          className={`menu-item ${isActive('/profile') ? 'active' : ''}`}
        >
          <span className="text-xl">👤</span>
          <span className="font-medium">Perfil</span>
        </Link>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="card-glass p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-lg">👋</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.displayName}</p>
              <p className="text-xs text-white/60">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 