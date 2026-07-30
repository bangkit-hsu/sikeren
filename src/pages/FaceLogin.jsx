import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  collection, getDocs, query, where, doc, getDoc, addDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext.jsx'
import {
  muatModelWajah, nyalakanKamera, matikanKamera, tangkapFotoDariVideo,
  ambilDescriptorDariVideo, cariKecocokanTerbaik,
} from '../utils/face'
import { hitungJarakMeter, ambilLokasiSaatIni } from '../utils/geo'
import { formatTanggal, formatJam } from '../utils/date'
import { KETERANGAN_LUAR, KETERANGAN_OTOMATIS_SESUAI, LABEL_KETERANGAN } from '../utils/keterangan'
import CincinPemindai from '../components/CincinPemindai.jsx'

const BATAS_WAKTU_MS = 3000
const JEDA_DETEKSI_MS = 350

export default function FaceLogin() {
  const { user, loginDenganWajah, logout } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const daftarPegawaiRef = useRef([])
  const berhentiRef = useRef(false)

  // menyiapkan | memindai | tidak_dikenali | dikenali | mengecek_lokasi |
  // siap_absen | sudah_absen | mengirim | sukses | error
  const [tahap, setTahap] = useState('menyiapkan')
  const [pegawaiDikenali, setPegawaiDikenali] = useState(null)
  const [fotoTertangkap, setFotoTertangkap] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [lokasiKantor, setLokasiKantor] = useState(null)
  const [posisi, setPosisi] = useState(null)
  const [jarak, setJarak] = useState(null)
  const [keterangan, setKeterangan] = useState('')
  const [absenTersimpan, setAbsenTersimpan] = useState(null)
  const [placeholderTidakApelId, setPlaceholderTidakApelId] = useState(null)

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
    setPosisi(null)
    setJarak(null)
    setKeterangan('')
    setPlaceholderTidakApelId(null)
    setFotoTertangkap(null)
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
          const foto = tangkapFotoDariVideo(videoRef.current)
          matikanKamera(streamRef.current)
          setFotoTertangkap(foto)
          setPegawaiDikenali(cocok.pegawai)
          setTahap('dikenali')
          loginDenganWajah(cocok.pegawai)
          setTimeout(() => lanjutkanSetelahDikenali(cocok.pegawai), 700)
          return
        }
      }
    } catch {
      // frame gagal diproses, lanjut coba frame berikutnya
    }
    setTimeout(() => pindai(waktuMulai), JEDA_DETEKSI_MS)
  }

  async function lanjutkanSetelahDikenali(pegawai) {
    const hariIni = formatTanggal()
    const qAbsen = query(
      collection(db, 'absensi'),
      where('uid', '==', pegawai.id),
      where('tanggal', '==', hariIni),
    )
    const snapAbsen = await getDocs(qAbsen)
    if (!snapAbsen.empty) {
      const docSnap = snapAbsen.docs[0]
      const data = docSnap.data()
      // Placeholder "Tidak Apel" otomatis bukan absen sungguhan — tetap lanjutkan proses absen.
      if (data.status === 'tidak_apel' && data.otomatis) {
        setPlaceholderTidakApelId(docSnap.id)
        cekLokasi()
        return
      }
      setAbsenTersimpan(data)
      setTahap('sudah_absen')
      return
    }
    cekLokasi()
  }

  async function cekLokasi() {
    setTahap('mengecek_lokasi')
    setErrorMsg('')
    try {
      const [lokasiSnap, pos] = await Promise.all([
        getDoc(doc(db, 'settings', 'lokasi')),
        ambilLokasiSaatIni(),
      ])
      const lokasi = lokasiSnap.exists() ? lokasiSnap.data() : null
      setLokasiKantor(lokasi)
      setPosisi(pos)
      if (lokasi) {
        setJarak(hitungJarakMeter(pos.lat, pos.lng, lokasi.lat, lokasi.lng))
      }
      setTahap('siap_absen')
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.')
      setTahap('siap_absen')
    }
  }

  const sesuaiLokasi = lokasiKantor && jarak !== null ? jarak <= lokasiKantor.radius : null

  async function catatAbsen() {
    if (sesuaiLokasi === false && !keterangan) return
    setTahap('mengirim')
    try {
      const now = new Date()
      const data = {
        uid: pegawaiDikenali.id,
        nama: pegawaiDikenali.nama,
        nip: pegawaiDikenali.nip || '',
        bagian: pegawaiDikenali.bagian || '',
        tanggal: formatTanggal(now),
        jam: formatJam(now),
        status: sesuaiLokasi ? 'sesuai' : 'luar',
        keterangan: sesuaiLokasi ? KETERANGAN_OTOMATIS_SESUAI : keterangan,
        lat: posisi.lat,
        lng: posisi.lng,
        jarakMeter: jarak !== null ? Math.round(jarak) : null,
        dibuat: serverTimestamp(),
      }
      await addDoc(collection(db, 'absensi'), data)
      if (placeholderTidakApelId) {
        await deleteDoc(doc(db, 'absensi', placeholderTidakApelId))
      }
      setAbsenTersimpan(data)
      setTahap('sukses')
    } catch (err) {
      setErrorMsg('Gagal menyimpan absen: ' + err.message)
      setTahap('siap_absen')
    }
  }

  function cobaLagi() {
    matikanKamera(streamRef.current)
    logout()
    mulai()
  }

  function selesai() {
    logout()
    mulai()
  }

  if (user && tahap !== 'dikenali' && tahap !== 'mengecek_lokasi' && tahap !== 'siap_absen'
      && tahap !== 'mengirim' && tahap !== 'sukses' && tahap !== 'sudah_absen') {
    return <Navigate to={user.role === 'admin' ? '/admin/rekap' : '/pegawai/absensi'} replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-xs font-mono uppercase tracking-wide text-gold-600">e-Apel · Apel Pagi</p>
          <h1 className="font-display font-semibold text-2xl mt-1">Absensi Wajah</h1>
          <p className="text-ink/60 text-sm mt-1">Posisikan wajah di dalam bingkai. Kamera mengenali otomatis dalam 3 detik.</p>
        </div>

        {/* Kamera bulat, tetap tampil di bagian atas selama proses berlangsung */}
        <div className="relative aspect-square w-52 sm:w-60 mx-auto rounded-full overflow-hidden bg-ink border border-ink/10">
          {fotoTertangkap ? (
            <img src={fotoTertangkap} alt="Wajah yang dikenali" className="w-full h-full object-cover rounded-full" />
          ) : (
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover scale-x-[-1] rounded-full" />
          )}
          {tahap === 'memindai' && (
            <CincinPemindai className="absolute inset-0 w-full h-full pointer-events-none" />
          )}
          {tahap === 'menyiapkan' && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/60 text-paper text-sm font-mono rounded-full">
              Menyiapkan kamera…
            </div>
          )}
          {tahap === 'tidak_dikenali' && (
            <div className="absolute inset-0 flex items-center justify-center bg-clay/80 text-paper text-sm font-mono text-center px-4 rounded-full">
              Wajah tidak dikenali
            </div>
          )}
        </div>

        {(tahap === 'dikenali' || tahap === 'mengecek_lokasi' || tahap === 'siap_absen' || tahap === 'mengirim' || tahap === 'sukses' || tahap === 'sudah_absen') && pegawaiDikenali && (
          <p className="text-center font-display font-semibold mt-4">
            Wajah dikenali : {pegawaiDikenali.nama}
          </p>
        )}

        {/* Informasi & aksi tampil di bawah kamera */}
        <div className="mt-5">
          {tahap === 'tidak_dikenali' && (
            <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-5 text-center">
              <p className="text-clay font-medium mb-4">Wajah tidak dikenali dalam 3 detik.</p>
              <div className="flex gap-3">
                <button onClick={cobaLagi} className="flex-1 bg-ink text-paper font-medium rounded-lg py-2.5 hover:bg-ink/80 transition-colors">
                  Coba Lagi
                </button>
                <button onClick={() => navigate('/daftar-wajah')} className="flex-1 bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors">
                  Daftar Data
                </button>
              </div>
            </div>
          )}

          {tahap === 'mengecek_lokasi' && (
            <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-6 text-center">
              <p className="font-display font-semibold mb-1">{pegawaiDikenali?.nama}</p>
              <p className="text-sm text-ink/60 font-mono">Mengecek titik koordinat GPS…</p>
            </div>
          )}

          {tahap === 'sudah_absen' && absenTersimpan && (
            <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-6">
              <p className="text-sm text-moss-800 font-medium mb-1">{pegawaiDikenali?.nama} sudah absen hari ini</p>
              <p className="font-display text-xl">{absenTersimpan.jam}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className={`px-2.5 py-1 rounded-full font-medium ${absenTersimpan.status === 'sesuai' ? 'bg-moss-700 text-paper' : 'bg-clay text-paper'}`}>
                  {absenTersimpan.status === 'sesuai' ? 'Berada Sesuai Lokasi' : 'Berada Diluar Lokasi'}
                </span>
                {absenTersimpan.keterangan && (
                  <span className="px-2.5 py-1 rounded-full bg-sand font-medium">
                    {LABEL_KETERANGAN[absenTersimpan.keterangan] || absenTersimpan.keterangan}
                  </span>
                )}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => navigate('/pegawai/riwayat')} className="flex-1 border border-ink/15 font-medium rounded-lg py-2.5 hover:bg-ink/5 transition-colors">
                  Lihat Riwayat Saya
                </button>
                <button onClick={selesai} className="flex-1 bg-ink text-paper font-medium rounded-lg py-2.5 hover:bg-ink/80 transition-colors">
                  Selesai
                </button>
              </div>
            </div>
          )}

          {(tahap === 'siap_absen' || tahap === 'mengirim') && (
            <div className="space-y-4">
              {!lokasiKantor && (
                <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-5 text-clay text-sm text-center">
                  Area lokasi kantor belum diatur oleh admin. Hubungi admin terlebih dahulu.
                </div>
              )}

              {errorMsg && (
                <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-4 text-clay text-sm text-center">
                  {errorMsg}
                </div>
              )}

              {lokasiKantor && posisi && (
                <div className={`rounded-xl2 border p-5 ${sesuaiLokasi ? 'bg-moss-50 border-moss-200' : 'bg-clay/10 border-clay/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-mono uppercase tracking-wide ${sesuaiLokasi ? 'text-moss-700' : 'text-clay'}`}>
                      Status Lokasi
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${sesuaiLokasi ? 'bg-moss-700 text-paper' : 'bg-clay text-paper'}`}>
                      {sesuaiLokasi ? 'Berada Sesuai Lokasi' : 'Berada Diluar Lokasi'}
                    </span>
                  </div>
                  <p className="text-sm text-ink/70">
                    <span className="font-semibold text-ink">Lokasi Apel :</span>{' '}
                    <span className="font-medium">{lokasiKantor.nama}</span>
                  </p>
                </div>
              )}

              {lokasiKantor && posisi && sesuaiLokasi && (
                <p className="text-sm text-ink/60">
                  Keterangan: <span className="font-medium text-ink">Apel Pagi</span> (otomatis)
                </p>
              )}

              {lokasiKantor && posisi && !sesuaiLokasi && (
                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Pilih Keterangan</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {KETERANGAN_LUAR.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setKeterangan(opt.value)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                          keterangan === opt.value ? 'bg-ink text-paper border-ink' : 'border-ink/15 hover:bg-ink/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={cekLokasi}
                  disabled={tahap === 'mengirim'}
                  className="flex-1 border border-ink/15 font-medium rounded-lg py-3 hover:bg-ink/5 transition-colors disabled:opacity-50"
                >
                  Sync Lokasi
                </button>
                <button
                  onClick={catatAbsen}
                  disabled={tahap === 'mengirim' || !lokasiKantor || !posisi || (!sesuaiLokasi && !keterangan)}
                  className="flex-1 bg-moss-700 text-paper font-medium rounded-lg py-3 hover:bg-moss-800 transition-colors disabled:opacity-50"
                >
                  {tahap === 'mengirim' ? 'Menyimpan…' : 'Absen'}
                </button>
              </div>
            </div>
          )}

          {tahap === 'sukses' && absenTersimpan && (
            <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-6 text-center">
              <p className="font-display text-lg font-semibold text-moss-800 mb-1">Absen berhasil dicatat</p>
              <p className="text-sm text-ink/60 mb-1">{pegawaiDikenali?.nama} · {absenTersimpan.jam}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${absenTersimpan.status === 'sesuai' ? 'bg-moss-700 text-paper' : 'bg-clay text-paper'}`}>
                {absenTersimpan.status === 'sesuai' ? 'Berada Sesuai Lokasi' : 'Berada Diluar Lokasi'}
              </span>
              <div className="flex gap-3 mt-5">
                <button onClick={() => navigate('/pegawai/riwayat')} className="flex-1 border border-ink/15 font-medium rounded-lg py-2.5 hover:bg-ink/5 transition-colors">
                  Lihat Riwayat Saya
                </button>
                <button onClick={selesai} className="flex-1 bg-ink text-paper font-medium rounded-lg py-2.5 hover:bg-ink/80 transition-colors">
                  Selesai
                </button>
              </div>
            </div>
          )}

          {tahap === 'error' && (
            <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-5 text-clay text-sm text-center">
              {errorMsg}
              <button onClick={cobaLagi} className="block mx-auto mt-3 underline font-medium">Coba lagi</button>
            </div>
          )}

          {(tahap === 'menyiapkan' || tahap === 'memindai' || tahap === 'tidak_dikenali' || tahap === 'error') && (
            <p className="text-xs text-ink/40 text-center mt-4 font-mono">
              <Link to="/login" className="underline">Masuk pakai NIP &amp; Password</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
