// src/pages/Watchlist.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWatchlist } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import AuctionCard from '../components/AuctionCard'

export default function Watchlist() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getWatchlist()
      .then(d => setItems(d.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="loading">Loading…</div>

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Watchlist</h1>
        <span className="result-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>
      {items.length ? (
        <div className="auction-grid">
          {items.map(a => <AuctionCard key={a.id} auction={a} />)}
        </div>
      ) : (
        <div className="empty-state">
          <p>Your watchlist is empty.</p>
          <a href="/auctions" className="btn btn--outline">Browse Auctions</a>
        </div>
      )}
    </div>
  )
}
