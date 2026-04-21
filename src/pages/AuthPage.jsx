import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './AuthPage.css'

const TABS = ['Ingresar', 'Registrarse']

export default function AuthPage() {
  const [tab, setTab] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (tab === 0) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name } }
        })
        if (error) throw error
        setMessage('¡Revisa tu correo para confirmar tu cuenta!')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card glass">
        <div className="auth-logo">
          <span className="auth-logo-icon">🏘️</span>
          <h1 className="auth-logo-title">Hola Vecinos</h1>
          <p className="auth-logo-sub">Tu marketplace de barrio</p>
        </div>

        <div className="auth-tabs" role="tablist">
          {TABS.map((t, i) => (
            <button
              key={t}
              role="tab"
              id={`tab-${i}`}
              aria-selected={tab === i}
              className={`auth-tab ${tab === i ? 'active' : ''}`}
              onClick={() => { setTab(i); setError(''); setMessage('') }}
            >{t}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {tab === 1 && (
            <div className="field">
              <label htmlFor="auth-name">Nombre</label>
              <input id="auth-name" type="text" placeholder="Tu nombre" value={name}
                onChange={e => setName(e.target.value)} required />
            </div>
          )}

          <div className="field">
            <label htmlFor="auth-email">Correo electrónico</label>
            <input id="auth-email" type="email" placeholder="tu@correo.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="auth-pass">Contraseña</label>
            <input id="auth-pass" type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>

          {error   && <p className="error-msg" role="alert">⚠️ {error}</p>}
          {message && <p className="success-msg" role="status">✅ {message}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : TABS[tab]}
          </button>
        </form>

        <div className="auth-divider"><span>o continúa con</span></div>

        <button id="btn-google-auth" className="btn btn-ghost btn-full auth-google" onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.4 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.7 18.9 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.8-1.9 13.4-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.1 0-9.5-2.6-11.3-7l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.5-2.6 4.7-5 6.1l6.2 5.2C40.1 36.2 44 30.6 44 24c0-1.3-.2-2.7-.4-4z"/>
          </svg>
          Google
        </button>
      </div>
    </div>
  )
}
