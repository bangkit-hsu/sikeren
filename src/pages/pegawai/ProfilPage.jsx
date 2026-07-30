import { useRef, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext.jsx'
import { hashPassword } from '../../utils/hash'
import { kompresGambarKeDataUrl } from '../../utils/gambar'

export default function ProfilPage() {
  const { user, perbaruiSesiUser } = useAuth()
  const fileRef = useRef(null)

  const [mengunggah, setMengunggah] = useState(false)
  const [pesanFoto, setPesanFoto] = useState('')
  const [errorFoto, setErrorFoto] = useState('')

  const [sandiLama, setSandiLama] = useState('')
  const [sandiBaru, setSandiBaru] = useState('')
  const [sandiUlang, setSandiUlang] = useState('')
  const [menyimpanSandi, setMenyimpanSandi] = useState(false)
  const [pesanSandi, setPesanSandi] = useState('')
  const [errorSandi, setErrorSandi] = useState('')

  async function pilihFoto() {
    fileRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorFoto('')
    setPesanFoto('')
    setMengunggah(true)
    try {
      const dataUrl = await kompresGambarKeDataUrl(file)
      await updateDoc(doc(db, 'users', user.id), { foto: dataUrl })
      perbaruiSesiUser({ foto: dataUrl })
      setPesanFoto('Foto profil berhasil diperbarui.')
    } catch (err) {
      setErrorFoto(err.message || 'Gagal mengunggah foto.')
    } finally {
      setMengunggah(false)
      e.target.value = ''
    }
  }

  async function handleSimpanSandi(e) {
    e.preventDefault()
    setErrorSandi('')
    setPesanSandi('')
    if (sandiBaru !== sandiUlang) {
      setErrorSandi('Konfirmasi password baru tidak cocok.')
      return
    }
    if (sandiBaru.length < 4) {
      setErrorSandi('Password baru minimal 4 karakter.')
      return
    }
    setMenyimpanSandi(true)
    try {
      const hashLama = await hashPassword(sandiLama)
      // Ambil ulang data terbaru untuk verifikasi password lama tanpa menyimpannya di state global
      const snap = await getDoc(doc(db, 'users', user.id))
      if (!snap.exists() || snap.data().passwordHash !== hashLama) {
        setErrorSandi('Password lama tidak sesuai.')
        setMenyimpanSandi(false)
        return
      }
      const hashBaru = await hashPassword(sandiBaru)
      await updateDoc(doc(db, 'users', user.id), { passwordHash: hashBaru })
      setPesanSandi('Password berhasil diperbarui.')
      setSandiLama('')
      setSandiBaru('')
      setSandiUlang('')
    } catch (err) {
      setErrorSandi('Gagal menyimpan: ' + err.message)
    } finally {
      setMenyimpanSandi(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display font-semibold text-2xl mb-6">Profil Saya</h1>

      <div className="bg-white/60 border border-ink/10 rounded-xl2 p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-ink border border-ink/10 shrink-0">
            {user.foto ? (
              <img src={user.foto} alt="Foto profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-paper/50 text-xs font-mono">Belum ada</div>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={pilihFoto}
              disabled={mengunggah}
              className="text-sm font-medium bg-moss-700 text-paper rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors disabled:opacity-50"
            >
              {mengunggah ? 'Mengunggah…' : 'Ubah Foto'}
            </button>
            {pesanFoto && <p className="text-xs text-moss-700 mt-1.5">{pesanFoto}</p>}
            {errorFoto && <p className="text-xs text-clay mt-1.5">{errorFoto}</p>}
          </div>
        </div>

        <div className="space-y-1 text-sm border-t border-ink/10 pt-4">
          <p><span className="text-ink/40">NIP</span> <span className="font-mono ml-1">{user.nip}</span></p>
          <p><span className="text-ink/40">Nama</span> <span className="font-medium ml-1">{user.nama}</span></p>
          <p><span className="text-ink/40">Bagian</span> <span className="ml-1">{user.bagian}</span></p>
          <p><span className="text-ink/40">Jabatan</span> <span className="ml-1">{user.jabatan}</span></p>
        </div>
        <p className="text-xs text-ink/40 mt-3 font-mono">Data NIP, Nama, Bagian, dan Jabatan hanya bisa diubah oleh admin.</p>
      </div>

      <div className="bg-white/60 border border-ink/10 rounded-xl2 p-6">
        <p className="font-display font-semibold mb-4">Ubah Password</p>
        <form onSubmit={handleSimpanSandi} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Password Lama</label>
            <input
              type="password"
              value={sandiLama}
              onChange={(e) => setSandiLama(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Password Baru</label>
            <input
              type="password"
              value={sandiBaru}
              onChange={(e) => setSandiBaru(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Ulangi Password Baru</label>
            <input
              type="password"
              value={sandiUlang}
              onChange={(e) => setSandiUlang(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
            />
          </div>
          {errorSandi && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{errorSandi}</p>}
          {pesanSandi && <p className="text-sm text-moss-700 bg-moss-50 rounded-lg px-3 py-2">{pesanSandi}</p>}
          <button
            type="submit"
            disabled={menyimpanSandi}
            className="w-full bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-60"
          >
            {menyimpanSandi ? 'Menyimpan…' : 'Simpan Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
