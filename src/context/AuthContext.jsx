import { createContext, useContext, useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { hashPassword } from '../utils/hash'

const AuthContext = createContext(null)
const SESSION_KEY = 'absen_apel_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
    }
    setLoading(false)
  }, [])

  async function login(username, password) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username.trim().toLowerCase()))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('Username tidak ditemukan.')
    const docSnap = snap.docs[0]
    const data = docSnap.data()
    const hashed = await hashPassword(password)
    if (hashed !== data.passwordHash) throw new Error('Password salah.')
    const sessionUser = {
      id: docSnap.id,
      nama: data.nama,
      username: data.username,
      role: data.role, // 'admin' | 'pegawai'
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    setUser(sessionUser)
    return sessionUser
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
