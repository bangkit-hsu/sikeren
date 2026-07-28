import { useEffect, useMemo, useState } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext.jsx'
import { namaBulan, hitungHariKerja } from '../../utils/date'

const LABEL_KETERANGAN = { gabungan: 'Absen Gabungan', senam: 'Senam', wfh: 'WFH' }

export default function RiwayatPage() {
  const { user } = useAuth()
  const now = new Date()
  const [tahun, setTahun] = useState(now.getFullYear())
  const [bulan, setBulan] = useState(now.getMonth())
  const [absensi, setAbsensi] = useState([])
  const [hariLibur, setHariLibur] = useState(new Set())
  const [memuat, setMemuat] = useState(true)

  useEffect(() => {
    async function load() {
      setMemuat(true)
      const bulanStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}`
      const q = query(
        collection(db, 'absensi'),
        where('uid', '==', user.id),
      )
      const snap = await getDocs(q)
      const data = snap.docs
        .map((d) => d.data())
        .filter((a) => a.tanggal.startsWith(bulanStr))
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
      setAbsensi(data)

      const liburSnap = await getDoc(doc(db, 'settings', 'libur'))
      const liburList = liburSnap.exists() ? liburSnap.data().tanggal || [] : []
      setHariLibur(new Set(liburList))
      setMemuat(false)
    }
    load()
  }, [user.id, tahun, bulan])

  const hariKerja = useMemo(() => hitungHariKerja(tahun, bulan, hariLibur), [tahun, bulan, hariLibur])
  const jumlahSesuai = absensi.filter((a) => a.status === 'sesuai').length
  const jumlahLuar = absensi.filter((a) => a.status === 'luar').length

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl">Riwayat Absensi Saya</h1>
          <p className="text-ink/60 text-sm">
            <span className="font-mono">NIP {user.nip}</span> · {user.bagian}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={bulan}
            onChange={(e) => setBulan(Number(e.target.value))}
            className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>{namaBulan(i)}</option>
            ))}
          </select>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
          >
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/60 border border-ink/10 rounded-xl2 p-4">
          <p className="text-xs text-ink/50 font-mono">Hari Kerja</p>
          <p className="font-display text-2xl mt-1">{hariKerja}</p>
        </div>
        <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-4">
          <p className="text-xs text-moss-700 font-mono">Sesuai Lokasi</p>
          <p className="font-display text-2xl mt-1 text-moss-800">{jumlahSesuai}</p>
        </div>
        <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-4">
          <p className="text-xs text-clay font-mono">Diluar Lokasi</p>
          <p className="font-display text-2xl mt-1 text-clay">{jumlahLuar}</p>
        </div>
      </div>

      {memuat ? (
        <p className="text-ink/50 font-mono text-sm">Memuat…</p>
      ) : absensi.length === 0 ? (
        <p className="text-ink/50 text-sm">Belum ada data absen pada periode ini.</p>
      ) : (
        <div className="border border-ink/10 rounded-xl2 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jam</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {absensi.map((a, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-mono">{a.tanggal}</td>
                  <td className="px-4 py-3 font-mono">{a.jam}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.status === 'sesuai' ? 'bg-moss-700 text-paper' : 'bg-clay text-paper'}`}>
                      {a.status === 'sesuai' ? 'Sesuai Lokasi' : 'Diluar Lokasi'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.keterangan ? LABEL_KETERANGAN[a.keterangan] : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
