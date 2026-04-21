import { NavLink } from 'react-router-dom'
import './BottomNav.css'

const TABS = [
  { to: '/',        icon: '🗺️', label: 'Mapa'   },
  { to: '/list',    icon: '☰',  label: 'Ofertas' },
  { to: '/chats',   icon: '💬', label: 'Chats'   },
  { to: '/profile', icon: '👤', label: 'Perfil'  },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav glass" aria-label="Navegación principal">
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          id={`nav-${tab.label.toLowerCase()}`}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
