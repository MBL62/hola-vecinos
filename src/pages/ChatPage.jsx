import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './ChatPage.css'

const BLOCKED_PATTERN = /\b(droga[s]?|cocaína|heroína|marihuana|weed|arma[s]?|pistola[s]?|fusil(es)?|porno|xxx|p3do|pedofil[oa])\b/i
const FILE_PATTERN = /\.(exe|apk|zip|rar|bat|sh|dmg|pkg|deb|msi)\b/i

function containsBlocked(text) { return BLOCKED_PATTERN.test(text) }
function formatTime(d) { return new Date(d).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }
function formatDate(d) { return new Date(d).toLocaleDateString('es', { day: '2-digit', month: 'short' }) }

export default function ChatPage() {
  const { postId, userId: otherId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchPost()
    fetchMessages()
    const channel = supabase
      .channel(`chat-${postId}-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages',
          filter: `post_id=eq.${postId}` },
        payload => {
          const msg = payload.new
          if ((msg.sender_id === user.id && msg.receiver_id === otherId) ||
              (msg.sender_id === otherId && msg.receiver_id === user.id)) {
            setMessages(prev => [...prev, msg])
          }
        })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [postId, otherId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchPost() {
    const { data } = await supabase.from('posts')
      .select('*, profiles(display_name)').eq('id', postId).single()
    setPost(data)
  }

  async function fetchMessages() {
    const { data } = await supabase.from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(display_name)')
      .eq('post_id', postId)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function handleSend(e) {
    e.preventDefault()
    const content = text.trim()
    setError('')
    if (!content) return
    if (content.length > 1000) { setError('Máximo 1000 caracteres.'); return }
    if (containsBlocked(content)) { setError('Mensaje bloqueado por política de uso.'); return }
    if (FILE_PATTERN.test(content)) { setError('No se permiten enlaces de archivos ejecutables.'); return }

    setSending(true)
    const { error: err } = await supabase.from('messages').insert({
      post_id: postId, sender_id: user.id, receiver_id: otherId, content,
    })
    setSending(false)
    if (err) setError('No se pudo enviar. Inténtalo de nuevo.')
    else { setText(''); inputRef.current?.focus() }
  }

  let lastDate = ''

  return (
    <div className="chat-page">
      <header className="chat-header glass">
        <button id="btn-back-chat" className="btn btn-icon" onClick={() => navigate('/chats')}>←</button>
        <div className="chat-header-info">
          <span className="chat-post-title">{post?.title || '...'}</span>
          <span className="chat-with">con {post?.profiles?.display_name || 'Vecino'}</span>
        </div>
      </header>

      <div className="chat-policy-note">🔒 Solo texto · No compartas datos personales ni archivos ejecutables</div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty"><span>💬</span><p>¡Sé el primero en escribir!</p></div>
        )}
        {messages.map(msg => {
          const mine = msg.sender_id === user.id
          const msgDate = formatDate(msg.created_at)
          const showDate = msgDate !== lastDate
          lastDate = msgDate
          return (
            <div key={msg.id}>
              {showDate && <div className="chat-date-divider">{msgDate}</div>}
              <div className={`chat-bubble-wrap ${mine ? 'mine' : 'theirs'}`}>
                <div className={`chat-bubble ${mine ? 'mine' : 'theirs'}`}>
                  <p>{msg.content}</p>
                  <span className="bubble-time">{formatTime(msg.created_at)}</span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar glass" onSubmit={handleSend}>
        <div className="chat-input-wrap">
          <input id="chat-text-input" ref={inputRef} type="text"
            placeholder="Escribe un mensaje..." value={text}
            onChange={e => setText(e.target.value)} maxLength={1000} autoComplete="off" />
          {error && <p className="chat-error" role="alert">{error}</p>}
        </div>
        <button id="btn-send-message" type="submit" className="btn btn-primary chat-send-btn"
          disabled={sending || !text.trim()}>
          {sending ? '…' : '↑'}
        </button>
      </form>
    </div>
  )
}
