// src/lib/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('bb_token')
    const stored = localStorage.getItem('bb_user')
    if (token && stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  function signIn(token, userData) {
    localStorage.setItem('bb_token', token)
    localStorage.setItem('bb_user', JSON.stringify(userData))
    setUser(userData)
  }

  function signOut() {
    localStorage.removeItem('bb_token')
    localStorage.removeItem('bb_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
