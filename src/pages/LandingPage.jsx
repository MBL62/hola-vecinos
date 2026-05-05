import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

const FEATURES = [
  { emoji: '📍', title: 'Cerca tuyo', desc: 'Filtra por radio GPS: ve solo lo que está a 500m, 1km o 5km de tu casa.' },
  { emoji: '💬', title: 'Chat directo', desc: 'Habla directamente con tu vecino sin intermediarios.' },
  { emoji: '🎁', title: 'Regala y recibe', desc: 'Publica cosas que ya no usas o encuentra regalos de vecinos.' },
  { emoji: '🔄', title: 'Trueque local', desc: 'Intercambia productos y servicios sin usar dinero.' },
]

const SUBCATEGORIES = [
  { emoji: '📱', label: 'Electrónicos' },
  { emoji: '🏠', label: 'Hogar y Muebles' },
  { emoji: '👕', label: 'Ropa y Calzado' },
  { emoji: '🥦', label: 'Alimentos' },
  { emoji: '🧸', label: 'Juguetes' },
  { emoji: '🔧', label: 'Servicios' },
]

const PROHIBITED = [
  { emoji: '🔫', label: 'Armas y municiones' },
  { emoji: '💊', label: 'Drogas y medicamentos sin receta' },
  { emoji: '🚗', label: 'Vehículos robados o sin documentos' },
  { emoji: '🔞', label: 'Contenido para adultos' },
  { emoji: '🐾', label: 'Animales sin documentos' },
  { emoji: '💰', label: 'Pirámides o esquemas financieros' },
]

const STEPS = [
  { n: '1', emoji: '📸', title: 'Publica', desc: 'Sube una foto y describe lo que vendes, regalas o necesitas.' },
  { n: '2', emoji: '🗺️', title: 'Aparece en el mapa', desc: 'Tu publicación aparece automáticamente en el mapa del barrio.' },
  { n: '3', emoji: '🤝', title: 'Conecta', desc: 'Tu vecino te escribe por el chat y coordinan la entrega.' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing">

      {/* ---- HERO ---- */}
      <header className="landing-hero">
        <div className="landing-hero-bg" aria-hidden="true" />
        <nav className="landing-nav">
          <div className="landing-logo">🏘️ <span>Hola Vecinos</span></div>
          <button
            id="btn-landing-login"
            className="btn btn-ghost landing-nav-btn"
            onClick={() => navigate('/auth')}
          >
            Iniciar sesión
          </button>
        </nav>

        <div className="landing-hero-content">
          <span className="landing-badge">🇨🇱 Marketplace vecinal en Chile</span>
          <h1 className="landing-headline">
            Compra, vende y regala<br />
            <span className="gradient-text">con tus vecinos</span>
          </h1>
          <p className="landing-sub">
            El marketplace de barrio gratuito. Sin intermediarios, sin comisiones.<br />
            Solo tú y tus vecinos más cercanos.
          </p>
          <div className="landing-cta-row">
            <button
              id="btn-landing-register"
              className="btn btn-primary landing-cta-primary"
              onClick={() => navigate('/auth?mode=register')}
            >
              Empieza gratis →
            </button>
            <button
              id="btn-landing-explore"
              className="btn btn-ghost landing-cta-secondary"
              onClick={() => navigate('/?visitor=1')}
            >
              Ver el mapa primero
            </button>
          </div>
          <p className="landing-login-hint">
            ¿Ya tienes cuenta?{' '}
            <button className="link-btn" onClick={() => navigate('/auth?mode=login')}>
              Inicia sesión aquí
            </button>
          </p>
        </div>

        {/* Floating cards decorativas */}
        <div className="landing-floating-cards" aria-hidden="true">
          <div className="floating-card">📱 iPhone 13 — $250.000</div>
          <div className="floating-card">🛋️ Sofá 3 cuerpos — Gratis</div>
          <div className="floating-card">🔧 Plomero disponible hoy</div>
        </div>
      </header>

      {/* ---- AVISO LOGIN ---- */}
      <section className="landing-login-notice">
        <div className="login-notice-inner glass">
          <span className="login-notice-icon">🔐</span>
          <div>
            <strong>Necesitas registrarte para chatear y publicar</strong>
            <p>Puedes ver el mapa libremente, pero para contactar vecinos o publicar, crea tu cuenta gratis.</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/auth?mode=register')}
          >
            Crear cuenta
          </button>
        </div>
      </section>

      {/* ---- CÓMO FUNCIONA ---- */}
      <section className="landing-section" id="como-funciona">
        <h2 className="landing-section-title">¿Cómo funciona?</h2>
        <div className="steps-grid">
          {STEPS.map(s => (
            <div key={s.n} className="step-card glass">
              <div className="step-number">{s.n}</div>
              <div className="step-emoji">{s.emoji}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CARACTERÍSTICAS ---- */}
      <section className="landing-section landing-section-alt">
        <h2 className="landing-section-title">¿Por qué Hola Vecinos?</h2>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card glass">
              <span className="feature-emoji">{f.emoji}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CATEGORÍAS ---- */}
      <section className="landing-section">
        <h2 className="landing-section-title">¿Qué puedes encontrar?</h2>
        <div className="subcats-grid">
          {SUBCATEGORIES.map(s => (
            <div key={s.label} className="subcat-card glass">
              <span className="subcat-emoji">{s.emoji}</span>
              <span className="subcat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- PROHIBIDO ---- */}
      <section className="landing-section landing-section-alt" id="normas">
        <h2 className="landing-section-title">🚫 Qué NO se puede publicar</h2>
        <p className="landing-section-sub">
          Hola Vecinos es una comunidad segura. Las publicaciones que incumplan estas normas serán eliminadas y el usuario podrá ser suspendido.
        </p>
        <div className="prohibited-grid">
          {PROHIBITED.map(p => (
            <div key={p.label} className="prohibited-card">
              <span className="prohibited-emoji">{p.emoji}</span>
              <span className="prohibited-label">{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA FINAL ---- */}
      <section className="landing-final-cta">
        <div className="final-cta-inner">
          <h2 className="final-cta-title">¿Listo para conectar con tu barrio?</h2>
          <p className="final-cta-sub">Regístrate gratis en menos de 1 minuto.</p>
          <button
            id="btn-landing-final-cta"
            className="btn btn-primary landing-cta-primary"
            onClick={() => navigate('/auth?mode=register')}
          >
            Únete ahora →
          </button>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Hola Vecinos · Chile</p>
        <p>
          Contacto:{' '}
          <a href="mailto:mbasoa@mblsol.org">mbasoa@mblsol.org</a>
        </p>
      </footer>
    </div>
  )
}
