import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { namaBulan, hitungHariKerja } from '../../utils/date'

export default function RekapPage() {
  const now = new Date()
  const [tahun, setTahun] = useState(now.getFullYear())
  const [bulan, setBulan] = useState(now.getMonth())
  const [pegawai, setPegawai] = useState([])
  const [absensi, setAbsensi] = useState([])
  const [hariLibur, setHariLibur] = useState(new Set())
  const [memuat, setMemuat] = useState(true)
  const [cari, setCari] = useState('')

  useEffect(() => {
    async function load() {
      setMemuat(true)
      const usersSnap = await getDocs(collection(db, 'users'))
      const users = usersSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.role === 'pegawai')
      setPegawai(users)

      const bulanStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}`
      const absensiSnap = await getDocs(collection(db, 'absensi'))
      const data = absensiSnap.docs.map((d) => d.data()).filter((a) => a.tanggal.startsWith(bulanStr))
      setAbsensi(data)

      const liburSnap = await getDoc(doc(db, 'settings', 'libur'))
      setHariLibur(new Set(liburSnap.exists() ? liburSnap.data().tanggal || [] : []))
      setMemuat(false)
    }
    load()
  }, [tahun, bulan])

  const hariKerja = useMemo(() => hitungHariKerja(tahun, bulan, hariLibur), [tahun, bulan, hariLibur])

  const rekap = useMemo(() => {
    return pegawai
      .map((p) => {
        const milik = absensi.filter((a) => a.uid === p.id)
        return {
          ...p,
          sesuai: milik.filter((a) => a.status === 'sesuai').length,
          luar: milik.filter((a) => a.status === 'luar').length,
          gabungan: milik.filter((a) => a.keterangan === 'gabungan').length,
          senam: milik.filter((a) => a.keterangan === 'senam').length,
          wfh: milik.filter((a) => a.keterangan === 'wfh').length,
          total: milik.length,
        }
      })
      .filter((p) =>
        p.nama.toLowerCase().includes(cari.toLowerCase()) ||
        (p.nip || '').includes(cari) ||
        (p.bagian || '').toLowerCase().includes(cari.toLowerCase()),
      )
  }, [pegawai, absensi, cari])

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl">Rekap Absensi Pegawai</h1>
          <p className="text-ink/60 text-sm">Akumulasi kehadiran per periode · {hariKerja} hari kerja bulan ini</p>
        </div>
        <div className="flex gap-2">
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
            {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
          </select>
          <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <input
        value={cari}
        onChange={(e) => setCari(e.target.value)}
        placeholder="Cari NIP, nama, atau bagian…"
        className="mb-4 w-full max-w-xs rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
      />

      {memuat ? (
        <p className="text-ink/50 font-mono text-sm">Memuat…</p>
      ) : (
        <div className="border border-ink/10 rounded-xl2 overflow-x-auto">
          <table className="w-full text-sm min-w-[860px]">
            <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Bagian</th>
                <th className="px-4 py-3">Sesuai Lokasi</th>
                <th className="px-4 py-3">Diluar Lokasi</th>
                <th className="px-4 py-3">Absen Gabungan</th>
                <th className="px-4 py-3">Senam</th>
                <th className="px-4 py-3">WFH</th>
                <th className="px-4 py-3">Total Hadir</th>
                <th className="px-4 py-3">% dari Hari Kerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {rekap.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono">{p.nip}</td>
                  <td className="px-4 py-3 font-medium">{p.nama}</td>
                  <td className="px-4 py-3">{p.bagian}</td>
                  <td className="px-4 py-3">{p.sesuai}</td>
                  <td className="px-4 py-3">{p.luar}</td>
                  <td className="px-4 py-3">{p.gabungan}</td>
                  <td className="px-4 py-3">{p.senam}</td>
                  <td className="px-4 py-3">{p.wfh}</td>
                  <td className="px-4 py-3 font-semibold">{p.total}</td>
                  <td className="px-4 py-3 font-mono">
                    {hariKerja > 0 ? Math.round((p.total / hariKerja) * 100) : 0}%
                  </td>
                </tr>
              ))}
              {rekap.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-6 text-center text-ink/40">Belum ada pegawai / data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
