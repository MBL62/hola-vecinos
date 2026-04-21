import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './ChatsListPage.css'

export default function ChatsListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchChats()
  }, [user])

  async function fetchChats() {
    setLoading(true)
    // Obtener mensajes donde soy sender o receiver, agrupados por post_id + interlocutor
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, post_id, sender_id, receiver_id, content, created_at,
        posts(title, category),
        sender:profiles!messages_sender_id_fkey(display_name),
        receiver:profiles!messages_receiver_id_fkey(display_name)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Deduplicar por post_id + interlocutor
      const seen = new Set()
      const unique = []
      for (const msg of data) {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        const key = `${msg.post_id}-${otherId}`
        if (!seen.has(key)) {
          seen.add(key)
          unique.push({
            ...msg,
            otherId,
            otherName: msg.sender_id === user.id
              ? msg.receiver?.display_name
              : msg.sender?.display_name,
          })
        }
      }
      setThreads(unique)
    }
    setLoading(false)
  }

  return (
    <div className="chats-page">
      <header className="chats-header glass">
        <h1 className="chats-title">Mis Chats</h1>
      </header>

      <div className="chats-body">
        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && threads.length === 0 && (
          <div className="empty-state">
            <span style={{ fontSize: '3rem' }}>💬</span>
            <p>No tienes conversaciones activas todavía.</p>
            <p style={{ fontSize: 'var(--text-sm)' }}>
              Cuando contactes a un vecino desde una publicación, el chat aparecerá aquí.
            </p>
          </div>
        )}

        {threads.map(thread => (
          <button
            key={`${thread.post_id}-${thread.otherId}`}
            id={`chat-thread-${thread.post_id}`}
            className="chat-thread card"
            onClick={() => navigate(`/chat/${thread.post_id}/${thread.otherId}`)}
          >
            <div className="thread-avatar">
              {(thread.otherName || 'V')[0].toUpperCase()}
            </div>
            <div className="thread-body">
              <div className="thread-top">
                <span className="thread-name">{thread.otherName || 'Vecino'}</span>
                <span className="thread-time">
                  {new Date(thread.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                </span>
              </div>
              <p className="thread-post">📌 {thread.posts?.title || 'Publicación'}</p>
              <p className="thread-preview">{thread.content}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
