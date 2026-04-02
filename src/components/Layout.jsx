// src/components/Layout.jsx
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">🪵</span>BriarBid
          </Link>

          <nav className={`main-nav${menuOpen ? ' open' : ''}`}>
            <Link to="/auctions" onClick={() => setMenuOpen(false)}>Browse</Link>
            {user ? (
              <>
                <Link to="/sell" className="btn btn--sm btn--accent" onClick={() => setMenuOpen(false)}>+ Sell</Link>
                <Link to="/watchlist" onClick={() => setMenuOpen(false)}>Watchlist</Link>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/notifications" onClick={() => setMenuOpen(false)}>🔔</Link>
                <div className="user-menu" onBlur={() => setTimeout(() => setDropOpen(false), 150)}>
                  <button className="user-menu__toggle" onClick={() => setDropOpen(o => !o)}>
                    <span className="avatar avatar--sm avatar--initials">
                      {user.username?.[0]?.toUpperCase()}
                    </span>
                  </button>
                  {dropOpen && (
                    <div className="user-menu__dropdown">
                      <Link to={`/profile/${user.username}`} onClick={() => setDropOpen(false)}>Profile</Link>
                      {user.is_admin && <Link to="/admin" onClick={() => setDropOpen(false)}>Admin</Link>}
                      <hr />
                      <button onClick={handleSignOut}>Log out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
                <Link to="/register" className="btn btn--sm btn--primary" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </nav>

          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="logo">🪵 BriarBid</span>
            <p>The trusted marketplace for pipe &amp; cigar enthusiasts worldwide.</p>
          </div>
          <nav className="footer-links">
            <Link to="/auctions">Browse Auctions</Link>
            <Link to="/sell">Start Selling</Link>
          </nav>
          <p className="footer-copy">&copy; {new Date().getFullYear()} BriarBid. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}
