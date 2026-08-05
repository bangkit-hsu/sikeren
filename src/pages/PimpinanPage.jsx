// Halaman login khusus akun Pimpinan (NIP + Password), terpisah dari login e-Apel/SiKeren.
// Data akun diambil dari koleksi Firestore 'pimpinan' (dikelola admin lewat menu
// Penilaian Individu > Daftar Pimpinan). Setelah berhasil, diarahkan ke Portal Pimpinan
// yang hanya berisi menu Penilaian Individu dan Update Password.
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import HeroKecil from '../components/HeroKecil.jsx'

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
      const batasWaktu = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Koneksi terlalu lama. Periksa sinyal/jaringan lalu coba lagi.')), 20000)
      })
      await Promise.race([loginPimpinan(nip, password), batasWaktu])
      navigate('/pimpinan/portal')
    } catch (err) {
      setError(err.message || 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <HeroKecil
        eyebrow="Pimpinan"
        title="Login Pimpinan"
        subtitle="Masuk dengan NIP & password untuk memberi penilaian ke ASN terkait"
      />

      <div className="flex justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="bg-white border border-ink/10 rounded-xl2 p-6 space-y-4 shadow-sm">
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">NIP</label>
              <input
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white font-mono focus:border-moss-600 outline-none"
                placeholder="mis. 197011181991011002"
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
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-60"
            >
              {loading ? 'Memeriksa…' : 'Masuk'}
            </button>
            <p className="text-xs text-ink/50 text-center">Jika belum mendapatkan password atau terkendala Login, hubungi Admin.</p>
          </form>
          <p className="text-sm text-ink/60 text-center mt-6 font-mono">
            Developed by Bagian Umum — Sekretariat Daerah - Kab. Hulu Sungai Utara
          </p>
        </div>
      </div>
    </div>
  )
}
