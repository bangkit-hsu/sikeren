import { Link } from 'react-router-dom'

function IkonPegawai() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="12" cy="8" r="3.5" fill="currentColor" />
      <path d="M4.5 20c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IkonAdmin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IkonJam() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IkonKelompok() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="8" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 19c0-2.8 2.2-5 5-5s5 2.2 5 5M11 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IkonClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <rect x="5" y="4.5" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 3.5h6v2.5H9V3.5z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12.5l2.3 2.2L16.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IkonBintang() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8L12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

const FITUR = [
  { Ikon: IkonJam, judul: 'Tepat Waktu', teks: 'Absen tercatat otomatis begitu wajah dikenali di jam apel.' },
  { Ikon: IkonKelompok, judul: 'Radius Lokasi', teks: 'Kehadiran diverifikasi sesuai titik koordinat kantor.' },
  { Ikon: IkonClipboard, judul: 'Patuh Aturan', teks: 'Absen di luar lokasi tetap tercatat dengan keterangan jelas.' },
  { Ikon: IkonBintang, judul: 'Rekap Rapi', teks: 'Riwayat & laporan kehadiran tersusun tiap periode.' },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-moss-900 text-paper">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(216,184,74,0.35), transparent 35%), radial-gradient(circle at 85% 15%, rgba(216,184,74,0.25), transparent 40%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 pt-14 pb-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-moss-800 border-2 border-gold-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-gold-500">
              <path d="M12 2.5c-3 0-5.5 2.4-5.5 5.5 0 4 5.5 10.5 5.5 10.5S17.5 12 17.5 8c0-3.1-2.5-5.5-5.5-5.5z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-4xl mt-4">e-Absen</h1>
          <p className="text-paper/70 mt-2">Absensi Apel · Pengenalan Wajah &amp; Radius Lokasi</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gold-500/40 to-transparent" />
      </div>

      {/* Headline & quote */}
      <div className="bg-moss-900 text-paper text-center px-6 pb-10 pt-2">
        <p className="font-display font-bold text-xl sm:text-2xl leading-snug max-w-2xl mx-auto">
          APEL ADALAH <span className="text-gold-500">KEWAJIBAN</span>,<br />
          BUKTI <span className="text-gold-500">DISIPLIN</span> &amp; <span className="text-gold-500">TANGGUNG JAWAB</span> SEBAGAI ASN.
        </p>
        <p className="italic text-paper/70 text-sm max-w-md mx-auto mt-4">
          "Disiplin dimulai dari hal kecil, dan apel adalah langkah awal mewujudkan ASN yang profesional dan berintegritas."
        </p>
      </div>

      {/* Dua kartu: Pegawai & Admin */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-2 pb-10 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-moss-50 rounded-xl2 border border-moss-200 p-4 sm:p-6 shadow-sm flex flex-col">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-moss-700 text-paper flex items-center justify-center mb-3 sm:mb-4">
            <IkonPegawai />
          </div>
          <h2 className="font-display font-semibold text-base sm:text-xl mb-1">Pegawai</h2>
          <p className="text-ink/60 text-xs sm:text-sm flex-1">Rekam kehadiran apel dengan pemindaian wajah 3 detik.</p>
          <Link
            to="/absen"
            className="mt-4 sm:mt-5 inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-moss-700 text-paper text-xs sm:text-base font-medium rounded-lg py-2 sm:py-2.5 px-2 hover:bg-moss-800 transition-colors text-center"
          >
            <span>Rekam Absensi</span> <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="bg-ink rounded-xl2 border border-ink/10 p-4 sm:p-6 shadow-sm flex flex-col text-paper">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gold-500 text-ink flex items-center justify-center mb-3 sm:mb-4">
            <IkonAdmin />
          </div>
          <h2 className="font-display font-semibold text-base sm:text-xl mb-1">Administrator</h2>
          <p className="text-paper/60 text-xs sm:text-sm flex-1">Kelola data pegawai, laporan absensi, dan konfigurasi lokasi.</p>
          <Link
            to="/login"
            className="mt-4 sm:mt-5 inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-gold-500 text-ink text-xs sm:text-base font-medium rounded-lg py-2 sm:py-2.5 px-2 hover:bg-gold-400 transition-colors text-center"
          >
            <span>Masuk Admin</span> <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* Strip fitur */}
      <div className="max-w-3xl mx-auto px-6 pb-14">
        <div className="bg-moss-900 text-paper rounded-xl2 p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {FITUR.map(({ Ikon, judul, teks }) => (
            <div key={judul} className="text-center sm:text-left">
              <div className="text-gold-500 mx-auto sm:mx-0 w-fit">
                <Ikon />
              </div>
              <p className="font-display font-semibold mt-2">{judul}</p>
              <p className="text-paper/60 text-xs mt-1">{teks}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink/40 text-center pb-8 font-mono px-6">
        Website developed by Bagian Umum — Sekretariat Daerah - Kab. Hulu Sungai Utara
      </p>
    </div>
  )
}
