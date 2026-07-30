import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { hashPassword } from '../utils/hash'
import PilihBagian from '../components/PilihBagian.jsx'
import {
  muatModelWajah, nyalakanKamera, matikanKamera,
  ambilDescriptorDariVideo, rataRataDescriptor,
} from '../utils/face'
import CincinPemindai from '../components/CincinPemindai.jsx'

const JUMLAH_JEPRETAN = 3
const JEDA_ANTAR_JEPRETAN_MS = 700

export default function DaftarWajah() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [tahap, setTahap] = useState('form') // form | menyiapkan_kamera | merekam | selesai_rekam | menyimpan | sukses | error
  const [jumlahTertangkap, setJumlahTertangkap] = useState(0)
  const [descriptorRekam, setDescriptorRekam] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({ nip: '', nama: '', bagian: '', jabatan: '', password: '' })

  useEffect(() => {
    return () => matikanKamera(streamRef.current)
  }, [])

  function handleFormSubmit(e) {
    e.preventDefault()
    if (!form.nip || !form.nama || !form.bagian || !form.jabatan || !form.password) return
    mulaiRekamWajah()
  }

  async function mulaiRekamWajah() {
    setTahap('menyiapkan_kamera')
    setErrorMsg('')
    try {
      await muatModelWajah()
      streamRef.current = await nyalakanKamera(videoRef.current)
      setTahap('merekam')
      rekamBertahap([])
    } catch (err) {
      setTahap('error')
      setErrorMsg(err.message || 'Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.')
    }
  }

  async function rekamBertahap(kumpulan) {
    await new Promise((r) => setTimeout(r, JEDA_ANTAR_JEPRETAN_MS))
    const descriptor = await ambilDescriptorDariVideo(videoRef.current)
    if (!descriptor) {
      // wajah belum terdeteksi jelas, coba lagi tanpa menambah hitungan
      rekamBertahap(kumpulan)
      return
    }
    const baru = [...kumpulan, descriptor]
    setJumlahTertangkap(baru.length)
    if (baru.length >= JUMLAH_JEPRETAN) {
      const rataRata = rataRataDescriptor(baru)
      setDescriptorRekam(rataRata)
      matikanKamera(streamRef.current)
      setTahap('selesai_rekam')
    } else {
      rekamBertahap(baru)
    }
  }

  async function simpanPendaftaran() {
    setTahap('menyimpan')
    setErrorMsg('')
    try {
      const nip = form.nip.trim()
      const cekQ = query(collection(db, 'users'), where('nip', '==', nip))
      const cekSnap = await getDocs(cekQ)
      if (!cekSnap.empty) {
        setErrorMsg('NIP ini sudah terdaftar. Hubungi admin jika ini kesalahan.')
        setTahap('selesai_rekam')
        return
      }
      const passwordHash = await hashPassword(form.password)
      await addDoc(collection(db, 'users'), {
        nip,
        nama: form.nama.trim(),
        bagian: form.bagian.trim(),
        jabatan: form.jabatan.trim(),
        passwordHash,
        role: 'pegawai',
        faceDescriptor: descriptorRekam,
      })
      setTahap('sukses')
    } catch (err) {
      setErrorMsg('Gagal menyimpan pendaftaran: ' + err.message)
      setTahap('selesai_rekam')
    }
  }

  function ulangiRekam() {
    setDescriptorRekam(null)
    setJumlahTertangkap(0)
    mulaiRekamWajah()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-display font-semibold text-2xl">Pendaftaran Mandiri</h1>
          <p className="text-ink/60 text-sm mt-1">Daftarkan data & wajah kamu untuk absen otomatis di e-Absen</p>
        </div>

        {tahap === 'form' && (
          <form onSubmit={handleFormSubmit} className="bg-white/60 border border-ink/10 rounded-xl2 p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">NIP</label>
              <input
                value={form.nip}
                onChange={(e) => setForm({ ...form, nip: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white font-mono focus:border-moss-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Nama Lengkap</label>
              <input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Bagian</label>
              <div className="mt-1">
                <PilihBagian value={form.bagian} onChange={(v) => setForm({ ...form, bagian: v })} required />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Jabatan</label>
              <input
                value={form.jabatan}
                onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                required
                placeholder="mis. Staf, Kepala Sub Bagian, dsb."
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Buat Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
              />
              <p className="text-xs text-ink/40 mt-1">Dipakai sebagai cadangan login jika wajah tidak terdeteksi.</p>
            </div>
            <button
              type="submit"
              className="w-full bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors"
            >
              Lanjut Rekam Wajah
            </button>
          </form>
        )}

        {(tahap === 'menyiapkan_kamera' || tahap === 'merekam') && (
          <div>
            <div className="relative aspect-square rounded-full overflow-hidden bg-ink border border-ink/10">
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
          </div>
        )}

        {tahap === 'selesai_rekam' && (
          <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-6 text-center">
            <p className="font-display text-lg font-semibold text-moss-800 mb-1">Wajah berhasil direkam</p>
            <p className="text-sm text-ink/60 mb-5">Data wajah kamu siap disimpan bersama data pendaftaran.</p>
            {errorMsg && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2 mb-4">{errorMsg}</p>}
            <div className="flex gap-3">
              <button onClick={ulangiRekam} className="flex-1 border border-ink/15 font-medium rounded-lg py-2.5 hover:bg-ink/5 transition-colors">
                Rekam Ulang
              </button>
              <button onClick={simpanPendaftaran} className="flex-1 bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors">
                Simpan Pendaftaran
              </button>
            </div>
          </div>
        )}

        {tahap === 'menyimpan' && (
          <p className="text-center text-ink/60 font-mono text-sm py-8">Menyimpan pendaftaran…</p>
        )}

        {tahap === 'sukses' && (
          <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-6 text-center">
            <p className="font-display text-lg font-semibold text-moss-800 mb-1">Pendaftaran berhasil</p>
            <p className="text-sm text-ink/60 mb-5">Sekarang kamu bisa absen otomatis lewat pengenalan wajah.</p>
            <button
              onClick={() => navigate('/absen')}
              className="w-full bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors"
            >
              Ke Halaman Absen
            </button>
          </div>
        )}

        {tahap === 'error' && (
          <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-5 text-clay text-sm text-center">
            {errorMsg}
            <button onClick={mulaiRekamWajah} className="block mx-auto mt-3 underline font-medium">Coba lagi</button>
          </div>
        )}

        {tahap === 'form' && (
          <p className="text-xs text-ink/40 text-center mt-6 font-mono">
            <Link to="/absen" className="underline">Kembali ke halaman absen</Link>
          </p>
        )}
      </div>
    </div>
  )
}
