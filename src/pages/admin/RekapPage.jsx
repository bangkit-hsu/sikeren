import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { namaBulan, hitungHariKerja } from '../../utils/date'
import { unduhExcel } from '../../utils/excel'

export default function RekapPage() {
  const now = new Date()
  const [tahun, setTahun] = useState(now.getFullYear())
  const [bulan, setBulan] = useState(now.getMonth())
  const [pegawai, setPegawai] = useState([])
  const [absensi, setAbsensi] = useState([])
  const [overrideHariAbsen, setOverrideHariAbsen] = useState({})
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

      const hariAbsenSnap = await getDoc(doc(db, 'settings', 'hariAbsen'))
      const override = hariAbsenSnap.exists() ? hariAbsenSnap.data().override || {} : {}
      setOverrideHariAbsen(override)

      const bulanStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}`
      const absensiSnap = await getDocs(collection(db, 'absensi'))
      const data = absensiSnap.docs.map((d) => d.data()).filter((a) => a.tanggal.startsWith(bulanStr))
      setAbsensi(data)

      setMemuat(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahun, bulan])

  const hariKerja = useMemo(() => hitungHariKerja(tahun, bulan, overrideHariAbsen), [tahun, bulan, overrideHariAbsen])

  const rekap = useMemo(() => {
    return pegawai
      .map((p) => {
        const milik = absensi.filter((a) => a.uid === p.id)
        const hadir = milik.filter((a) => a.status !== 'tidak_apel')
        return {
          ...p,
          sesuai: milik.filter((a) => a.status === 'sesuai').length,
          luar: milik.filter((a) => a.status === 'luar').length,
          tidakApel: milik.filter((a) => a.status === 'tidak_apel').length,
          gabungan: milik.filter((a) => a.keterangan === 'gabungan').length,
          hariBesar: milik.filter((a) => a.keterangan === 'hari_besar').length,
          wfh: milik.filter((a) => a.keterangan === 'wfh').length,
          total: hadir.length,
        }
      })
      .filter((p) =>
        p.nama.toLowerCase().includes(cari.toLowerCase()) ||
        (p.nip || '').includes(cari) ||
        (p.bagian || '').toLowerCase().includes(cari.toLowerCase()) ||
        (p.jabatan || '').toLowerCase().includes(cari.toLowerCase()),
      )
  }, [pegawai, absensi, cari])

  function downloadExcel() {
    const baris = rekap.map((p) => ({
      NIP: p.nip,
      Nama: p.nama,
      Bagian: p.bagian,
      Jabatan: p.jabatan,
      'Sesuai Lokasi': p.sesuai,
      'Diluar Lokasi': p.luar,
      'Tidak Apel': p.tidakApel,
      'Apel Gabungan': p.gabungan,
      'Apel Hari Besar': p.hariBesar,
      WFH: p.wfh,
      'Total Hadir': p.total,
      'Hari Absen': hariKerja,
      '% Kehadiran': hariKerja > 0 ? Math.round((p.total / hariKerja) * 100) : 0,
    }))
    unduhExcel(`Rekap-Absen-${namaBulan(bulan)}-${tahun}.xlsx`, baris, 'Rekap Absen')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl">Rekap Absensi Pegawai</h1>
          <p className="text-ink/60 text-sm">Akumulasi kehadiran per periode · {hariKerja} Hari Absen bulan ini</p>
        </div>
        <div className="flex gap-2">
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
            {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
          </select>
          <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={downloadExcel}
            disabled={memuat || rekap.length === 0}
            className="rounded-lg bg-moss-700 text-paper text-sm font-medium px-4 py-2 hover:bg-moss-800 transition-colors disabled:opacity-50"
          >
            Download Excel
          </button>
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
          <table className="w-full text-sm min-w-[1060px]">
            <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Bagian</th>
                <th className="px-4 py-3">Jabatan</th>
                <th className="px-4 py-3">Sesuai Lokasi</th>
                <th className="px-4 py-3">Diluar Lokasi</th>
                <th className="px-4 py-3">Tidak Apel</th>
                <th className="px-4 py-3">Apel Gabungan</th>
                <th className="px-4 py-3">Apel Hari Besar</th>
                <th className="px-4 py-3">WFH</th>
                <th className="px-4 py-3">Total Hadir</th>
                <th className="px-4 py-3">% dari Hari Absen</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {rekap.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-mono">{p.nip}</td>
                  <td className="px-4 py-3 font-medium">{p.nama}</td>
                  <td className="px-4 py-3">{p.bagian}</td>
                  <td className="px-4 py-3">{p.jabatan}</td>
                  <td className="px-4 py-3">{p.sesuai}</td>
                  <td className="px-4 py-3">{p.luar}</td>
                  <td className="px-4 py-3">
                    {p.tidakApel > 0 ? <span className="text-clay font-medium">{p.tidakApel}</span> : p.tidakApel}
                  </td>
                  <td className="px-4 py-3">{p.gabungan}</td>
                  <td className="px-4 py-3">{p.hariBesar}</td>
                  <td className="px-4 py-3">{p.wfh}</td>
                  <td className="px-4 py-3 font-semibold">{p.total}</td>
                  <td className="px-4 py-3 font-mono">
                    {hariKerja > 0 ? Math.round((p.total / hariKerja) * 100) : 0}%
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/koreksi?uid=${p.id}`} className="text-moss-700 font-medium hover:underline whitespace-nowrap">
                      Koreksi
                    </Link>
                  </td>
                </tr>
              ))}
              {rekap.length === 0 && (
                <tr><td colSpan={13} className="px-4 py-6 text-center text-ink/40">Belum ada pegawai / data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-ink/40 mt-4 font-mono">
        "Tidak Apel" ditandai lewat menu Absen Harian, bukan otomatis.
      </p>
    </div>
  )
}
