// src/pages/Profile.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProfile } from '../lib/api'
import { money, formatDate } from '../lib/utils'

export default function Profile() {
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile(username)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [username])

  if (loading) return <div className="loading">Loading…</div>
  if (!data) return <div className="container"><h1>User not found.</h1></div>

  const { user, listings, reviews, stats } = data

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      {/* Profile header */}
      <div className="dashboard-header" style={{ marginBottom: 40 }}>
        <div className="dashboard-welcome">
          <span className="avatar avatar--lg avatar--initials">
            {user.username?.[0]?.toUpperCase()}
          </span>
          <div>
            <h1>{user.full_name || user.username}</h1>
            <p>@{user.username} · Member since {formatDate(user.created_at, { year: 'numeric', month: 'long' })}</p>
            {user.bio && <p style={{ marginTop: 8, color: 'var(--ink-muted)' }}>{user.bio}</p>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats?.avg_rating ? `⭐ ${stats.avg_rating}` : '—'}</div>
          <small style={{ color: 'var(--ink-muted)' }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</small>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 40 }}>
        <div className="stat-card">
          <span className="stat-card__num">{stats?.sold || 0}</span>
          <span className="stat-card__label">Items Sold</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">{stats?.active || 0}</span>
          <span className="stat-card__label">Active Listings</span>
        </div>
      </div>

      {/* Listings */}
      <section className="dash-section" style={{ marginBottom: 40 }}>
        <div className="dash-section__header"><h2>Listings</h2></div>
        {listings.length ? (
          <div className="mini-list">
            {listings.map(a => (
              <div key={a.id} className="mini-item">
                <div className="mini-item__info">
                  <Link to={`/auction/${a.id}`} className="mini-item__title">{a.title}</Link>
                  <span className="mini-item__meta">
                    {money(a.current_bid || a.starting_price)} · {a.bid_count} bids
                  </span>
                </div>
                <span className={`status-badge status-badge--${a.status}`}>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No listings yet.</p>
        )}
      </section>

      {/* Reviews */}
      <section className="dash-section">
        <div className="dash-section__header"><h2>Reviews</h2></div>
        {reviews.length ? (
          <div className="notif-list">
            {reviews.map((r, i) => (
              <div key={i} className="notif-item">
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <strong>{r.reviewer}</strong>
                    <span>{'⭐'.repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p>{r.comment}</p>}
                  <small style={{ color: 'var(--ink-muted)' }}>{formatDate(r.created_at)}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No reviews yet.</p>
        )}
      </section>
    </div>
  )
}
