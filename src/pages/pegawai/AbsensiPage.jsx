import { useEffect, useState } from 'react'
import {
  doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext.jsx'
import { hitungJarakMeter, ambilLokasiSaatIni } from '../../utils/geo'
import { formatTanggal, formatJam, apelSudahMulai } from '../../utils/date'
import { KETERANGAN_LUAR, KETERANGAN_OTOMATIS_SESUAI, LABEL_KETERANGAN } from '../../utils/keterangan'

export default function AbsensiPage() {
  const { user } = useAuth()
  const [lokasiKantor, setLokasiKantor] = useState(null)
  const [posisi, setPosisi] = useState(null)
  const [jarak, setJarak] = useState(null)
  const [statusLokasi, setStatusLokasi] = useState('idle') // idle | mencari | siap | error
  const [errorMsg, setErrorMsg] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [sudahAbsenHariIni, setSudahAbsenHariIni] = useState(null)
  const [placeholderTidakApelId, setPlaceholderTidakApelId] = useState(null)
  const [mengirim, setMengirim] = useState(false)
  const [pesanSukses, setPesanSukses] = useState('')
  const [memuat, setMemuat] = useState(true)
  const [statusJadwal, setStatusJadwal] = useState('memeriksa') // memeriksa | ok | belum_mulai | sudah_selesai

  useEffect(() => {
    let timerId = null
    async function periksaJadwal() {
      if (!apelSudahMulai()) {
        setStatusJadwal('belum_mulai')
        timerId = setTimeout(periksaJadwal, 15000)
        return
      }
      try {
        const penutupSnap = await getDoc(doc(db, 'settings', 'penutupanApel'))
        if (penutupSnap.exists() && penutupSnap.data().tanggal === formatTanggal()) {
          setStatusJadwal('sudah_selesai')
          return
        }
      } catch {
        // kalau gagal cek, lanjutkan saja
      }
      setStatusJadwal('ok')
    }
    async function init() {
      setMemuat(true)
      await periksaJadwal()
      const lokasiSnap = await getDoc(doc(db, 'settings', 'lokasi'))
      if (lokasiSnap.exists()) setLokasiKantor(lokasiSnap.data())

      const hariIni = formatTanggal()
      const q = query(
        collection(db, 'absensi'),
        where('uid', '==', user.id),
        where('tanggal', '==', hariIni),
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const docSnap = snap.docs[0]
        const data = docSnap.data()
        // Placeholder "Tidak Apel" otomatis bukan absen sungguhan — biarkan pegawai tetap bisa absen.
        if (data.status === 'tidak_apel' && data.otomatis) {
          setPlaceholderTidakApelId(docSnap.id)
        } else {
          setSudahAbsenHariIni(data)
        }
      }
      setMemuat(false)
    }
    init()
    return () => { if (timerId) clearTimeout(timerId) }
  }, [user.id])

  async function cekLokasi() {
    setStatusLokasi('mencari')
    setErrorMsg('')
    try {
      const pos = await ambilLokasiSaatIni()
      setPosisi(pos)
      if (lokasiKantor) {
        const d = hitungJarakMeter(pos.lat, pos.lng, lokasiKantor.lat, lokasiKantor.lng)
        setJarak(d)
      }
      setStatusLokasi('siap')
    } catch (err) {
      setStatusLokasi('error')
      setErrorMsg(err.message || 'Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.')
    }
  }

  const sesuaiLokasi = lokasiKantor && jarak !== null ? jarak <= lokasiKantor.radius : null

  async function handleAbsen() {
    if (sesuaiLokasi === false && !keterangan) return
    setMengirim(true)
    try {
      const penutupSnap = await getDoc(doc(db, 'settings', 'penutupanApel'))
      if (penutupSnap.exists() && penutupSnap.data().tanggal === formatTanggal()) {
        setStatusJadwal('sudah_selesai')
        setMengirim(false)
        return
      }
    } catch {
      // kalau gagal cek, lanjutkan saja
    }
    try {
      const now = new Date()
      const data = {
        uid: user.id,
        nama: user.nama,
        nip: user.nip || '',
        bagian: user.bagian || '',
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
      setSudahAbsenHariIni(data)
      setPesanSukses('Absen apel berhasil dicatat.')
    } catch (err) {
      setErrorMsg('Gagal menyimpan absen. Coba lagi. (' + err.message + ')')
    } finally {
      setMengirim(false)
    }
  }

  if (memuat) return <p className="text-ink/50 font-mono text-sm">Memuat…</p>

  if (statusJadwal === 'belum_mulai') {
    return (
      <div className="max-w-lg">
        <h1 className="font-display font-semibold text-2xl mb-6">Absensi Apel</h1>
        <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-6 text-center">
          <p className="font-display font-semibold text-lg text-moss-800 mb-1">Jam Absen Apel Belum Dimulai</p>
          <p className="text-sm text-ink/60">Absen apel bisa dilakukan mulai pukul <span className="font-medium text-ink">07:50 WITA</span>. Halaman ini akan otomatis memeriksa ulang secara berkala.</p>
        </div>
      </div>
    )
  }

  if (statusJadwal === 'sudah_selesai') {
    return (
      <div className="max-w-lg">
        <h1 className="font-display font-semibold text-2xl mb-6">Absensi Apel</h1>
        <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-6 text-center">
          <p className="font-display font-semibold text-lg text-clay mb-1">Jam Absen Apel Sudah Selesai</p>
          <p className="text-sm text-ink/60">Admin sudah menutup sesi absen apel hari ini. Kalau ini keliru, hubungi admin.</p>
        </div>
      </div>
    )
  }

  if (!lokasiKantor) {
    return (
      <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-6 text-clay">
        Area lokasi kantor belum diatur oleh admin. Hubungi admin untuk mengatur titik koordinat & radius terlebih dahulu.
      </div>
    )
  }

  if (sudahAbsenHariIni) {
    return (
      <div className="max-w-lg">
        <h1 className="font-display font-semibold text-2xl mb-6">Absensi Apel</h1>
        <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-6">
          <p className="text-sm text-moss-800 font-medium mb-1">Sudah absen hari ini</p>
          <p className="font-display text-xl">{sudahAbsenHariIni.jam}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className={`px-2.5 py-1 rounded-full font-medium ${sudahAbsenHariIni.status === 'sesuai' ? 'bg-moss-700 text-paper' : 'bg-clay text-paper'}`}>
              {sudahAbsenHariIni.status === 'sesuai' ? 'Berada Sesuai Lokasi' : 'Berada Diluar Lokasi'}
            </span>
            {sudahAbsenHariIni.keterangan && (
              <span className="px-2.5 py-1 rounded-full bg-sand font-medium">
                {LABEL_KETERANGAN[sudahAbsenHariIni.keterangan] || sudahAbsenHariIni.keterangan}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display font-semibold text-2xl mb-1">Absensi Apel</h1>
      <p className="text-ink/60 text-sm mb-1">
        {user.nama} · <span className="font-mono">NIP {user.nip}</span> · {user.bagian}
      </p>
      <p className="text-ink/60 text-sm mb-6">
        Lokasi apel: <span className="font-medium text-ink">{lokasiKantor.nama}</span>
      </p>

      {statusLokasi === 'idle' && (
        <button
          onClick={cekLokasi}
          className="w-full bg-moss-700 text-paper font-medium rounded-xl2 py-4 hover:bg-moss-800 transition-colors"
        >
          Cek Lokasi Saya
        </button>
      )}

      {statusLokasi === 'mencari' && (
        <div className="flex items-center gap-3 text-ink/60 font-mono text-sm py-8 justify-center">
          <div className="w-3 h-3 rounded-full bg-moss-600 radar-ring" />
          Mencari koordinat GPS…
        </div>
      )}

      {statusLokasi === 'error' && (
        <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-5 text-clay text-sm">
          {errorMsg}
          <button onClick={cekLokasi} className="block mt-3 underline font-medium">Coba lagi</button>
        </div>
      )}

      {statusLokasi === 'siap' && (
        <div className="space-y-5">
          <div className={`rounded-xl2 border p-6 ${sesuaiLokasi ? 'bg-moss-50 border-moss-200' : 'bg-clay/10 border-clay/30'}`}>
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

          {sesuaiLokasi && (
            <p className="text-sm text-ink/60">
              Keterangan: <span className="font-medium text-ink">Apel Pagi</span> (otomatis)
            </p>
          )}

          {!sesuaiLokasi && (
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">
                Pilih Keterangan
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {KETERANGAN_LUAR.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setKeterangan(opt.value)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      keterangan === opt.value
                        ? 'bg-ink text-paper border-ink'
                        : 'border-ink/15 hover:bg-ink/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && <p className="text-sm text-clay">{errorMsg}</p>}

          <div className="flex gap-3">
            <button
              onClick={cekLokasi}
              disabled={mengirim}
              className="flex-1 border border-ink/15 font-medium rounded-xl2 py-3.5 hover:bg-ink/5 transition-colors disabled:opacity-50"
            >
              Sync Lokasi
            </button>
            <button
              onClick={handleAbsen}
              disabled={mengirim || (!sesuaiLokasi && !keterangan)}
              className="flex-1 bg-moss-700 text-paper font-medium rounded-xl2 py-3.5 hover:bg-moss-800 transition-colors disabled:opacity-50"
            >
              {mengirim ? 'Menyimpan…' : 'Catat Absen Apel'}
            </button>
          </div>
        </div>
      )}

      {pesanSukses && <p className="text-sm text-moss-700 mt-4">{pesanSukses}</p>}
    </div>
  )
}
