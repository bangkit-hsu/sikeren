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

  async function login(nip, password) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('nip', '==', nip.trim()))
    const snap = await getDocs(q)
    if (snap.empty) throw new Error('NIP tidak ditemukan.')
    const docSnap = snap.docs[0]
    const data = docSnap.data()
    const hashed = await hashPassword(password)
    if (hashed !== data.passwordHash) throw new Error('Password salah.')
    if (data.role === 'pegawai' && Array.isArray(data.faceDescriptor) && data.faceDescriptor.length === 128) {
      throw new Error('Akun ini sudah merekam data wajah. Silakan masuk lewat pemindaian wajah di halaman Rekam Absen. Hubungi admin jika perlu bantuan.')
    }
    const sessionUser = {
      id: docSnap.id,
      nip: data.nip,
      nama: data.nama,
      bagian: data.bagian || '',
      jabatan: data.jabatan || '',
      foto: data.foto || null,
      role: data.role, // 'admin' | 'pegawai'
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    setUser(sessionUser)
    return sessionUser
  }

  // Membuat sesi login langsung dari dokumen pegawai yang cocok lewat pengenalan wajah
  // (tidak perlu password lagi, karena identitas sudah diverifikasi lewat wajah).
  function loginDenganWajah(pegawaiDoc) {
    const sessionUser = {
      id: pegawaiDoc.id,
      nip: pegawaiDoc.nip,
      nama: pegawaiDoc.nama,
      bagian: pegawaiDoc.bagian || '',
      jabatan: pegawaiDoc.jabatan || '',
      foto: pegawaiDoc.foto || null,
      role: pegawaiDoc.role,
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
    setUser(sessionUser)
    return sessionUser
  }

  // Memperbarui sesi yang sedang berjalan (dipakai setelah pegawai mengubah foto/password sendiri di menu Profil).
  function perbaruiSesiUser(perubahan) {
    setUser((prev) => {
      if (!prev) return prev
      const baru = { ...prev, ...perubahan }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(baru))
      return baru
    })
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDenganWajah, logout, perbaruiSesiUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
