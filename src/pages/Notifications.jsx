// src/pages/Notifications.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { notifIcon, formatDate } from '../lib/utils'

export default function Notifications() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getNotifications()
      .then(d => setNotifications(d.notifications || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="loading">Loading…</div>

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>Notifications</h1>
      </div>
      {notifications.length ? (
        <div className="notif-list">
          {notifications.map(n => (
            <div key={n.id} className={`notif-item notif-item--${n.type}`}>
              <span className="notif-icon">{notifIcon(n.type)}</span>
              <div>
                <p>{n.message}</p>
                <small>{formatDate(n.created_at)}</small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No notifications yet.</p>
      )}
    </div>
  )
}
