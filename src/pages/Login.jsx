import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import HeroKecil from '../components/HeroKecil.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tujuanBasedata = searchParams.get('tujuan') === 'basedata'
  const [nip, setNip] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function tujuanSetelahLogin(role) {
    if (role === 'admin' && tujuanBasedata) return '/basedata'
    return role === 'admin' ? '/admin/rekap' : '/pegawai/absensi'
  }

  if (user) {
    return <Navigate to={tujuanSetelahLogin(user.role)} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const batasWaktu = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Koneksi terlalu lama. Periksa sinyal/jaringan lalu coba lagi.')), 20000)
      })
      const loggedIn = await Promise.race([login(nip, password), batasWaktu])
      navigate(tujuanSetelahLogin(loggedIn.role))
    } catch (err) {
      setError(err.message || 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <HeroKecil
        eyebrow={tujuanBasedata ? 'Portal Admin' : 'e-Apel'}
        title="Login Manual"
        subtitle={tujuanBasedata ? 'Masuk dengan NIP & password admin untuk membuka Portal SiKeren' : 'Masuk dengan NIP & password untuk mencatat kehadiran apel'}
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
                placeholder="mis. 198501012010011001"
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
          </form>
          <p className="text-sm text-ink/70 text-center mt-6 font-mono">
            <Link to="/absen" className="underline text-moss-700 font-medium">Masuk pakai pengenalan wajah</Link>
          </p>
          <p className="text-sm text-ink/60 text-center mt-3 font-mono">
            Developed by Bagian Umum — Sekretariat Daerah - Kab. Hulu Sungai Utara
          </p>
        </div>
      </div>
    </div>
  )
}
