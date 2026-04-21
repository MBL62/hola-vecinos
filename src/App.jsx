import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotifProvider, useNotif } from './context/NotifContext'
import BottomNav from './components/BottomNav'
import AdBanner from './components/AdBanner'
import AuthPage from './pages/AuthPage'
import MapPage from './pages/MapPage'
import ListPage from './pages/ListPage'
import ChatPage from './pages/ChatPage'
import ChatsListPage from './pages/ChatsListPage'
import ProfilePage from './pages/ProfilePage'

function AppLayout({ children }) {
  const { clearUnread } = useNotif()
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

function PrivateRoutes() {
  const { user } = useAuth()
  const [userLocation, setUserLocation] = useState(null)

  if (user === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    )
  }
  if (!user) return <Navigate to="/auth" replace />

  return (
    <NotifProvider user={user}>
      <Routes>
        {/* Rutas con nav inferior */}
        <Route path="/" element={
          <AppLayout>
            <MapPage userLocation={userLocation} onLocated={setUserLocation} />
          </AppLayout>
        } />
        <Route path="/list" element={
          <AppLayout>
            <ListPage userLocation={userLocation} />
          </AppLayout>
        } />
        <Route path="/chats" element={
          <AppLayout>
            <ChatsListPage />
          </AppLayout>
        } />
        <Route path="/profile" element={
          <AppLayout>
            <ProfilePage />
          </AppLayout>
        } />

        {/* Chat individual — sin nav inferior para enfoque */}
        <Route path="/chat/:postId/:userId" element={<ChatPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotifProvider>
  )
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/*" element={<PrivateRoutes />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

