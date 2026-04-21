import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import PostDetailModal from '../components/PostDetailModal'
import './ListPage.css'

// Distancia en metros entre dos coordenadas (Haversine)
function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const CATEGORY_OPTIONS = ['todas', 'producto', 'servicio', 'regalo', 'trueque']

export default function ListPage({ userLocation }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('todas')
  const [onlyNearby, setOnlyNearby] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(display_name, avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
    if (!error) setPosts(data || [])
    setLoading(false)
  }

  const filtered = posts.filter(p => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'todas' || p.category === category
    const matchDistance =
      !onlyNearby ||
      !userLocation ||
      getDistanceMeters(userLocation.lat, userLocation.lng, p.lat, p.lng) <= 1000
    return matchSearch && matchCategory && matchDistance
  })

  return (
    <div className="list-page">
      {/* ---- Header ---- */}
      <header className="list-header glass">
        <h1 className="list-title">Ofertas del barrio</h1>
        <div className="list-search-wrap">
          <span className="list-search-icon">🔍</span>
          <input
            id="search-input"
            type="text"
            placeholder="Buscar publicaciones..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="list-search"
          />
          {search && (
            <button className="list-clear-btn" onClick={() => setSearch('')} aria-label="Limpiar">✕</button>
          )}
        </div>

        {/* Filtros */}
        <div className="list-filters">
          <div className="cat-filter" role="group" aria-label="Filtro por categoría">
            {CATEGORY_OPTIONS.map(c => (
              <button
                key={c}
                id={`filter-${c}`}
                className={`cat-chip ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <label className="nearby-toggle">
            <input
              id="toggle-nearby"
              type="checkbox"
              checked={onlyNearby}
              onChange={e => setOnlyNearby(e.target.checked)}
            />
            <span>Solo 1km</span>
          </label>
        </div>
      </header>

      {/* ---- Lista ---- */}
      <div className="list-body">
        {loading && (
          <div className="loading-center"><div className="spinner" /></div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <p>No encontramos publicaciones{category !== 'todas' ? ` de "${category}"` : ''}{search ? ` con "${search}"` : ''}.</p>
          </div>
        )}
        {filtered.map(post => {
          const dist = userLocation
            ? Math.round(getDistanceMeters(userLocation.lat, userLocation.lng, post.lat, post.lng))
            : null
          return (
            <PostCard
              key={post.id}
              post={post}
              distance={dist}
              onClick={() => setSelectedPost(post)}
            />
          )
        })}
      </div>

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
