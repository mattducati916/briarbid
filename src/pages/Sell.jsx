// src/pages/Sell.jsx
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createAuction, getAuctions } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

export default function Sell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getAuctions({ limit: 1 }).then(d => setCategories(d.categories || []))
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = Object.fromEntries(new FormData(e.target))
    try {
      const res = await createAuction(fd)
      navigate(`/auction/${res.auction.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Default end time: 7 days from now
  const defaultEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16)

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>Create a New Listing</h1>
      </div>

      {error && <div className="flash flash--error">{error}</div>}

      <form onSubmit={handleSubmit} className="sell-form">
        <div className="form-group">
          <label htmlFor="title">Title <span style={{ color: 'red' }}>*</span></label>
          <input type="text" id="title" name="title" minLength={5} maxLength={200} required
            placeholder="e.g. Savinelli Autograph 4 Billiard — Unsmoked" />
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Category <span style={{ color: 'red' }}>*</span></label>
          <select id="category_id" name="category_id" required>
            <option value="">Select a category…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description <span style={{ color: 'red' }}>*</span></label>
          <textarea id="description" name="description" rows={6} minLength={20} required
            placeholder="Describe the item in detail — maker, age, condition, any defects…" />
        </div>

        <div className="form-group">
          <label htmlFor="condition_notes">Condition Notes</label>
          <input type="text" id="condition_notes" name="condition_notes"
            placeholder="e.g. Minor surface scratches on the bowl, stem is pristine" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="starting_price">Starting Price ($) <span style={{ color: 'red' }}>*</span></label>
            <input type="number" id="starting_price" name="starting_price" min="0.01" step="0.01" required placeholder="1.00" />
          </div>
          <div className="form-group">
            <label htmlFor="reserve_price">Reserve Price ($)</label>
            <input type="number" id="reserve_price" name="reserve_price" min="0.01" step="0.01" placeholder="Optional" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="buy_now_price">Buy Now Price ($)</label>
            <input type="number" id="buy_now_price" name="buy_now_price" min="0.01" step="0.01" placeholder="Optional" />
          </div>
          <div className="form-group">
            <label htmlFor="end_time">Auction End Time <span style={{ color: 'red' }}>*</span></label>
            <input type="datetime-local" id="end_time" name="end_time" defaultValue={defaultEnd} required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
            {loading ? 'Publishing…' : 'Publish Listing'}
          </button>
          <Link to="/dashboard" className="btn btn--ghost btn--lg">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
