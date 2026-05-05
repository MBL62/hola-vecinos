import { useNavigate } from 'react-router-dom'
import './LoginPromptModal.css'

export default function LoginPromptModal({ onClose, action = 'continuar' }) {
  const navigate = useNavigate()

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal login-prompt-modal" role="dialog" aria-modal="true">
        <div className="login-prompt-icon">🏘️</div>
        <h2 className="login-prompt-title">¡Únete a Hola Vecinos!</h2>
        <p className="login-prompt-text">
          Necesitas una cuenta para <strong>{action}</strong>.<br />
          Es gratis y solo toma un minuto.
        </p>
        <div className="login-prompt-actions">
          <button
            id="btn-prompt-login"
            className="btn btn-primary btn-full"
            onClick={() => navigate('/auth?mode=login')}
          >
            Iniciar sesión
          </button>
          <button
            id="btn-prompt-register"
            className="btn btn-ghost btn-full"
            onClick={() => navigate('/auth?mode=register')}
          >
            Crear cuenta gratis
          </button>
          <button className="btn-prompt-skip" onClick={onClose}>
            Seguir explorando →
          </button>
        </div>
      </div>
    </div>
  )
}
