import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-surface-light/50 backdrop-blur-md border-b border-white/10">
      <div className="container-custom h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 hover-scale">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <span className="text-2xl font-bold text-gradient">GLIM</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="btn btn-glass"
                >
                  <span className="flex items-center gap-2">
                    <span>👤</span>
                    Perfil
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="btn btn-glass"
                >
                  <span className="flex items-center gap-2">
                    <span>👋</span>
                    Sair
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="btn btn-glass"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
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