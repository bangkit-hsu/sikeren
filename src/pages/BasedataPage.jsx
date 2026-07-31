// Halaman ini sengaja dibuat terpisah dari alur aplikasi utama (tidak memakai Layout/AuthContext),
// supaya pengembangan di sini tidak mengganggu aplikasi e-Apel yang sudah berjalan.
import { useState } from 'react'
import { Link } from 'react-router-dom'

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
function IkonApel() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7.5 17c.7-1.9 2.4-3 4.5-3s3.8 1.1 4.5 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

const MENU_SEGERA_HADIR = [
  { label: 'Penilaian ASN', Ikon: IkonMenu },
  { label: 'SIPP', Ikon: IkonMenu },
  { label: 'Penilaian Individu', Ikon: IkonMenu },
]

export default function BasedataPage() {
  const [konfigurasiTerbuka, setKonfigurasiTerbuka] = useState(false)

  return (
    <div className="min-h-screen bg-paper px-5 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-full bg-moss-800 border-2 border-gold-500 flex items-center justify-center mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gold-500">
              <path d="M4 21V6.5L12 3l8 3.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 21v-6h6v6M9 10h.01M12 10h.01M15 10h.01M9 13.5h.01M12 13.5h.01M15 13.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-2xl text-ink">Basedata</h1>
          <p className="text-ink/60 text-sm mt-1">Portal modul internal — beberapa menu masih dalam pengembangan.</p>
        </div>

        <div className="space-y-3">
          {MENU_SEGERA_HADIR.map(({ label, Ikon }) => (
            <div
              key={label}
              className="flex items-center justify-between bg-white/60 border border-ink/10 rounded-xl2 px-4 py-3.5 opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-ink/10 text-ink/50 flex items-center justify-center">
                  <Ikon />
                </div>
                <span className="font-medium text-ink/70">{label}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-clay/10 text-clay font-medium">Segera Hadir</span>
            </div>
          ))}

          <Link
            to="/"
            className="flex items-center gap-3 bg-moss-50 border border-moss-200 rounded-xl2 px-4 py-3.5 hover:bg-moss-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-moss-700 text-paper flex items-center justify-center">
              <IkonApel />
            </div>
            <span className="font-medium text-ink">Absen Apel</span>
            <span className="ml-auto text-moss-700" aria-hidden>→</span>
          </Link>

          <div className="bg-white/60 border border-ink/10 rounded-xl2 overflow-hidden">
            <button
              type="button"
              onClick={() => setKonfigurasiTerbuka((v) => !v)}
              className="w-full flex items-center gap-3 px-4 py-3.5"
            >
              <div className="w-9 h-9 rounded-lg bg-ink/10 text-ink/70 flex items-center justify-center">
                <IkonKonfigurasi />
              </div>
              <span className="font-medium text-ink">Konfigurasi</span>
              <span className="ml-auto text-ink/40">
                <IkonChevron terbuka={konfigurasiTerbuka} />
              </span>
            </button>
            {konfigurasiTerbuka && (
              <div className="px-4 pb-3.5 pt-1 space-y-1">
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-paper text-sm text-ink/60">
                  <span>Data Pegawai</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-clay/10 text-clay font-medium">Segera Hadir</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
