import './PostCard.css'

const CAT_EMOJI = { producto: '📦', servicio: '🔧', regalo: '🎁', trueque: '🔄' }

function formatPrice(price) {
  if (!price && price !== 0) return null
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price)
}

function formatDistance(meters) {
  if (!meters && meters !== 0) return null
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function formatTime(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000) // minutos
  if (diff < 1) return 'ahora'
  if (diff < 60) return `hace ${diff}min`
  const h = Math.floor(diff / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export default function PostCard({ post, onClick, distance }) {
  const expiresAt = new Date(post.expires_at)
  const hoursLeft = Math.max(0, Math.round((expiresAt - Date.now()) / 3600000))
  const priceStr = formatPrice(post.price)
  const distStr = formatDistance(distance)
  const timeStr = formatTime(post.created_at)
  const isStore = post.profiles?.is_store
  const isOpen = post.profiles?.is_open

  return (
    <button className="post-card" onClick={onClick} aria-label={`Ver ${post.title}`}>
      <div className="post-card-left">
        {post.image_url
          ? <img src={post.image_url} alt={post.title} className="post-card-img" />
          : <div className="post-card-noimg">{CAT_EMOJI[post.category] || '📍'}</div>
        }
      </div>
      <div className="post-card-body">
        <div className="post-card-top">
          <div className="post-card-badges">
            <span className={`badge badge-${post.category}`}>{post.category}</span>
            {isStore && (
              <span className={`badge-store ${isOpen ? 'open' : 'closed'}`}>
                {isOpen ? '🟢 Abierto' : '🔴 Cerrado'}
              </span>
            )}
          </div>
          <div className="post-card-meta-right">
            {distStr && <span className="post-card-dist">📍 {distStr}</span>}
            <span className="post-card-time">{timeStr}</span>
          </div>
        </div>

        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-desc">
          {post.description.slice(0, 80)}{post.description.length > 80 ? '…' : ''}
        </p>

        <div className="post-card-footer">
          <span className="post-card-author">{post.profiles?.display_name || 'Vecino'}</span>
          {priceStr && <span className="post-card-price">{priceStr}</span>}
          {!priceStr && (post.category === 'regalo' || post.category === 'trueque') && (
            <span className="post-card-free">
              {post.category === 'regalo' ? '🎁 Gratis' : '🔄 Trueque'}
            </span>
          )}
          {!priceStr && (post.category === 'producto' || post.category === 'servicio') && (
            <span className="post-card-free">A convenir</span>
          )}
        </div>
      </div>
    </button>
  )
}
