import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/rekap' : '/pegawai/absensi'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const loggedIn = await login(username, password)
      navigate(loggedIn.role === 'admin' ? '/admin/rekap' : '/pegawai/absensi')
    } catch (err) {
      setError(err.message || 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-moss-700 text-paper flex items-center justify-center font-display font-semibold text-lg radar-ring">
            AA
          </div>
          <h1 className="font-display font-semibold text-2xl mt-4">Absen Apel Pegawai</h1>
          <p className="text-ink/60 text-sm mt-1">Masuk untuk mencatat kehadiran apel</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/60 border border-ink/10 rounded-xl2 p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
              placeholder="mis. andi.pratama"
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
        <p className="text-xs text-ink/40 text-center mt-6 font-mono">
          Akun dibuat oleh admin melalui menu Kelola Pegawai ·{' '}
          <Link to="/setup" className="underline">pertama kali pakai?</Link>
        </p>
      </div>
    </div>
  )
}
