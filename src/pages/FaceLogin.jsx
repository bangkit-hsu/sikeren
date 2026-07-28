import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext.jsx'
import {
  muatModelWajah, nyalakanKamera, matikanKamera,
  ambilDescriptorDariVideo, cariKecocokanTerbaik,
} from '../utils/face'

const BATAS_WAKTU_MS = 3000
const JEDA_DETEKSI_MS = 350

export default function FaceLogin() {
  const { user, loginDenganWajah } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const daftarPegawaiRef = useRef([])
  const berhentiRef = useRef(false)

  const [tahap, setTahap] = useState('menyiapkan') // menyiapkan | memindai | tidak_dikenali | dikenali | error
  const [namaDikenali, setNamaDikenali] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    berhentiRef.current = false
    mulai()
    return () => {
      berhentiRef.current = true
      matikanKamera(streamRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function mulai() {
    setTahap('menyiapkan')
    setErrorMsg('')
    try {
      const [, snap] = await Promise.all([
        muatModelWajah(),
        getDocs(query(collection(db, 'users'), where('role', '==', 'pegawai'))),
      ])
      daftarPegawaiRef.current = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => Array.isArray(p.faceDescriptor) && p.faceDescriptor.length === 128)

      streamRef.current = await nyalakanKamera(videoRef.current)
      setTahap('memindai')
      pindai(Date.now())
    } catch (err) {
      setTahap('error')
      setErrorMsg(err.message || 'Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan.')
    }
  }

  async function pindai(waktuMulai) {
    if (berhentiRef.current) return
    if (Date.now() - waktuMulai > BATAS_WAKTU_MS) {
      setTahap('tidak_dikenali')
      return
    }
    try {
      const descriptor = await ambilDescriptorDariVideo(videoRef.current)
      if (descriptor) {
        const cocok = cariKecocokanTerbaik(descriptor, daftarPegawaiRef.current)
        if (cocok) {
          setNamaDikenali(cocok.pegawai.nama)
          setTahap('dikenali')
          matikanKamera(streamRef.current)
          loginDenganWajah(cocok.pegawai)
          setTimeout(() => navigate('/pegawai/absensi'), 700)
          return
        }
      }
    } catch {
      // frame gagal diproses, lanjut coba frame berikutnya
    }
    setTimeout(() => pindai(waktuMulai), JEDA_DETEKSI_MS)
  }

  function cobaLagi() {
    matikanKamera(streamRef.current)
    mulai()
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/rekap' : '/pegawai/absensi'} replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="font-display font-semibold text-2xl">e-Absen</h1>
          <p className="text-ink/60 text-sm mt-1">Arahkan wajah ke kamera untuk absen otomatis</p>
        </div>

        <div className="relative aspect-square rounded-xl2 overflow-hidden bg-ink border border-ink/10">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
          {tahap === 'memindai' && (
            <div className="absolute inset-6 rounded-full border-2 border-moss-400 radar-ring pointer-events-none" />
          )}
          {(tahap === 'menyiapkan') && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/60 text-paper text-sm font-mono">
              Menyiapkan kamera…
            </div>
          )}
          {tahap === 'dikenali' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-moss-700/85 text-paper text-center px-4">
              <p className="font-display text-lg font-semibold">Wajah dikenali</p>
              <p className="text-sm mt-1">{namaDikenali}</p>
            </div>
          )}
        </div>

        {tahap === 'tidak_dikenali' && (
          <div className="mt-5 bg-clay/10 border border-clay/30 rounded-xl2 p-5 text-center">
            <p className="text-clay font-medium mb-4">Wajah tidak dikenali dalam 3 detik.</p>
            <div className="flex gap-3">
              <button
                onClick={cobaLagi}
                className="flex-1 bg-ink text-paper font-medium rounded-lg py-2.5 hover:bg-ink/80 transition-colors"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => navigate('/daftar-wajah')}
                className="flex-1 bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors"
              >
                Daftar Data
              </button>
            </div>
          </div>
        )}

        {tahap === 'error' && (
          <div className="mt-5 bg-clay/10 border border-clay/30 rounded-xl2 p-5 text-clay text-sm text-center">
            {errorMsg}
            <button onClick={cobaLagi} className="block mx-auto mt-3 underline font-medium">Coba lagi</button>
          </div>
        )}

        <p className="text-xs text-ink/40 text-center mt-6 font-mono">
          <Link to="/login" className="underline">Masuk pakai NIP &amp; Password</Link>
        </p>
      </div>
    </div>
  )
}
