import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Vista from './pages/Vista'
import Profile from './pages/Profile'
import CellEnvironment from './pages/CellEnvironment'

const CellEnvironmentRoute = () => {
  const { cellId } = useParams<{ cellId: string }>()
  const navigate = useNavigate()

  if (!cellId) {
    navigate('/')
    return null
  }

  return <CellEnvironment cellId={cellId} onClose={() => navigate('/vista')} />
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-page text-white">
          <div className="flex">
            {/* Barra lateral de navegação */}
            <nav className="w-64 h-screen bg-card fixed left-0 top-0 p-4 flex flex-col gap-4 border-r border-white/10">
              <Link to="/" className="text-2xl font-bold text-white mb-8">GLIM</Link>
              
              <div className="flex flex-col gap-2">
                <Link 
                  to="/" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors text-white/70 hover:text-white"
                >
                  <span>🏠</span>
                  <span>Início</span>
                </Link>
                <Link 
                  to="/vista" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors text-white/70 hover:text-white"
                >
                  <span>🌌</span>
                  <span>Vista</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-lg transition-colors text-white/70 hover:text-white"
                >
                  <span>👤</span>
                  <span>Perfil</span>
                </Link>
              </div>
            </nav>

            {/* Área de conteúdo principal */}
            <main className="flex-1 ml-64 min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/vista" element={<Vista />} />
                <Route path="/cell/:cellId" element={<CellEnvironmentRoute />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
