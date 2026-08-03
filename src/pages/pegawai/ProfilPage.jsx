import { useEffect, useRef, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext.jsx'
import { hashPassword } from '../../utils/hash'
import {
  muatModelWajah, nyalakanKamera, matikanKamera,
  ambilDescriptorDariVideo, rataRataDescriptorRobust, tangkapFotoDariVideo,
} from '../../utils/face'
import CincinPemindai from '../../components/CincinPemindai.jsx'

const JUMLAH_JEPRETAN = 7
const JEDA_ANTAR_JEPRETAN_MS = 700 // 7 jepretan x 700ms ≈ 5 detik total perekaman

export default function ProfilPage() {
  const { user, perbaruiSesiUser } = useAuth()
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [tahap, setTahap] = useState('idle') // idle | menyiapkan_kamera | merekam | selesai_rekam | menyimpan
  const [jumlahTertangkap, setJumlahTertangkap] = useState(0)
  const [descriptorBaru, setDescriptorBaru] = useState(null)
  const [fotoBaru, setFotoBaru] = useState(null)
  const [pesanWajah, setPesanWajah] = useState('')
  const [errorWajah, setErrorWajah] = useState('')

  const [sandiLama, setSandiLama] = useState('')
  const [sandiBaru, setSandiBaru] = useState('')
  const [sandiUlang, setSandiUlang] = useState('')
  const [menyimpanSandi, setMenyimpanSandi] = useState(false)
  const [pesanSandi, setPesanSandi] = useState('')
  const [errorSandi, setErrorSandi] = useState('')

  useEffect(() => {
    return () => matikanKamera(streamRef.current)
  }, [])

  async function mulaiRekamUlang() {
    setTahap('menyiapkan_kamera')
    setErrorWajah('')
    setPesanWajah('')
    try {
      await muatModelWajah()
      streamRef.current = await nyalakanKamera(videoRef.current)
      setTahap('merekam')
      rekamBertahap([])
    } catch (err) {
      setTahap('idle')
      setErrorWajah(err.message || 'Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.')
    }
  }

  async function rekamBertahap(kumpulan) {
    await new Promise((r) => setTimeout(r, JEDA_ANTAR_JEPRETAN_MS))
    const descriptor = await ambilDescriptorDariVideo(videoRef.current)
    if (!descriptor) {
      rekamBertahap(kumpulan)
      return
    }
    const baru = [...kumpulan, descriptor]
    setJumlahTertangkap(baru.length)
    if (baru.length >= JUMLAH_JEPRETAN) {
      setDescriptorBaru(rataRataDescriptorRobust(baru))
      setFotoBaru(tangkapFotoDariVideo(videoRef.current))
      matikanKamera(streamRef.current)
      setTahap('selesai_rekam')
    } else {
      rekamBertahap(baru)
    }
  }

  function batalRekam() {
    matikanKamera(streamRef.current)
    setTahap('idle')
    setJumlahTertangkap(0)
    setDescriptorBaru(null)
    setFotoBaru(null)
  }

  async function simpanRekamWajah() {
    setTahap('menyimpan')
    setErrorWajah('')
    try {
      await updateDoc(doc(db, 'users', user.id), { faceDescriptor: descriptorBaru, foto: fotoBaru })
      perbaruiSesiUser({ foto: fotoBaru })
      setPesanWajah('Data wajah dan foto profil berhasil diperbarui.')
      setTahap('idle')
      setJumlahTertangkap(0)
      setDescriptorBaru(null)
      setFotoBaru(null)
    } catch (err) {
      setErrorWajah('Gagal menyimpan: ' + err.message)
      setTahap('selesai_rekam')
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
        {tahap === 'idle' && (
          <div className="flex items-center gap-4 mb-5">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-ink border border-ink/10 shrink-0">
              {user.foto ? (
                <img src={user.foto} alt="Foto profil" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-paper/50 text-xs font-mono">Belum ada</div>
              )}
            </div>
            <div>
              <button
                onClick={mulaiRekamUlang}
                className="text-sm font-medium bg-moss-700 text-paper rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors"
              >
                Update Rekam Wajah
              </button>
              <p className="text-xs text-ink/40 mt-1.5">Merekam ulang wajah otomatis memperbarui foto profil juga.</p>
              {pesanWajah && <p className="text-xs text-moss-700 mt-1.5">{pesanWajah}</p>}
              {errorWajah && <p className="text-xs text-clay mt-1.5">{errorWajah}</p>}
            </div>
          </div>
        )}

        {(tahap === 'menyiapkan_kamera' || tahap === 'merekam') && (
          <div className="mb-5">
            <div className="relative aspect-square w-52 sm:w-60 mx-auto rounded-full overflow-hidden bg-ink border border-ink/10">
              <video ref={videoRef} muted playsInline className="w-full h-full object-cover scale-x-[-1] rounded-full" />
              {tahap === 'menyiapkan_kamera' && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/60 text-paper text-sm font-mono rounded-full">
                  Menyiapkan kamera…
                </div>
              )}
              {tahap === 'merekam' && (
                <CincinPemindai className="absolute inset-0 w-full h-full pointer-events-none" />
              )}
            </div>
            {tahap === 'merekam' && (
              <p className="text-center text-sm text-ink/60 mt-4 font-mono">
                Tetap lihat ke kamera… {jumlahTertangkap}/{JUMLAH_JEPRETAN}
              </p>
            )}
            <button onClick={batalRekam} className="block mx-auto text-xs text-ink/50 underline mt-3">Batal</button>
          </div>
        )}

        {tahap === 'selesai_rekam' && (
          <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-6 text-center mb-5">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-ink border border-ink/10 mx-auto mb-3">
              {fotoBaru && <img src={fotoBaru} alt="Pratinjau foto baru" className="w-full h-full object-cover" />}
            </div>
            <p className="font-display text-lg font-semibold text-moss-800 mb-1">Wajah berhasil direkam ulang</p>
            <p className="text-sm text-ink/60 mb-5">Foto dan data wajah baru siap disimpan.</p>
            {errorWajah && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2 mb-4">{errorWajah}</p>}
            <div className="flex gap-3">
              <button onClick={mulaiRekamUlang} className="flex-1 border border-ink/15 font-medium rounded-lg py-2.5 hover:bg-ink/5 transition-colors">
                Rekam Ulang
              </button>
              <button onClick={simpanRekamWajah} className="flex-1 bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors">
                Simpan
              </button>
            </div>
          </div>
        )}

        {tahap === 'menyimpan' && (
          <p className="text-center text-ink/60 font-mono text-sm py-6 mb-5">Menyimpan data wajah…</p>
        )}

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
            className="w-full bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-50"
          >
            {menyimpanSandi ? 'Menyimpan…' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>
    </div>
  )
}
