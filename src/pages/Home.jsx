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

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-moss-900 text-paper">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/kantor-bupati-hsu.jpg)` }}
        />
        <div className="absolute inset-0 bg-moss-900/60" />
        <div className="relative max-w-3xl mx-auto px-6 pt-10 pb-10 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-moss-800 border-2 border-gold-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gold-500">
              <path d="M12 2.5c-3 0-5.5 2.4-5.5 5.5 0 4 5.5 10.5 5.5 10.5S17.5 12 17.5 8c0-3.1-2.5-5.5-5.5-5.5z" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mt-3">SiKeren</h1>
          <p className="text-paper/70 text-sm mt-1">Sistem Kinerja dan Reward ASN Sekretariat Daerah</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gold-500/40 to-transparent" />
      </div>

      {/* Dua kartu: Pegawai & Admin */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-8 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-moss-50 rounded-xl2 border border-moss-200 p-4 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-11 sm:h-11 shrink-0 rounded-lg sm:rounded-xl bg-moss-700 text-paper flex items-center justify-center">
              <IkonPegawai />
            </div>
            <h2 className="font-display font-semibold text-base sm:text-xl">e-Apel</h2>
          </div>
          <p className="text-ink/60 text-xs sm:text-sm flex-1">Absensi apel dengan pemindaian wajah.</p>
          <Link
            to="/absen"
            className="mt-4 sm:mt-5 inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-moss-700 text-paper text-xs sm:text-base font-medium rounded-lg py-2 sm:py-2.5 px-2 hover:bg-moss-800 transition-colors text-center"
          >
            <span>Rekam Absensi</span> <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="bg-ink rounded-xl2 border border-ink/10 p-4 sm:p-6 shadow-sm flex flex-col text-paper">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-11 sm:h-11 shrink-0 rounded-lg sm:rounded-xl bg-gold-500 text-ink flex items-center justify-center">
              <IkonAdmin />
            </div>
            <h2 className="font-display font-semibold text-base sm:text-xl">Pimpinan</h2>
          </div>
          <p className="text-paper/60 text-xs sm:text-sm flex-1">Penilaian Individu ASN.</p>
          <Link
            to="/pimpinan"
            className="mt-4 sm:mt-5 inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-gold-500 text-ink text-xs sm:text-base font-medium rounded-lg py-2 sm:py-2.5 px-2 hover:bg-gold-400 transition-colors text-center"
          >
            <span>Masuk Portal</span> <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* Portal Admin SiKeren — login admin lalu masuk ke portal SiKeren */}
      <div className="text-center px-6 -mt-2 pb-2">
        <Link
          to="/login?tujuan=basedata"
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink border border-ink/15 hover:border-ink/30 rounded-full px-4 py-2 transition-colors"
        >
          Portal Admin SiKeren <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Judul */}
      <div className="text-center px-6 pt-10 pb-4">
        <p className="font-display font-bold text-xl sm:text-2xl leading-snug max-w-2xl mx-auto text-ink">
          <span className="text-gold-600">OBJEKTIF</span> MENILAI, <span className="text-gold-600">TRANSPARAN</span> MENGHARGAI<br />
          SERTA MENDORONG ASN <span className="text-gold-600">BERAKHLAK</span> DAN <span className="text-gold-600">BERKINERJA</span>.
        </p>
      </div>

      {/* Kutipan */}
      <div className="text-center px-6 pb-10">
        <p className="italic text-ink/60 text-sm max-w-md mx-auto">
          "Disiplin dimulai dari hal kecil, dan apel adalah langkah awal mewujudkan ASN yang profesional dan berintegritas."
        </p>
      </div>

      <div className="text-center pb-10 px-6">
        <p className="inline-block bg-moss-700 text-paper text-xs sm:text-sm rounded-full px-4 py-2 font-mono">
          Developed by Bagian Umum — Sekretariat Daerah - Kab. Hulu Sungai Utara
        </p>
      </div>
    </div>
  )
}
