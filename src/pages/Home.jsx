// src/pages/Home.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHome } from '../lib/api'
import { categoryEmoji, money, timeRemaining } from '../lib/utils'
import AuctionCard from '../components/AuctionCard'
import { useAuth } from '../lib/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHome().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading…</div>

  const { featured = [], endingSoon = [], categories = [], stats = {}, cmsData = {} } = data || {}

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" style={cmsData.heroBgUrl ? { backgroundImage: `url(${cmsData.heroBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}></div>
        <div className="container hero-content">
          <h1 className="hero-title" style={{ whiteSpace: 'pre-wrap' }}>{cmsData.heroTitle}</h1>
          <p className="hero-sub">{cmsData.heroSub}</p>
          <div className="hero-search">
            <form
              className="search-form"
              onSubmit={e => {
                e.preventDefault()
                const q = e.target.q.value.trim()
                if (q) window.location.href = `/auctions?q=${encodeURIComponent(q)}`
              }}
            >
              <input type="text" name="q" placeholder="Search pipes, tobacco, cigars…" className="search-input" autoComplete="off" />
              <button type="submit" className="btn btn--primary btn--lg">Search</button>
            </form>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">{parseInt(stats.active || 0).toLocaleString()}</span> Live Auctions</div>
            <div className="stat"><span className="stat-num">{parseInt(stats.members || 0).toLocaleString()}</span> Members</div>
            <div className="stat"><span className="stat-num">{parseInt(stats.total_bids || 0).toLocaleString()}</span> Bids Placed</div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="category-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/auctions?category=${cat.slug}`} className="category-card">
                <span className="category-icon">{categoryEmoji(cat.slug)}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Live Auctions</h2>
            <Link to="/auctions" className="btn btn--outline">View All →</Link>
          </div>
          {featured.length ? (
            <div className="auction-grid">
              {featured.map(a => <AuctionCard key={a.id} auction={a} />)}
            </div>
          ) : (
            <p className="empty-state">No auctions yet. <Link to="/sell">Be the first to list!</Link></p>
          )}
        </div>
      </section>

      {/* Ending Soon */}
      {endingSoon.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">⏱ Ending Soon</h2>
            </div>
            <div className="auction-grid auction-grid--compact">
              {endingSoon.map(a => <AuctionCard key={a.id} auction={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* Why BriarBid */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 40 }}>Why BriarBid?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 32, textAlign: 'center' }}>
            {(cmsData.whyItems || []).map(f => (
              <div key={f.title}>
                <div style={{ fontSize: '2.5rem', marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--ink-muted)', fontSize: '.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="section cta-section">
          <div className="container cta-inner">
            <h2>Ready to find your next great smoke?</h2>
            <p>Join thousands of pipe and cigar enthusiasts buying and selling on BriarBid.</p>
            <Link to="/register" className="btn btn--primary btn--lg">Create a Free Account</Link>
          </div>
        </section>
      )}
    </>
  )
}
