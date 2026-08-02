// Halaman ini sengaja dibuat sederhana dan berdiri sendiri (tanpa login), karena alur
// menu Pimpinan masih dalam tahap penyusunan. Nanti kalau alurnya sudah pasti,
// halaman ini bisa diarahkan ke bagian portal SiKeren yang sesuai.
import { Link } from 'react-router-dom'

export default function PimpinanPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display font-bold text-2xl text-ink mb-6">Pimpinan</h1>
        <div className="bg-white/60 border border-ink/10 rounded-xl2 p-6">
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-clay/10 text-clay font-medium mb-3">Segera Hadir</span>
          <p className="text-ink/60 text-sm">Modul ini masih dalam pengembangan dan akan tersedia di sini.</p>
        </div>
        <Link to="/" className="inline-block mt-6 text-sm font-medium text-moss-700 underline">
          Kembali ke Halaman Depan
        </Link>
      </div>
    </div>
  )
}
