// Halaman menu tersendiri khusus pegawai — dipakai sebagai halaman awal untuk build
// aplikasi Android nanti (WebView menuju rute ini), supaya pegawai tidak melihat
// halaman depan web (yang menampilkan menu Portal Admin SiKeren, Pimpinan, dll).
// Gaya tampilan mengikuti pola layar Face ID: lencana logo besar di tengah,
// tombol utama "Gunakan Face ID" dan tombol sekunder untuk login manual.
import { Link } from 'react-router-dom'

export default function PegawaiApp() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/kantor-bupati-hsu.jpg)` }}
      />
      <div className="absolute inset-0 bg-paper/70" />

      <div className="relative min-h-screen flex flex-col items-center px-6 pt-12 pb-10 text-center">
        <p className="font-display font-bold text-2xl text-ink">e-Apel</p>

        <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-white shadow-md flex items-center justify-center mt-10">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-sikeren.png`}
            alt="SiKeren"
            className="w-40 h-40 sm:w-44 sm:h-44 rounded-3xl object-cover"
          />
        </div>

        <h1 className="font-display font-bold text-2xl text-ink mt-10">Login dengan Face ID</h1>
        <p className="text-ink/60 mt-2 max-w-xs">Mohon letakkan ponsel di depan wajah Anda</p>

        <div className="w-full max-w-xs mt-10 space-y-3">
          <Link
            to="/absen"
            className="block w-full bg-moss-700 text-paper font-semibold rounded-full py-3.5 hover:bg-moss-800 transition-colors"
          >
            Absen Sekarang
          </Link>
          <Link
            to="/absen"
            className="block w-full bg-white text-moss-700 font-semibold rounded-full py-3.5 border-2 border-moss-700 hover:bg-moss-50 transition-colors"
          >
            Riwayat &amp; Profil Saya
          </Link>
          <Link
            to="/pimpinan"
            className="block w-full bg-gold-500 text-ink font-semibold rounded-full py-3.5 hover:bg-gold-600 transition-colors"
          >
            Login Pimpinan
          </Link>
        </div>

        <p className="text-xs text-ink/50 font-mono mt-6">Developed by Bagian Umum Setda HSU</p>
      </div>
    </div>
  )
}
