import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AppRoutes from './routes'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-page text-white">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
