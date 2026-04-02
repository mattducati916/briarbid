// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getDashboard } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { money, formatDate, notifIcon } from '../lib/utils'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getDashboard().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="loading">Loading…</div>
  if (!data) return null

  const { myAuctions, myBids, stats, notifications } = data

  return (
    <div className="container">
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <span className="avatar avatar--lg avatar--initials">
            {user?.username?.[0]?.toUpperCase()}
          </span>
          <div>
            <h1>Hi, {user?.username}!</h1>
            <p>@{user?.username}</p>
          </div>
        </div>
        <Link to="/sell" className="btn btn--primary">+ New Listing</Link>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { num: stats.bids,     label: 'Auctions Bid On' },
          { num: stats.won,      label: 'Auctions Won' },
          { num: stats.listings, label: 'My Listings' },
          { num: stats.sold,     label: 'Items Sold' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-card__num">{s.num}</span>
            <span className="stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-columns">
        {/* My listings */}
        <section className="dash-section">
          <div className="dash-section__header">
            <h2>My Listings</h2>
          </div>
          {myAuctions.length ? (
            <div className="mini-list">
              {myAuctions.map(a => (
                <div key={a.id} className="mini-item">
                  <div className="mini-item__info">
                    <Link to={`/auction/${a.id}`} className="mini-item__title">{a.title}</Link>
                    <span className="mini-item__meta">
                      {money(a.current_bid || a.starting_price)} · {a.bid_count} bids
                    </span>
                  </div>
                  <span className={`status-badge status-badge--${a.status}`}>{a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No listings yet. <Link to="/sell">Create one!</Link></p>
          )}
        </section>

        {/* My bids */}
        <section className="dash-section">
          <div className="dash-section__header">
            <h2>My Bids</h2>
          </div>
          {myBids.length ? (
            <div className="mini-list">
              {myBids.map((b, i) => {
                const isWinning = b.current_bid == b.amount && b.status === 'active'
                const isWon = b.winner_id === user?.id
                return (
                  <div key={i} className="mini-item">
                    <div className="mini-item__info">
                      <Link to={`/auction/${b.auction_id}`} className="mini-item__title">{b.title}</Link>
                      <span className="mini-item__meta">Your bid: {money(b.amount)}</span>
                    </div>
                    {isWon ? (
                      <span className="status-badge status-badge--won">Won!</span>
                    ) : isWinning ? (
                      <span className="status-badge status-badge--winning">Winning</span>
                    ) : b.status === 'active' ? (
                      <span className="status-badge status-badge--outbid">Outbid</span>
                    ) : (
                      <span className={`status-badge status-badge--${b.status}`}>{b.status}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="empty-state">No bids yet. <Link to="/auctions">Browse auctions!</Link></p>
          )}
        </section>

        {/* Notifications */}
        <section className="dash-section">
          <div className="dash-section__header">
            <h2>Recent Notifications</h2>
            <Link to="/notifications">View all →</Link>
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
        </section>
      </div>
    </div>
  )
}
