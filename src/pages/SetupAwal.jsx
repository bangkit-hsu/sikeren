import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { hashPassword } from '../utils/hash'

// Halaman ini hanya bisa dipakai selagi koleksi 'users' masih kosong,
// untuk membuat akun admin pertama. Setelah itu admin membuat akun lain lewat menu Kelola Pegawai.
//
// CATATAN SEMENTARA: pengecekan "koleksi masih kosong" di bawah ini untuk sementara
// dinonaktifkan (dipaksa false) sebagai jalur pemulihan darurat karena akun admin lama
// tidak bisa login. Ini HARUS dikembalikan (diaktifkan lagi) setelah akun admin baru
// berhasil dibuat, supaya halaman ini tidak bisa dipakai sembarang orang untuk membuat
// akun admin baru kapan saja.
export default function SetupAwal() {
  const navigate = useNavigate()
  const [mengecek, setMengecek] = useState(true)
  const [sudahAdaUser, setSudahAdaUser] = useState(true)
  const [form, setForm] = useState({ nip: '', nama: '', bagian: '', password: '' })
  const [menyimpan, setMenyimpan] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cek() {
      const snap = await getDocs(collection(db, 'users'))
      setSudahAdaUser(false) // <-- sementara dipaksa false, lihat catatan di atas
      setMengecek(false)
    }
    cek()
  }, [])

  async function buatAdmin(e) {
    e.preventDefault()
    setError('')
    setMenyimpan(true)
    try {
      const passwordHash = await hashPassword(form.password)
      await addDoc(collection(db, 'users'), {
        nip: form.nip.trim(),
        nama: form.nama,
        bagian: form.bagian,
        jabatan: 'Administrator',
        passwordHash,
        role: 'admin',
      })
      navigate('/login')
    } catch (err) {
      setError('Gagal membuat akun admin: ' + err.message)
    } finally {
      setMenyimpan(false)
    }
  }

  if (mengecek) return null

  if (sudahAdaUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 text-center">
        <div>
          <p className="font-display text-xl mb-2">Setup sudah selesai</p>
          <p className="text-ink/60 text-sm mb-4">Akun sudah tersedia. Silakan masuk lewat halaman login.</p>
          <button onClick={() => navigate('/login')} className="text-moss-700 underline font-medium">Ke halaman Login</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-display font-semibold text-2xl mb-1 text-center">Setup Awal</h1>
        <p className="text-ink/60 text-sm mb-6 text-center">Buat akun admin pertama untuk mengelola e-Apel.</p>
        <form onSubmit={buatAdmin} className="bg-white/60 border border-ink/10 rounded-xl2 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">NIP</label>
            <input
              value={form.nip}
              onChange={(e) => setForm({ ...form, nip: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Nama Lengkap</label>
            <input
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Bagian</label>
            <input
              value={form.bagian}
              onChange={(e) => setForm({ ...form, bagian: e.target.value })}
              required
              placeholder="mis. Sekretariat"
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white"
            />
          </div>
          {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={menyimpan}
            className="w-full bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-60"
          >
            {menyimpan ? 'Membuat…' : 'Buat Akun Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
