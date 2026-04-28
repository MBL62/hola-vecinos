import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingSave, setLoadingSave] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)
  const [msgProfile, setMsgProfile] = useState('')
  const [msgPass, setMsgPass] = useState('')
  const [errProfile, setErrProfile] = useState('')
  const [errPass, setErrPass] = useState('')
  const [myPosts, setMyPosts] = useState([])
  const [isStore, setIsStore] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const [showTyC, setShowTyC] = useState(false)
  const [loadingResend, setLoadingResend] = useState(false)
  const [msgResend, setMsgResend] = useState('')
  const [errResend, setErrResend] = useState('')

  const emailVerified = !!user?.email_confirmed_at

  async function handleResendConfirmation() {
    setMsgResend('')
    setErrResend('')
    setLoadingResend(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
    })
    setLoadingResend(false)
    if (error) setErrResend('No se pudo enviar: ' + error.message)
    else setMsgResend('✅ Correo enviado a ' + user.email + '. Revisa tu bandeja de entrada.')
  }

  useEffect(() => {
    if (user) { fetchProfile(); fetchMyPosts() }
  }, [user])

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setDisplayName(data.display_name || '')
      setIsStore(data.is_store ?? false)
      setIsOpen(data.is_open ?? true)
    }
  }

  async function fetchMyPosts() {
    const { data } = await supabase
      .from('posts').select('*').eq('user_id', user.id)
      .gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false })
    setMyPosts(data || [])
  }

  async function handleSaveName(e) {
    e.preventDefault()
    setErrProfile(''); setMsgProfile('')
    if (!displayName.trim()) { setErrProfile('El nombre no puede estar vacío.'); return }
    setLoadingSave(true)
    const { error } = await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', user.id)
    setLoadingSave(false)
    if (error) setErrProfile(error.message)
    else setMsgProfile('✅ Nombre actualizado.')
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setErrPass(''); setMsgPass('')
    if (!currentPassword) { setErrPass('Debes ingresar tu contraseña actual.'); return }
    if (newPassword.length < 6) { setErrPass('La nueva contraseña debe tener al menos 6 caracteres.'); return }
    if (newPassword !== confirmPassword) { setErrPass('Las contraseñas nuevas no coinciden.'); return }

    setLoadingPass(true)
    // Verificar contraseña actual re-autenticando
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (verifyErr) {
      setLoadingPass(false)
      setErrPass('La contraseña actual es incorrecta.')
      return
    }
    // Cambiar la contraseña
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
    setLoadingPass(false)
    if (updateErr) setErrPass(updateErr.message)
    else {
      setMsgPass('✅ Contraseña actualizada correctamente.')
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    }
  }

  async function handleDeletePost(postId) {
    if (!window.confirm('¿Eliminar esta publicación?')) return
    await supabase.from('posts').delete().eq('id', postId)
    fetchMyPosts()
  }

  async function handleDelivered(postId) {
    if (!window.confirm('¿Marcar como entregado? El post se cerrará. ¡Felicitaciones por el intercambio! 🎉')) return
    await supabase.from('posts').delete().eq('id', postId)
    fetchMyPosts()
  }

  async function handleToggleStore(field, value) {
    if (field === 'is_store') setIsStore(value)
    if (field === 'is_open')  setIsOpen(value)
    await supabase.from('profiles').update({ [field]: value }).eq('id', user.id)
  }

  const CAT_EMOJI = { producto: '📦', servicio: '🔧', regalo: '🎁', trueque: '🔄' }

  return (
    <div className="profile-page">
      {/* Header fijo */}
      <header className="profile-header glass">
        <div className="profile-avatar-big">{(displayName || 'V')[0].toUpperCase()}</div>
        <div>
          <h1 className="profile-name">{displayName || 'Mi perfil'}</h1>
          <p className="profile-email">{user?.email}</p>
        </div>
      </header>

      {/* Área scrollable */}
      <div className="profile-body">

        {/* Verificación de email */}
        <section className="profile-section">
          <h2 className="section-title">✉️ Correo electrónico</h2>
          <p className="section-hint">{user?.email}</p>
          <div className={`email-status ${emailVerified ? 'verified' : 'unverified'}`}>
            {emailVerified
              ? '✅ Correo verificado'
              : '⚠️ Correo no verificado — revisa tu bandeja de entrada'}
          </div>
          {errResend && <p className="error-msg">{errResend}</p>}
          {msgResend && <p className="success-msg">{msgResend}</p>}
          <button
            id="btn-resend-confirmation"
            className="btn btn-ghost btn-full"
            onClick={handleResendConfirmation}
            disabled={loadingResend}
          >
            {loadingResend ? <span className="spinner" /> : '📨 Reenviar correo de confirmación'}
          </button>
        </section>

        {/* Nombre público */}
        <section className="profile-section">
          <h2 className="section-title">👤 Nombre público</h2>
          <p className="section-hint">Este es el nombre que verán otros vecinos en el chat.</p>
          <form onSubmit={handleSaveName} className="profile-form">
            <div className="field">
              <label htmlFor="profile-name-input">Nombre de usuario</label>
              <input
                id="profile-name-input"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Tu nombre público"
                maxLength={50}
              />
            </div>
            {errProfile && <p className="error-msg">{errProfile}</p>}
            {msgProfile && <p className="success-msg">{msgProfile}</p>}
            <button id="btn-save-name" type="submit" className="btn btn-primary" disabled={loadingSave}>
              {loadingSave ? <span className="spinner" /> : 'Guardar nombre'}
            </button>
          </form>
        </section>

        {/* Cambiar contraseña */}
        <section className="profile-section">
          <h2 className="section-title">🔑 Cambiar contraseña</h2>
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="field">
              <label htmlFor="current-pass">Contraseña actual</label>
              <input
                id="current-pass"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Tu contraseña actual"
              />
            </div>
            <div className="field">
              <label htmlFor="new-pass">Nueva contraseña</label>
              <input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
            <div className="field">
              <label htmlFor="confirm-pass">Confirmar nueva contraseña</label>
              <input
                id="confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
              />
            </div>
            {errPass && <p className="error-msg">{errPass}</p>}
            {msgPass && <p className="success-msg">{msgPass}</p>}
            <button id="btn-change-pass" type="submit" className="btn btn-primary" disabled={loadingPass}>
              {loadingPass ? <span className="spinner" /> : 'Cambiar contraseña'}
            </button>
          </form>
        </section>

        {/* Mis publicaciones */}
        <section className="profile-section">
          <h2 className="section-title">📋 Mis publicaciones</h2>
          <p className="section-hint">Tienes {myPosts.length}/2 publicaciones activas.</p>
          {myPosts.length === 0 && <p className="profile-empty">No tienes publicaciones activas.</p>}
          {myPosts.map(post => {
            const hoursLeft = Math.max(0, Math.round((new Date(post.expires_at) - Date.now()) / 3600000))
            return (
              <div key={post.id} className="my-post-item">
                <span className="my-post-emoji">{CAT_EMOJI[post.category]}</span>
                <div className="my-post-info">
                  <span className="my-post-title">{post.title}</span>
                  <span className="my-post-meta">⏱ {hoursLeft}h restantes</span>
                </div>
                <div className="my-post-actions">
                  <button
                    id={`btn-delivered-${post.id}`}
                    className="btn btn-success btn-post-action"
                    onClick={() => handleDelivered(post.id)}
                    aria-label="Entrega realizada"
                    title="Entrega realizada"
                  >✅</button>
                  <button
                    id={`btn-del-${post.id}`}
                    className="btn btn-danger btn-post-action"
                    onClick={() => handleDeletePost(post.id)}
                    aria-label="Eliminar"
                    title="Eliminar"
                  >🗑️</button>
                </div>
              </div>
            )
          })}
        </section>

        {/* Estado de tienda */}
        <section className="profile-section">
          <h2 className="section-title">🏪 Estado de tienda</h2>
          <p className="section-hint">Activa si eres un negocio local o tienda vecinal.</p>
          <label className="store-toggle-row">
            <span>Soy una tienda / negocio</span>
            <input id="toggle-is-store" type="checkbox" checked={isStore}
              onChange={e => handleToggleStore('is_store', e.target.checked)} />
          </label>
          {isStore && (
            <label className="store-toggle-row open">
              <span>{isOpen ? '🟢 Actualmente abierto' : '🔴 Actualmente cerrado'}</span>
              <input id="toggle-is-open" type="checkbox" checked={isOpen}
                onChange={e => handleToggleStore('is_open', e.target.checked)} />
            </label>
          )}
        </section>

        {/* Términos y Condiciones */}
        <section className="profile-section">
          <h2 className="section-title">📄 Términos y Condiciones</h2>
          <p className="section-hint">Revisa las reglas de uso de Hola Vecinos.</p>
          <button id="btn-show-tyc" className="btn btn-ghost btn-full" onClick={() => setShowTyC(true)}>
            Ver Términos y Condiciones
          </button>
        </section>

        {/* Cerrar sesión */}
        <button id="btn-logout" className="btn btn-ghost btn-full" onClick={signOut}>
          Cerrar sesión
        </button>

        {/* Espacio para no quedar tapado por el bottom nav */}
        <div style={{ height: '16px' }} />
      </div>

      {/* Modal Términos y Condiciones */}
      {showTyC && (
        <div className="modal-overlay" onClick={() => setShowTyC(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📄 Términos y Condiciones</h2>
              <button className="btn btn-icon" onClick={() => setShowTyC(false)}>✕</button>
            </div>
            <div className="tyc-body">
              <h3>1. Uso aceptable</h3>
              <p>Hola Vecinos es una plataforma de intercambio vecinal. Está prohibido publicar contenido ilegal, ofensivo, engañoso o que infrinja derechos de terceros.</p>
              <h3>2. Publicaciones</h3>
              <p>Cada usuario puede tener máximo 2 publicaciones activas simultáneas. Las publicaciones expiran automáticamente en 24 horas. Solo se permiten productos, servicios, regalos o trueques legales.</p>
              <h3>3. Contenido prohibido</h3>
              <p>Está estrictamente prohibido publicar o intercambiar: drogas, armas, contenido para adultos, datos personales de terceros, o cualquier elemento ilegal bajo la ley chilena.</p>
              <h3>4. Privacidad y ubicación</h3>
              <p>Tu ubicación GPS se usa únicamente para mostrar tus publicaciones en el mapa local. No compartimos tu ubicación exacta con otros usuarios.</p>
              <h3>5. Chat</h3>
              <p>El sistema de mensajería es solo texto. Está prohibido compartir archivos ejecutables. Los mensajes son supervisados por filtros automáticos de contenido.</p>
              <h3>6. Responsabilidad</h3>
              <p>Hola Vecinos actúa como intermediario de contacto. No garantizamos la calidad, seguridad ni legalidad de los objetos intercambiados. Los usuarios son responsables de sus transacciones.</p>
              <h3>7. Suspensión</h3>
              <p>El incumplimiento de estas normas puede resultar en la suspensión permanente de la cuenta sin previo aviso.</p>
              <p style={{marginTop: '16px', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)'}}>Última actualización: Abril 2026 · Hola Vecinos MVP</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
