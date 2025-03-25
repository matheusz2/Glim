import { Routes, Route, useParams, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Vista from './pages/Vista'
import CellEnvironment from './pages/CellEnvironment'
import PrivateRoute from './components/PrivateRoute'

const CellEnvironmentRoute = () => {
  const { cellId } = useParams<{ cellId: string }>()
  const navigate = useNavigate()

  if (!cellId) {
    navigate('/')
    return null
  }

  return <CellEnvironment cellId={cellId} onClose={() => navigate('/vista')} />
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/vista"
          element={
            <PrivateRoute>
              <Vista />
            </PrivateRoute>
          }
        />
        <Route
          path="/cell/:cellId"
          element={
            <PrivateRoute>
              <CellEnvironmentRoute />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  )
}

export default AppRoutes 