import { NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useNotif } from '../context/NotifContext'
import './BottomNav.css'

export default function BottomNav() {
  const { unreadCount, clearUnread } = useNotif()
  const location = useLocation()

  // Limpiar badge al entrar a /chats
  useEffect(() => {
    if (location.pathname === '/chats') clearUnread()
  }, [location.pathname, clearUnread])

  return (
    <nav className="bottom-nav glass" aria-label="Navegación principal">
      <NavLink to="/" end className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} id="nav-mapa">
        <span className="bottom-nav-icon">🗺️</span>
        <span className="bottom-nav-label">Mapa</span>
      </NavLink>
      <NavLink to="/list" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} id="nav-ofertas">
        <span className="bottom-nav-icon">☰</span>
        <span className="bottom-nav-label">Ofertas</span>
      </NavLink>
      <NavLink to="/chats" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} id="nav-chats">
        <span className="bottom-nav-icon-wrap">
          <span className="bottom-nav-icon">💬</span>
          {unreadCount > 0 && (
            <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </span>
        <span className="bottom-nav-label">Chats</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} id="nav-perfil">
        <span className="bottom-nav-icon">👤</span>
        <span className="bottom-nav-label">Perfil</span>
      </NavLink>
    </nav>
  )
}

