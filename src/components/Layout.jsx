import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const pegawaiNav = [
  { to: '/pegawai/absensi', label: 'Absensi' },
  { to: '/pegawai/riwayat', label: 'Riwayat Saya' },
]

const adminNav = [
  { to: '/admin/rekap', label: 'Rekap Pegawai' },
  { to: '/admin/lokasi', label: 'Area Lokasi' },
  { to: '/admin/libur', label: 'Hari Libur' },
  { to: '/admin/pegawai', label: 'Kelola Pegawai' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = user?.role === 'admin' ? adminNav : pegawaiNav

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-ink/10 bg-paper/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-moss-700 text-paper flex items-center justify-center font-display font-semibold text-sm">
              eA
            </div>
            <div>
              <p className="font-display font-semibold leading-tight">e-Absen</p>
              <p className="text-xs text-ink/50 font-mono">{user?.role === 'admin' ? 'Panel Admin' : 'Panel Pegawai'}</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-ink/70">{user?.nama}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium px-3 py-2 rounded-lg border border-ink/15 hover:bg-ink hover:text-paper transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
        <nav className="md:hidden flex overflow-x-auto gap-1 px-5 pb-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-moss-700 text-paper' : 'text-ink/70 bg-moss-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-5 py-8">{children}</main>
      <footer className="text-center text-xs text-ink/40 py-6 font-mono">
        absen-apel-pegawai · dibangun dengan Vite + React + Firebase
      </footer>
    </div>
  )
}
