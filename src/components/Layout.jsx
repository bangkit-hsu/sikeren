import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const pegawaiNav = [
  { to: '/pegawai/absensi', label: 'Absensi' },
  { to: '/pegawai/riwayat', label: 'Riwayat Saya' },
]

const adminNav = [
  { to: '/admin/rekap', label: 'Rekap Pegawai' },
  { to: '/admin/koreksi', label: 'Koreksi Absensi' },
  { to: '/admin/lokasi', label: 'Area Lokasi' },
  { to: '/admin/hari-absen', label: 'Hari Absen' },
  { to: '/admin/pegawai', label: 'Kelola Pegawai' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuTerbuka, setMenuTerbuka] = useState(false)
  const nav = user?.role === 'admin' ? adminNav : pegawaiNav

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function tutupMenu() {
    setMenuTerbuka(false)
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Overlay gelap di belakang menu saat dibuka di layar kecil */}
      {menuTerbuka && (
        <div
          className="fixed inset-0 bg-ink/40 z-30 md:hidden"
          onClick={tutupMenu}
        />
      )}

      {/* Menu di sebelah kiri: sidebar tetap di desktop, panel geser di smartphone */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-white border-r border-ink/10 flex flex-col transform transition-transform duration-200 md:translate-x-0 ${
          menuTerbuka ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-ink/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-moss-700 text-paper flex items-center justify-center font-display font-semibold text-sm shrink-0">
            eA
          </div>
          <div>
            <p className="font-display font-semibold leading-tight">e-Absen</p>
            <p className="text-xs text-ink/50 font-mono">{user?.role === 'admin' ? 'Panel Admin' : 'Panel Pegawai'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={tutupMenu}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-ink/10">
          <p className="text-sm text-ink/70 truncate mb-2">{user?.nama}</p>
          <button
            onClick={handleLogout}
            className="w-full text-sm font-medium px-3 py-2 rounded-lg border border-ink/15 hover:bg-ink hover:text-paper transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-ink/10 flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMenuTerbuka(true)}
            aria-label="Buka menu"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink/15 shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <p className="font-display font-semibold">e-Absen</p>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-8">{children}</main>
        <footer className="text-center text-xs text-ink/40 py-6 font-mono">
          absen-apel-pegawai · dibangun dengan Vite + React + Firebase
        </footer>
      </div>
    </div>
  )
}
