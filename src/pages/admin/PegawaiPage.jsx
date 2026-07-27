import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { hashPassword } from '../../utils/hash'

export default function PegawaiPage() {
  const [daftar, setDaftar] = useState([])
  const [memuat, setMemuat] = useState(true)
  const [form, setForm] = useState({ nama: '', username: '', password: '', role: 'pegawai' })
  const [menyimpan, setMenyimpan] = useState(false)
  const [error, setError] = useState('')

  async function muatUlang() {
    setMemuat(true)
    const snap = await getDocs(collection(db, 'users'))
    setDaftar(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.nama.localeCompare(b.nama)))
    setMemuat(false)
  }

  useEffect(() => { muatUlang() }, [])

  async function tambahAkun(e) {
    e.preventDefault()
    setError('')
    const username = form.username.trim().toLowerCase()
    if (!username || !form.password || !form.nama) return
    setMenyimpan(true)
    try {
      const cekQ = query(collection(db, 'users'), where('username', '==', username))
      const cekSnap = await getDocs(cekQ)
      if (!cekSnap.empty) {
        setError('Username sudah dipakai, gunakan username lain.')
        setMenyimpan(false)
        return
      }
      const passwordHash = await hashPassword(form.password)
      await addDoc(collection(db, 'users'), {
        nama: form.nama,
        username,
        passwordHash,
        role: form.role,
      })
      setForm({ nama: '', username: '', password: '', role: 'pegawai' })
      await muatUlang()
    } catch (err) {
      setError('Gagal menambah akun: ' + err.message)
    } finally {
      setMenyimpan(false)
    }
  }

  async function hapusAkun(id) {
    if (!confirm('Hapus akun ini?')) return
    await deleteDoc(doc(db, 'users', id))
    await muatUlang()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-semibold text-2xl mb-1">Kelola Pegawai</h1>
      <p className="text-ink/60 text-sm mb-6">Buat akun login untuk pegawai baru atau admin lain.</p>

      <form onSubmit={tambahAkun} className="bg-white/60 border border-ink/10 rounded-xl2 p-5 grid sm:grid-cols-2 gap-3 mb-8">
        <div>
          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Nama Lengkap</label>
          <input
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Username</label>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Password Awal</label>
          <input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Peran</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
          >
            <option value="pegawai">Pegawai</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && <p className="sm:col-span-2 text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={menyimpan}
          className="sm:col-span-2 bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-60"
        >
          {menyimpan ? 'Menyimpan…' : 'Tambah Akun'}
        </button>
      </form>

      {memuat ? (
        <p className="text-ink/50 font-mono text-sm">Memuat…</p>
      ) : (
        <ul className="divide-y divide-ink/10 border border-ink/10 rounded-xl2 overflow-hidden">
          {daftar.map((u) => (
            <li key={u.id} className="flex items-center justify-between px-4 py-3 bg-white/60">
              <div>
                <p className="font-medium">{u.nama} <span className="text-xs font-mono text-ink/40">@{u.username}</span></p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-ink text-paper' : 'bg-moss-100 text-moss-800'}`}>
                  {u.role === 'admin' ? 'Admin' : 'Pegawai'}
                </span>
              </div>
              <button onClick={() => hapusAkun(u.id)} className="text-sm text-clay font-medium hover:underline">
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
