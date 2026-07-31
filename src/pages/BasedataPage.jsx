// Halaman ini sengaja dibuat terpisah dari alur aplikasi utama (tidak memakai Layout/AuthContext),
// supaya pengembangan di sini tidak mengganggu aplikasi e-Apel yang sudah berjalan.
import { useState } from 'react'

function IkonMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
function IkonKonfigurasi() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5M17.7 17.7l-1.5-1.5M7.8 7.8L6.3 6.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
function IkonHamburger() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const MENU_ITEMS = [
  { key: 'penilaian-asn', label: 'Penilaian ASN', Ikon: IkonMenu, segeraHadir: true },
  { key: 'sipp', label: 'SIPP', Ikon: IkonMenu, segeraHadir: true },
  { key: 'penilaian-individu', label: 'Penilaian Individu', Ikon: IkonMenu, segeraHadir: true },
]

export default function BasedataPage() {
  const [menuAktif, setMenuAktif] = useState('penilaian-asn')
  const [konfigurasiTerbuka, setKonfigurasiTerbuka] = useState(false)
  const [menuTerbuka, setMenuTerbuka] = useState(false)

  const semuaItem = [
    ...MENU_ITEMS,
    { key: 'data-pegawai', label: 'Data Pegawai', segeraHadir: true, dalamKonfigurasi: true },
    { key: 'potongan-tpp', label: 'Potongan TPP', segeraHadir: true, dalamKonfigurasi: true },
  ]
  const aktifSaatIni = semuaItem.find((m) => m.key === menuAktif)

  function pilihMenu(key) {
    setMenuAktif(key)
    setMenuTerbuka(false)
  }

  return (
    <div className="min-h-screen bg-paper md:flex">
      {menuTerbuka && (
        <div className="fixed inset-0 bg-ink/40 z-30 md:hidden" onClick={() => setMenuTerbuka(false)} />
      )}

      {/* Menu di sebelah kiri */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-white border-r border-ink/10 flex-col transform transition-transform duration-200 md:flex md:translate-x-0 ${
          menuTerbuka ? 'flex translate-x-0' : 'hidden -translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-ink/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-moss-800 border-2 border-gold-500 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gold-500">
              <path d="M4 21V6.5L12 3l8 3.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 21v-6h6v6M9 10h.01M12 10h.01M15 10h.01M9 13.5h.01M12 13.5h.01M15 13.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold leading-tight">Basedata</p>
            <p className="text-xs text-ink/50 font-mono">Portal Modul Internal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => pilihMenu(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                menuAktif === item.key ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
              }`}
            >
              <item.Ikon />
              {item.label}
            </button>
          ))}

          <div>
            <button
              type="button"
              onClick={() => setKonfigurasiTerbuka((v) => !v)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-ink/70 hover:bg-moss-100 transition-colors"
            >
              <IkonKonfigurasi />
              Konfigurasi
              <span className="ml-auto text-ink/40"><IkonChevron terbuka={konfigurasiTerbuka} /></span>
            </button>
            {konfigurasiTerbuka && (
              <div className="mt-1 space-y-1">
                <button
                  type="button"
                  onClick={() => pilihMenu('data-pegawai')}
                  className={`w-full flex items-center gap-2.5 pl-10 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    menuAktif === 'data-pegawai' ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
                  }`}
                >
                  Data Pegawai
                </button>
                <button
                  type="button"
                  onClick={() => pilihMenu('potongan-tpp')}
                  className={`w-full flex items-center gap-2.5 pl-10 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    menuAktif === 'potongan-tpp' ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
                  }`}
                >
                  Potongan TPP
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-ink/10 flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMenuTerbuka(true)}
            aria-label="Buka menu"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink/15 shrink-0"
          >
            <IkonHamburger />
          </button>
          <p className="font-display font-semibold">Basedata</p>
        </header>

        <main className="px-6 py-10 max-w-lg mx-auto">
          <h1 className="font-display font-bold text-2xl text-ink mb-1">{aktifSaatIni?.label}</h1>
          {aktifSaatIni?.segeraHadir ? (
            <div className="mt-4 bg-white/60 border border-ink/10 rounded-xl2 p-6 text-center">
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-clay/10 text-clay font-medium mb-3">Segera Hadir</span>
              <p className="text-ink/60 text-sm">Modul ini masih dalam pengembangan dan akan tersedia di sini.</p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
