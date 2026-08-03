// Halaman login khusus akun Pimpinan (NIP + Password), terpisah dari login e-Apel/SiKeren.
// Data akun diambil dari koleksi Firestore 'pimpinan' (dikelola admin lewat menu
// Penilaian Individu > Daftar Pimpinan). Setelah berhasil, diarahkan ke Portal Pimpinan
// yang hanya berisi menu Penilaian Individu dan Update Password.
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function PimpinanPage() {
  const { user, loginPimpinan } = useAuth()
  const navigate = useNavigate()
  const [nip, setNip] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user?.role === 'pimpinan') {
    return <Navigate to="/pimpinan/portal" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginPimpinan(nip, password)
      navigate('/pimpinan/portal')
    } catch (err) {
      setError(err.message || 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <h1 className="font-display font-bold text-2xl text-ink mb-1 text-center">Login Pimpinan</h1>
        <p className="text-ink/60 text-sm text-center mb-6">Masuk dengan NIP & password untuk memberi penilaian ke ASN terkait.</p>

        <form onSubmit={handleSubmit} className="bg-white/60 border border-ink/10 rounded-xl2 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">NIP</label>
            <input
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
            />
          </div>
          {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Memeriksa…' : 'Masuk'}
          </button>
        </form>

        <Link to="/" className="block text-center mt-6 text-sm font-medium text-moss-700 underline">
          Kembali ke Halaman Depan
        </Link>
      </div>
    </div>
  )
}
