import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './PostDetailModal.css'

const CAT_EMOJI = { producto: '📦', servicio: '🔧', regalo: '🎁', trueque: '🔄' }
const DEL_EMOJI = { retiro: '🤝', despacho: '🚚' }

export default function PostDetailModal({ post, currentUserId, onClose, onRefresh }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOwner = post.user_id === currentUserId
  const expiresAt = new Date(post.expires_at)
  const hoursLeft = Math.max(0, Math.round((expiresAt - Date.now()) / 3600000))

  async function handleDelete() {
    if (!window.confirm('¿Eliminar esta publicación?')) return
    await supabase.from('posts').delete().eq('id', post.id)
    onClose()
    onRefresh()
  }

  async function handleReport() {
    const reason = window.prompt('¿Por qué reportas esta publicación?')
    if (!reason) return
    await supabase.from('reports').insert({
      post_id: post.id,
      reporter_id: user.id,
      reason: reason.trim(),
    })
    window.alert('Reporte enviado. Gracias por ayudar a mantener la comunidad segura.')
  }

  function handleContact() {
    navigate(`/chat/${post.id}/${post.user_id}`)
  }

  async function handleShare() {
    const url = `${window.location.origin}/?post=${post.id}`
    const shareData = {
      title: post.title,
      text: `${post.description}${post.price ? ' — $' + post.price.toLocaleString('es-CL') : ''}`,
      url,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      window.alert('¡Enlace copiado al portapapeles!')
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal post-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">

        {post.image_url && (
          <div className="post-image-container">
            <img src={post.image_url} alt={post.title} className="post-detail-img" />
            <button className="btn btn-icon post-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
        )}
        {!post.image_url && (
          <div className="modal-header">
            <h2 id="detail-title">{post.title}</h2>
            <button id="btn-close-detail" className="btn btn-icon" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
        )}

        <div className="post-detail-body">
          {post.image_url && <h2 id="detail-title" className="post-detail-title">{post.title}</h2>}

          <div className="post-meta-row">
            <span className={`badge badge-${post.category}`}>
              {CAT_EMOJI[post.category]} {post.category}
            </span>
            <span className="post-delivery">{DEL_EMOJI[post.delivery_type]} {post.delivery_type}</span>
            <span className="post-expires">⏱ {hoursLeft}h restantes</span>
          </div>

          <p className="post-description">{post.description}</p>

          <div className="post-author">
            <div className="author-avatar">
              {post.profiles?.avatar_url
                ? <img src={post.profiles.avatar_url} alt={post.profiles.display_name} />
                : <span>{(post.profiles?.display_name || 'A')[0].toUpperCase()}</span>
              }
            </div>
            <span className="author-name">{post.profiles?.display_name || 'Vecino'}</span>
          </div>

          <div className="post-actions">
            <button
              id="btn-share-post"
              className="btn btn-ghost btn-full"
              onClick={handleShare}
            >
              🔗 Compartir
            </button>
            {isOwner ? (
              <button id="btn-delete-post" className="btn btn-danger btn-full" onClick={handleDelete}>
                🗑️ Eliminar publicación
              </button>
            ) : (
              <>
                <button id="btn-contact-author" className="btn btn-primary btn-full" onClick={handleContact}>
                  💬 Contactar al vecino
                </button>
                <button id="btn-report-post" className="btn btn-ghost btn-full" onClick={handleReport}>
                  🚩 Reportar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
