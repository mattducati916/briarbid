// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

export default function Register() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const fd = Object.fromEntries(new FormData(e.target))
    if (fd.password !== fd.password_confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const res = await register({ username: fd.username, email: fd.email, password: fd.password, full_name: fd.full_name })
      signIn(res.token, res.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start bidding and selling in minutes</p>

        {error && <div className="flash flash--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="full_name">Full Name</label>
              <input type="text" id="full_name" name="full_name" required />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" minLength={3} maxLength={50} required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" autoComplete="email" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" autoComplete="new-password" minLength={8} required />
            </div>
            <div className="form-group">
              <label htmlFor="password_confirm">Confirm Password</label>
              <input type="password" id="password_confirm" name="password_confirm" autoComplete="new-password" required />
            </div>
          </div>
          <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <p className="form-legal">By signing up you agree to our <a href="#">Terms of Service</a>.</p>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  )
}
