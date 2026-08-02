import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function IkonAbsensi() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.5 17c.7-1.9 2.4-3 4.5-3s3.8 1.1 4.5 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IkonRiwayat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IkonProfil() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 19c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IkonKeluar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M9 4H6a1.5 1.5 0 00-1.5 1.5v13A1.5 1.5 0 006 20h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13 8l4 4-4 4M17 12H9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IkonChevron({ terbuka }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-transform ${terbuka ? 'rotate-90' : ''}`}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const pegawaiNav = [
  { to: '/pegawai/absensi', label: 'Absensi', Ikon: IkonAbsensi },
  { to: '/pegawai/riwayat', label: 'Riwayat Saya', Ikon: IkonRiwayat },
  { to: '/pegawai/profil', label: 'Profil', Ikon: IkonProfil },
]

const adminNavGroups = [
  {
    label: 'Absensi Apel',
    items: [
      { to: '/admin/absen-harian', label: 'Absen Harian' },
      { to: '/admin/rekap', label: 'Rekap Absen' },
      { to: '/admin/koreksi', label: 'Koreksi Absen' },
    ],
  },
  {
    label: 'Konfigurasi',
    items: [
      { to: '/admin/pegawai', label: 'Kelola Pegawai' },
      { to: '/admin/lokasi', label: 'Atur Area Apel' },
      { to: '/admin/hari-absen', label: 'Hari Absensi Apel' },
    ],
  },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuTerbuka, setMenuTerbuka] = useState(false)
  const isAdmin = user?.role === 'admin'

  const [grupTerbuka, setGrupTerbuka] = useState(() => {
    const aktif = adminNavGroups.find((group) => group.items.some((item) => location.pathname.startsWith(item.to)))
    return aktif ? aktif.label : adminNavGroups[0]?.label ?? null
  })

  // Kalau navigasi berpindah ke menu di grup lain, buka grup itu saja (accordion: grup lain otomatis tertutup).
  useEffect(() => {
    const aktif = adminNavGroups.find((group) => group.items.some((item) => location.pathname.startsWith(item.to)))
    if (aktif) setGrupTerbuka(aktif.label)
  }, [location.pathname])

  function toggleGrup(label) {
    setGrupTerbuka((prev) => (prev === label ? null : label))
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function tutupMenu() {
    setMenuTerbuka(false)
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Overlay gelap di belakang menu saat dibuka di layar kecil (khusus admin) */}
      {menuTerbuka && (
        <div
          className="fixed inset-0 bg-ink/40 z-30 md:hidden"
          onClick={tutupMenu}
        />
      )}

      {/* Menu di sebelah kiri: sidebar tetap di desktop. Di smartphone: panel geser untuk admin,
          bilah bawah selalu terlihat untuk pegawai (lihat <nav> di akhir file). */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-white border-r border-ink/10 flex-col transform transition-transform duration-200 md:flex md:translate-x-0 ${
          isAdmin ? (menuTerbuka ? 'flex translate-x-0' : 'flex -translate-x-full') : 'hidden -translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-ink/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-moss-700 text-paper flex items-center justify-center font-display font-semibold text-sm shrink-0">
            eA
          </div>
          <div>
            <p className="font-display font-semibold leading-tight">e-Apel</p>
            <p className="text-xs text-ink/50 font-mono">{isAdmin ? 'Panel Admin' : 'Panel Pegawai'}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {isAdmin ? (
            adminNavGroups.map((group) => {
              const terbuka = grupTerbuka === group.label
              return (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => toggleGrup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wide text-ink/50 hover:bg-moss-50 hover:text-ink/70 transition-colors"
                  >
                    <span>{group.label}</span>
                    <IkonChevron terbuka={terbuka} />
                  </button>
                  {terbuka && (
                    <div className="space-y-1 mt-1">
                      {group.items.map((item) => (
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
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="space-y-1">
              {pegawaiNav.map((item) => (
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
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-ink/10">
          <p className="text-sm text-ink/70 truncate mb-2">{user?.nama}</p>
          <button
            onClick={() => navigate('/basedata')}
            className="w-full text-sm font-medium px-3 py-2 rounded-lg border border-ink/15 hover:bg-ink hover:text-paper transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-ink/10 flex items-center gap-3 px-4 py-3">
          {isAdmin && (
            <button
              onClick={() => setMenuTerbuka(true)}
              aria-label="Buka menu"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink/15 shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <p className="font-display font-semibold">e-Apel</p>
        </header>

        <main className={`flex-1 w-full max-w-5xl mx-auto px-5 py-8 ${!isAdmin ? 'pb-24 md:pb-8' : ''}`}>{children}</main>
        <footer className="hidden md:block text-center text-xs text-ink/40 py-6 font-mono">
          absen-apel-pegawai · dibangun dengan Vite + React + Firebase
        </footer>
      </div>

      {/* Bilah menu bawah untuk Pegawai: selalu terlihat di smartphone, tidak perlu dibuka lewat tombol */}
      {!isAdmin && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-moss-900 border-t border-ink/10 flex items-stretch px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {pegawaiNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl mx-1 text-xs font-medium transition-colors ${
                  isActive ? 'bg-gold-500 text-ink' : 'text-paper/70'
                }`
              }
            >
              <item.Ikon />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-1.5 rounded-xl mx-1 text-xs font-medium text-paper/70"
          >
            <IkonKeluar />
            Keluar
          </button>
        </nav>
      )}
    </div>
  )
}
