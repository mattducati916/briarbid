// src/pages/NotFound.jsx
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>🪵</div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', marginBottom: 12 }}>404</h1>
      <p style={{ color: 'var(--ink-muted)', marginBottom: 32 }}>This page has gone up in smoke.</p>
      <Link to="/" className="btn btn--primary btn--lg">Back to Home</Link>
    </div>
  )
}
