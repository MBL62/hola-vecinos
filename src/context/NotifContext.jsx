import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const NotifContext = createContext(null)

export function NotifProvider({ user, children }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [toast, setToast] = useState(null)       // { senderName, preview }
  const toastTimer = useRef(null)
  const channelRef = useRef(null)

  // Pedir permiso de notificaciones del navegador (una sola vez)
  useEffect(() => {
    if (!user) return
    if ('Notification' in window && Notification.permission === 'default') {
      // Pequeño delay para no ser invasivo al cargar
      const t = setTimeout(() => Notification.requestPermission(), 3000)
      return () => clearTimeout(t)
    }
  }, [user])

  const showToast = useCallback((senderName, preview) => {
    setToast({ senderName, preview })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 5000)
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
    clearTimeout(toastTimer.current)
  }, [])

  const clearUnread = useCallback(() => setUnreadCount(0), [])

  // Canal global: escucha mensajes donde yo soy el destinatario
  useEffect(() => {
    if (!user) return

    async function getSenderName(senderId) {
      const { data } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', senderId)
        .single()
      return data?.display_name || 'Vecino'
    }

    channelRef.current = supabase
      .channel(`notif-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, async (payload) => {
        const msg = payload.new
        // Solo notificar si NO estamos en la pantalla de ese chat
        const onChatPage = window.location.pathname.includes(`/chat/${msg.post_id}`)
        if (onChatPage) return

        setUnreadCount(n => n + 1)

        const senderName = await getSenderName(msg.sender_id)
        const preview = msg.content.length > 60
          ? msg.content.slice(0, 60) + '…'
          : msg.content

        // Toast in-app (siempre)
        showToast(senderName, preview)

        // Notificación del navegador (si tiene permiso)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`💬 ${senderName}`, {
            body: preview,
            icon: '/favicon.ico',
          })
        }
      })
      .subscribe()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [user, showToast])

  return (
    <NotifContext.Provider value={{ unreadCount, clearUnread, toast, dismissToast }}>
      {children}

      {/* Toast in-app global */}
      {toast && (
        <div className="notif-toast" role="alert" onClick={dismissToast}>
          <div className="notif-toast-icon">💬</div>
          <div className="notif-toast-body">
            <span className="notif-toast-sender">{toast.senderName}</span>
            <span className="notif-toast-preview">{toast.preview}</span>
          </div>
          <button className="notif-toast-close" aria-label="Cerrar">✕</button>
        </div>
      )}
    </NotifContext.Provider>
  )
}

export const useNotif = () => useContext(NotifContext)
