import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './NewPostModal.css'

const CATEGORIES = ['producto', 'servicio', 'regalo', 'trueque']
const DELIVERY = ['retiro', 'despacho']
const PRICE_CATEGORIES = ['producto', 'servicio']

const BLOCKED_TERMS = [
  /\bdroga[s]?\b/i, /\bcocaína\b/i, /\bmarihuana\b/i, /\bheroin[a]?\b/i,
  /\barma[s]?\b/i, /\bpistola[s]?\b/i, /\bfusil(es)?\b/i,
  /\bporno\b/i, /\bxxx\b/i,
]

function containsBlockedContent(text) {
  return BLOCKED_TERMS.some(re => re.test(text))
}

export default function NewPostModal({ userLocation, onClose, onCreated }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    title: '', description: '', category: 'producto', delivery_type: 'retiro',
  })
  const [priceDisplay, setPriceDisplay] = useState('')  // texto formateado: "10.000"
  const [priceRaw, setPriceRaw] = useState(null)        // número real: 10000
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const showPrice = PRICE_CATEGORIES.includes(form.category)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const MAX_PRICE = 99_999_999

  // Formatea el precio con separadores de miles (formato chileno: 1.000.000)
  function handlePriceChange(e) {
    const raw = e.target.value.replace(/\D/g, '')  // solo dígitos
    if (!raw) {
      setPriceDisplay('')
      setPriceRaw(null)
      setError('')
      return
    }
    const num = parseInt(raw, 10)
    if (num > MAX_PRICE) {
      setError(`El precio máximo permitido es $${MAX_PRICE.toLocaleString('es-CL')}`)
      return
    }
    setError('')
    setPriceRaw(num)
    // Formato es-CL usa puntos para miles
    setPriceDisplay(num.toLocaleString('es-CL'))
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!userLocation) {
      setError('Necesitamos tu ubicación para publicar. Activa el GPS e intenta de nuevo.')
      return
    }

    if (containsBlockedContent(form.title) || containsBlockedContent(form.description)) {
      setError('Tu publicación contiene contenido no permitido en nuestra comunidad.')
      return
    }

    if (form.title.trim().length < 3) {
      setError('El título debe tener al menos 3 caracteres.')
      return
    }

    if (form.description.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres.')
      return
    }

    if (showPrice && priceDisplay && priceRaw === null) {
      setError('El precio debe ser un número válido.')
      return
    }
    if (showPrice && priceRaw !== null && priceRaw > MAX_PRICE) {
      setError(`El precio máximo permitido es $${MAX_PRICE.toLocaleString('es-CL')}`)
      return
    }
    if (showPrice && priceRaw !== null && priceRaw < 0) {
      setError('El precio debe ser mayor a $0.')
      return
    }

    setLoading(true)
    try {
      // Verificar límite de 2 posts activos
      const { count } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())

      if (count >= 2) {
        throw new Error('Ya tienes 2 publicaciones activas. Espera a que venzan o elimínalas.')
      }

      // Subir imagen si existe
      let image_url = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const filename = `${user.id}-${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filename, imageFile, { upsert: false })
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(filename)
        image_url = urlData.publicUrl
      }

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const priceValue = showPrice && priceRaw ? priceRaw : null

      const { error: insertError } = await supabase.from('posts').insert({
        user_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        delivery_type: form.delivery_type,
        lat: userLocation.lat,
        lng: userLocation.lng,
        image_url,
        price: priceValue,
        expires_at: expiresAt,
      })
      if (insertError) throw insertError

      onCreated()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="new-post-title">
        <div className="modal-header">
          <h2 id="new-post-title">Nueva Publicación</h2>
          <button id="btn-close-new-post" className="btn btn-icon" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="new-post-form">
          {/* Imagen */}
          <div className="image-upload-area" onClick={() => document.getElementById('post-image-input').click()}>
            {imagePreview
              ? <img src={imagePreview} alt="Vista previa" className="image-preview" />
              : <div className="image-placeholder"><span>📷</span><p>Agregar foto (opcional)</p></div>
            }
            <input id="post-image-input" type="file" accept="image/*" hidden onChange={handleImageChange} />
          </div>

          <div className="field">
            <label htmlFor="post-title">Título</label>
            <input id="post-title" name="title" type="text" placeholder="¿Qué ofreces?"
              value={form.title} onChange={handleChange} required maxLength={80} />
          </div>

          <div className="field">
            <label htmlFor="post-desc">
              Descripción
              <span className="char-count">
                {form.description.length}/500
                {form.description.length < 10 && form.description.length > 0 &&
                  <span className="char-warn"> (mín. 10)</span>
                }
              </span>
            </label>
            <textarea id="post-desc" name="description" placeholder="Describe lo que ofreces (mínimo 10 caracteres)..."
              value={form.description} onChange={handleChange} required maxLength={500} />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="post-category">Categoría</label>
              <select id="post-category" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="post-delivery">Entrega</label>
              <select id="post-delivery" name="delivery_type" value={form.delivery_type} onChange={handleChange}>
                {DELIVERY.map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Precio — solo para producto y servicio */}
          {showPrice && (
            <div className="field price-field">
              <label htmlFor="post-price">
                Precio (CLP)
                <span className="price-hint">— deja en blanco si es gratis o a convenir</span>
              </label>
              <div className="price-input-wrap">
                <span className="price-symbol">$</span>
                <input
                  id="post-price"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={priceDisplay}
                  onChange={handlePriceChange}
                  style={{ paddingLeft: '28px' }}
                />
              </div>
            </div>
          )}

          <div className="location-note">
            {userLocation
              ? <span className="loc-ok">📍 Ubicación detectada</span>
              : <span className="loc-warn">⚠️ Esperando ubicación GPS...</span>
            }
          </div>

          {error && <p className="error-msg" role="alert">⚠️ {error}</p>}

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button id="btn-submit-post" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
