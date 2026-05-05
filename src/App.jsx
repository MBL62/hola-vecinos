import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotifProvider } from './context/NotifContext'
import BottomNav from './components/BottomNav'
import AdBanner from './components/AdBanner'
import AuthPage from './pages/AuthPage'
import MapPage from './pages/MapPage'
import ListPage from './pages/ListPage'
import ChatPage from './pages/ChatPage'
import ChatsListPage from './pages/ChatsListPage'
import ProfilePage from './pages/ProfilePage'
import LandingPage from './pages/LandingPage'

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </div>
      <BottomNav />
      <AdBanner />
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  const location = useLocation()
  const [userLocation, setUserLocation] = useState(null)

  // Cargando sesión
  if (user === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  const notifWrapper = (children) =>
    user ? <NotifProvider user={user}>{children}</NotifProvider> : children

  return notifWrapper(
    <Routes location={location}>
      {/* Pública: landing para visitantes, mapa para usuarios logueados */}
      <Route path="/" element={
        user
          ? <AppLayout><MapPage userLocation={userLocation} onLocated={setUserLocation} /></AppLayout>
          : <LandingPage />
      } />

      {/* Mapa y lista son públicos (modo visitante) */}
      <Route path="/map" element={
        <AppLayout>
          <MapPage userLocation={userLocation} onLocated={setUserLocation} />
        </AppLayout>
      } />
      <Route path="/list" element={
        <AppLayout>
          <ListPage userLocation={userLocation} />
        </AppLayout>
      } />

      {/* Auth */}
      <Route path="/auth" element={
        user ? <Navigate to="/" replace /> : <AuthPage />
      } />

      {/* Rutas privadas */}
      <Route path="/chats" element={
        user
          ? <AppLayout><ChatsListPage /></AppLayout>
          : <Navigate to="/auth" replace />
      } />
      <Route path="/chat/:postId/:userId" element={
        user ? <ChatPage /> : <Navigate to="/auth" replace />
      } />
      <Route path="/profile" element={
        user
          ? <AppLayout><ProfilePage /></AppLayout>
          : <Navigate to="/auth" replace />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  )
}
