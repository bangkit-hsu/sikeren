import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { formatTanggal, apakahHariAbsen } from '../../utils/date'
import { generateTidakApelUntukTanggal } from '../../utils/absensiOtomatis'
import { unduhExcel } from '../../utils/excel'
import { LABEL_KETERANGAN, LABEL_STATUS } from '../../utils/keterangan'

export default function AbsenHarianPage() {
  const [tanggal, setTanggal] = useState(formatTanggal())
  const [memproses, setMemproses] = useState(false)
  const [mengunduh, setMengunduh] = useState(false)
  const [hasil, setHasil] = useState(null) // { dilewati, pegawaiDitandai } | null
  const [error, setError] = useState('')
  const [overrideHariAbsen, setOverrideHariAbsen] = useState(null) // null = belum dimuat
  const [daftarHadir, setDaftarHadir] = useState(null)
  const [memuatHadir, setMemuatHadir] = useState(false)

  useEffect(() => {
    async function muat() {
      const snap = await getDoc(doc(db, 'settings', 'hariAbsen'))
      setOverrideHariAbsen(snap.exists() ? snap.data().override || {} : {})
    }
    muat()
  }, [])

  useEffect(() => {
    if (!tanggal) return
    async function muatHadir() {
      setMemuatHadir(true)
      try {
        const snap = await getDocs(query(collection(db, 'absensi'), where('tanggal', '==', tanggal)))
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((a) => a.status === 'sesuai' || a.status === 'luar')
          .sort((a, b) => (a.jam || '').localeCompare(b.jam || ''))
        setDaftarHadir(data)
      } catch {
        setDaftarHadir([])
      } finally {
        setMemuatHadir(false)
      }
    }
    muatHadir()
  }, [tanggal])

  const tanggalAdalahHariAbsen = overrideHariAbsen !== null && tanggal
    ? apakahHariAbsen(tanggal, overrideHariAbsen)
    : true // sambil memuat, jangan tampilkan peringatan dulu

  async function generate() {
    if (!tanggal) return
    setMemproses(true)
    setError('')
    setHasil(null)
    try {
      const hariAbsenSnap = await getDoc(doc(db, 'settings', 'hariAbsen'))
      const override = hariAbsenSnap.exists() ? hariAbsenSnap.data().override || {} : {}
      const hasilGenerate = await generateTidakApelUntukTanggal(tanggal, override)
      setHasil(hasilGenerate)
      if (!hasilGenerate.dilewati) {
        // Closing Apel menandakan sesi absen apel tanggal ini resmi ditutup —
        // setelah ini pegawai yang belum absen akan melihat "Jam Absen Apel Sudah Selesai".
        await setDoc(doc(db, 'settings', 'penutupanApel'), {
          tanggal,
          ditutupPada: serverTimestamp(),
        })
      }
    } catch (err) {
      setError('Gagal memproses: ' + err.message)
    } finally {
      setMemproses(false)
    }
  }

  async function downloadExcel() {
    if (!tanggal) return
    setMengunduh(true)
    setError('')
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'pegawai')))
      const pegawai = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

      const absensiSnap = await getDocs(query(collection(db, 'absensi'), where('tanggal', '==', tanggal)))
      const absensiPerUid = new Map(absensiSnap.docs.map((d) => [d.data().uid, d.data()]))

      const baris = pegawai
        .sort((a, b) => a.nama.localeCompare(b.nama))
        .map((p) => {
          const a = absensiPerUid.get(p.id)
          return {
            NIP: p.nip,
            Nama: p.nama,
            Bagian: p.bagian,
            Jabatan: p.jabatan,
            Tanggal: tanggal,
            Jam: a?.jam || '-',
            Status: a ? (LABEL_STATUS[a.status] || a.status) : 'Belum Absen',
            Keterangan: a?.keterangan ? (LABEL_KETERANGAN[a.keterangan] || a.keterangan) : '-',
          }
        })
      unduhExcel(`Absen-Harian-${tanggal}.xlsx`, baris, 'Absen Harian')
    } catch (err) {
      setError('Gagal mengunduh: ' + err.message)
    } finally {
      setMengunduh(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display font-semibold text-2xl mb-1">Apel Harian</h1>
      <p className="text-xs text-ink/40 mb-6 font-mono">
        Pegawai baru bisa absen mulai pukul 07:50 WITA. Klik Closing Apel menutup sesi absen apel untuk tanggal yang dipilih — pegawai yang belum absen setelah itu akan melihat "Jam Absen Apel Sudah Selesai".
      </p>

      <div className="bg-white/60 border border-ink/10 rounded-xl2 p-5 flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => { setTanggal(e.target.value); setHasil(null); setError('') }}
            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white font-mono text-sm"
          />
        </div>
        <button
          onClick={generate}
          disabled={memproses || !tanggal || !tanggalAdalahHariAbsen}
          className="bg-moss-700 text-paper font-medium rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors disabled:opacity-50"
        >
          {memproses ? 'Memproses…' : 'Closing Apel'}
        </button>
        <button
          onClick={downloadExcel}
          disabled={mengunduh || !tanggal}
          className="border border-ink/15 font-medium rounded-lg px-4 py-2 hover:bg-ink/5 transition-colors disabled:opacity-50"
        >
          {mengunduh ? 'Mengunduh…' : 'Download Excel'}
        </button>
      </div>

      {!tanggalAdalahHariAbsen && (
        <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-4 text-clay text-sm mb-4">
          Tanggal {tanggal} bukan Hari Absen (cek/atur di menu <span className="font-medium">Hari Absensi Apel</span>), jadi tombol Closing Apel dinonaktifkan untuk tanggal ini.
        </div>
      )}

      {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {hasil?.dilewati && (
        <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-5 text-clay text-sm">
          Tanggal {tanggal} bukan Hari Absen (lihat menu Hari Absensi Apel), sehingga tidak diproses.
        </div>
      )}

      {hasil && !hasil.dilewati && hasil.pegawaiDitandai.length === 0 && (
        <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-5 text-moss-800 text-sm">
          Semua pegawai sudah punya data absen pada tanggal {tanggal}. Tidak ada yang ditandai Tidak Apel. Sesi absen apel tanggal ini sudah ditutup.
        </div>
      )}

      {hasil && !hasil.dilewati && hasil.pegawaiDitandai.length > 0 && (
        <div>
          <p className="text-sm text-ink/60 mb-3">
            <span className="font-semibold text-clay">{hasil.pegawaiDitandai.length} pegawai</span> ditandai
            <span className="font-medium text-ink"> Tidak Apel</span> untuk tanggal {tanggal}. Sesi absen apel tanggal ini sudah ditutup.
          </p>
          <ul className="border border-ink/10 rounded-xl2 divide-y divide-ink/10 overflow-hidden">
            {hasil.pegawaiDitandai.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-2.5 bg-white/60">
                <div>
                  <p className="text-sm font-medium">{p.nama}</p>
                  <p className="text-xs text-ink/50 font-mono">NIP {p.nip} · {p.bagian}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-ink/10 text-ink/70 font-medium">Tidak Apel</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <p className="font-display font-semibold mb-1">ASN yang Sudah Apel — {tanggal}</p>
        <p className="text-ink/60 text-sm mb-3">Foto diambil otomatis dari kamera saat pemindaian wajah, untuk verifikasi keaslian orang yang absen.</p>
        {memuatHadir ? (
          <p className="text-ink/50 font-mono text-sm">Memuat…</p>
        ) : daftarHadir && daftarHadir.length > 0 ? (
          <ul className="border border-ink/10 rounded-xl2 divide-y divide-ink/10 overflow-hidden">
            {daftarHadir.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3 bg-white/60">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-ink border border-ink/10 shrink-0">
                  {a.foto ? (
                    <img src={a.foto} alt={a.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-paper/50 text-[9px] font-mono text-center leading-tight">Belum ada</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.nama}</p>
                  <p className="text-xs text-ink/50 font-mono truncate">NIP {a.nip || '—'} · {a.bagian || '—'} · Jam {a.jam || '—'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${a.status === 'sesuai' ? 'bg-moss-100 text-moss-800' : 'bg-clay/10 text-clay'}`}>
                  {a.status === 'sesuai' ? 'Sesuai Lokasi' : 'Diluar Lokasi'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bg-white/60 border border-ink/10 rounded-xl2 p-5 text-center text-ink/50 text-sm">
            Belum ada ASN yang apel pada tanggal {tanggal}.
          </div>
        )}
      </div>
    </div>
  )
}
