// Halaman menu tersendiri khusus pegawai — dipakai sebagai halaman awal untuk build
// aplikasi Android nanti (WebView menuju rute ini), supaya pegawai tidak melihat
// halaman depan web (yang menampilkan menu Portal Admin SiKeren, Pimpinan, dll).
// Cukup dua pintu: Absen (pemindaian wajah) dan Login (untuk Riwayat & Profil).
import { Link } from 'react-router-dom'

function IkonKamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IkonPegawai() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
      <circle cx="12" cy="8" r="3.5" fill="currentColor" />
      <path d="M4.5 20c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function PegawaiApp() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative overflow-hidden bg-moss-900 text-paper">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/kantor-bupati-hsu.jpg)` }}
        />
        <div className="absolute inset-0 bg-moss-900/60" />
        <div className="relative max-w-md mx-auto px-6 pt-14 pb-12 text-center">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-sikeren.png`}
            alt="SiKeren"
            className="w-16 h-16 mx-auto rounded-2xl object-cover"
          />
          <p className="text-xs font-mono uppercase tracking-widest text-gold-400 mt-4">e-Apel</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mt-1">Absensi Pegawai</h1>
          <p className="text-paper/70 text-sm mt-2">Sekretariat Daerah Kab. Hulu Sungai Utara</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm space-y-4">
          <Link
            to="/absen"
            className="flex items-center gap-4 bg-moss-700 text-paper rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="w-11 h-11 rounded-lg bg-gold-500 text-ink flex items-center justify-center shrink-0"><IkonKamera /></div>
            <div>
              <p className="font-display font-semibold">Absen Sekarang</p>
              <p className="text-paper/70 text-xs mt-0.5">Pemindaian wajah untuk apel</p>
            </div>
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-4 bg-white border border-ink/10 rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="w-11 h-11 rounded-lg bg-moss-100 text-moss-700 flex items-center justify-center shrink-0"><IkonPegawai /></div>
            <div>
              <p className="font-display font-semibold text-ink">Riwayat &amp; Profil Saya</p>
              <p className="text-ink/50 text-xs mt-0.5">Masuk pakai NIP &amp; password</p>
            </div>
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-ink/40 font-mono pb-6">Developed by Bagian Umum — Sekretariat Daerah Kab. Hulu Sungai Utara</p>
    </div>
  )
}
