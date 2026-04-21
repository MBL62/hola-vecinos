import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import NewPostModal from '../components/NewPostModal'
import PostDetailModal from '../components/PostDetailModal'
import './MapPage.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CATEGORY_COLORS = {
  producto: '#6366F1', servicio: '#0891B2',
  regalo: '#059669',   trueque: '#D97706',
}
const CATEGORY_EMOJIS = { producto: '📦', servicio: '🔧', regalo: '🎁', trueque: '🔄' }

function createCategoryIcon(category) {
  const color = CATEGORY_COLORS[category] || '#059669'
  const emoji = CATEGORY_EMOJIS[category] || '📍'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
      <path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30S40 35 40 20C40 9 31 0 20 0z"
            fill="${color}" opacity="0.95"/>
      <text x="20" y="27" font-size="16" text-anchor="middle">${emoji}</text>
    </svg>`
  return L.divIcon({ html: svg, className: '', iconSize: [40, 50], iconAnchor: [20, 50], popupAnchor: [0, -50] })
}

function MapController({ onLocated }) {
  const map = useMap()
  useEffect(() => { map.locate({ setView: true, maxZoom: 15 }) }, [map])
  useMapEvents({
    locationfound(e) { onLocated(e.latlng) },
    locationerror() {},
  })
  return null
}

function UserDotMarker({ position }) {
  const icon = L.divIcon({
    html: `<div class="user-dot"><div class="user-dot-pulse"></div></div>`,
    className: '', iconSize: [20, 20], iconAnchor: [10, 10],
  })
  return <Marker position={position} icon={icon} />
}

function formatPrice(price) {
  if (!price && price !== 0) return null
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price)
}

const CATEGORIES = ['todas', 'producto', 'servicio', 'regalo', 'trueque']

export default function MapPage({ userLocation, onLocated }) {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('todas')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(display_name, avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    if (!error) setPosts(data || [])
  }

  // Separa pines en el mismo GPS distribuyéndolos en arco circular (~15m de radio)
  function getJitteredPosition(post, allPosts) {
    const sameSpot = allPosts.filter(p => p.lat === post.lat && p.lng === post.lng)
    if (sameSpot.length <= 1) return [post.lat, post.lng]
    const idx = sameSpot.findIndex(p => p.id === post.id)
    const total = sameSpot.length
    const angle = (2 * Math.PI * idx) / total
    const radius = 0.00014 // ~15 metros
    return [
      post.lat + radius * Math.cos(angle),
      post.lng + radius * Math.sin(angle),
    ]
  }

  const filteredPosts = posts.filter(p => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'todas' || p.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="map-page">
      {/* Barra de búsqueda flotante */}
      <div className="map-search-bar glass">
        <div className="map-search-input-wrap">
          <span className="map-search-icon">🔍</span>
          <input
            id="map-search-input"
            type="text"
            placeholder="Buscar en el mapa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="map-search-input"
          />
          {search && (
            <button className="map-clear-btn" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <button
          id="btn-map-filter"
          className={`btn btn-icon map-filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(v => !v)}
          title="Filtros"
        >⚙️</button>
      </div>

      {/* Chips de categoría */}
      {showFilters && (
        <div className="map-cat-bar glass">
          {CATEGORIES.map(c => (
            <button
              key={c}
              id={`map-filter-${c}`}
              className={`cat-chip ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c === 'todas' ? 'Todas' : `${CATEGORY_EMOJIS[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
            </button>
          ))}
        </div>
      )}

      {/* Mapa */}
      <MapContainer center={[-33.45, -70.65]} zoom={13} className="leaflet-map">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />
        <MapController onLocated={onLocated} />
        {userLocation && <UserDotMarker position={userLocation} />}
        {filteredPosts.map(post => (
          <Marker
            key={post.id}
            position={getJitteredPosition(post, filteredPosts)}
            icon={createCategoryIcon(post.category)}
            eventHandlers={{ click: () => setSelectedPost(post) }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{post.title}</strong>
                <span className="popup-cat">{CATEGORY_EMOJIS[post.category]} {post.category}</span>
                {post.price && <span className="popup-price">{formatPrice(post.price)}</span>}
                {!post.price && (post.category === 'regalo') && <span className="popup-free">🎁 Gratis</span>}
                <span className="popup-user">👤 {post.profiles?.display_name || 'Vecino'}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Badge de resultados */}
      {(search || category !== 'todas') && (
        <div className="map-results-badge">
          {filteredPosts.length} resultado{filteredPosts.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* FAB */}
      <button
        id="btn-new-post"
        className="fab-map btn btn-primary"
        onClick={() => setShowNewPost(true)}
        title="Nueva publicación"
      >
        <span style={{ fontSize: '1.4rem' }}>+</span>
        <span>Publicar</span>
      </button>

      {showNewPost && (
        <NewPostModal
          userLocation={userLocation}
          onClose={() => setShowNewPost(false)}
          onCreated={() => { setShowNewPost(false); fetchPosts() }}
        />
      )}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          currentUserId={user?.id}
          onClose={() => setSelectedPost(null)}
          onRefresh={fetchPosts}
        />
      )}
    </div>
  )
}
