import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, query, where, doc, getDoc, addDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { namaBulan, hitungHariKerja } from '../../utils/date'
import { unduhExcel } from '../../utils/excel'
import { parseFileAbsensiImport, templateAbsensiImport } from '../../utils/absensiImport'

export default function RekapPage() {
  const now = new Date()
  const [tahun, setTahun] = useState(now.getFullYear())
  const [bulan, setBulan] = useState(now.getMonth())
  const [pegawai, setPegawai] = useState([])
  const [absensi, setAbsensi] = useState([])
  const [dataSipp, setDataSipp] = useState([])
  const [overrideHariAbsen, setOverrideHariAbsen] = useState({})
  const [memuat, setMemuat] = useState(true)
  const [cari, setCari] = useState('')
  const [tampilkanUpload, setTampilkanUpload] = useState(false)
  const [mengunggahImport, setMengunggahImport] = useState(false)
  const [pesanImport, setPesanImport] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

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
      const absensiSnap = await getDocs(
        query(collection(db, 'absensi'), where('tanggal', '>=', `${bulanStr}-01`), where('tanggal', '<=', `${bulanStr}-31`)),
      )
      const data = absensiSnap.docs.map((d) => d.data())
      setAbsensi(data)

      const sippSnap = await getDoc(doc(db, 'sipp', bulanStr))
      setDataSipp(sippSnap.exists() ? (sippSnap.data().data || []) : [])

      setMemuat(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahun, bulan, refreshKey])

  const hariKerja = useMemo(() => hitungHariKerja(tahun, bulan, overrideHariAbsen), [tahun, bulan, overrideHariAbsen])

  const rekap = useMemo(() => {
    const petaSipp = new Map(dataSipp.map((s) => [s.nip, s]))
    return pegawai
      .map((p) => {
        const milik = absensi.filter((a) => a.uid === p.id)
        const hadir = milik.filter((a) => a.status !== 'tidak_apel')
        const sipp = petaSipp.get(p.nip)
        return {
          ...p,
          cuti: sipp ? sipp.cuti : null,
          tl: sipp ? sipp.tl : null,
          sesuai: milik.filter((a) => a.status === 'sesuai').length,
          luar: milik.filter((a) => a.status === 'luar').length,
          tidakApel: milik.filter((a) => a.status === 'tidak_apel').length,
          gabungan: milik.filter((a) => a.keterangan === 'gabungan').length,
          hariBesar: milik.filter((a) => a.keterangan === 'hari_besar').length,
          wfh: milik.filter((a) => a.keterangan === 'wfh').length,
          total: hadir.length,
          potApel: Math.round(milik.filter((a) => a.status === 'tidak_apel').length * 0.5 * 100) / 100,
        }
      })
      .filter((p) =>
        p.nama.toLowerCase().includes(cari.toLowerCase()) ||
        (p.nip || '').includes(cari) ||
        (p.bagian || '').toLowerCase().includes(cari.toLowerCase()) ||
        (p.jabatan || '').toLowerCase().includes(cari.toLowerCase()),
      )
  }, [pegawai, absensi, dataSipp, cari])

  function downloadExcel() {
    const baris = rekap.map((p) => ({
      NIP: p.nip,
      Nama: p.nama,
      Bagian: p.bagian,
      Jabatan: p.jabatan,
      Cuti: p.cuti ?? '',
      TL: p.tl ?? '',
      'Sesuai Lokasi': p.sesuai,
      'Diluar Lokasi': p.luar,
      'Tidak Apel': p.tidakApel,
      'Apel Gabungan': p.gabungan,
      'Apel Hari Besar': p.hariBesar,
      WFH: p.wfh,
      'Total Hadir': p.total,
      'Hari Absen': hariKerja,
      '% Kehadiran': hariKerja > 0 ? Math.round((p.total / hariKerja) * 100) : 0,
      'Pot. Apel': `${p.potApel}%`,
    }))
    unduhExcel(`Rekap-Absen-${namaBulan(bulan)}-${tahun}.xlsx`, baris, 'Rekap Absen')
  }

  function downloadTemplate() {
    unduhExcel('Template-Import-Absensi.xlsx', templateAbsensiImport(), 'Absensi')
  }

  async function handleUploadImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMengunggahImport(true)
    setPesanImport('')
    try {
      const baris = await parseFileAbsensiImport(file)
      const petaNip = new Map(pegawai.map((p) => [p.nip, p.id]))
      let ditambah = 0
      const nipTidakDitemukan = new Set()
      for (const b of baris) {
        const uid = petaNip.get(b.nip)
        if (!uid) {
          nipTidakDitemukan.add(b.nip)
          continue
        }
        const data = { uid, tanggal: b.tanggal, jam: b.jam, status: b.status }
        if (b.keterangan) data.keterangan = b.keterangan
        await addDoc(collection(db, 'absensi'), data)
        ditambah += 1
      }
      let pesan = `Berhasil mengimpor ${ditambah} dari ${baris.length} baris.`
      if (nipTidakDitemukan.size > 0) {
        pesan += ` NIP tidak ditemukan (dilewati): ${[...nipTidakDitemukan].join(', ')}.`
      }
      setPesanImport(pesan)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setPesanImport('Gagal mengimpor: ' + err.message)
    } finally {
      setMengunggahImport(false)
      e.target.value = ''
    }
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
          <button
            onClick={() => setTampilkanUpload((v) => !v)}
            className="rounded-lg border border-ink/15 text-sm font-medium px-4 py-2 hover:bg-ink/5 transition-colors"
          >
            {tampilkanUpload ? 'Tutup' : 'Upload Data Lama'}
          </button>
        </div>
      </div>

      {tampilkanUpload && (
        <div className="bg-white/60 border border-ink/10 rounded-xl2 p-5 mb-5">
          <p className="font-display font-semibold mb-1">Upload Data Absensi Lama</p>
          <p className="text-ink/60 text-sm mb-4">
            Buat pengisian bulan-bulan sebelumnya yang belum tercatat lewat aplikasi. Unduh dulu template-nya,
            isi sesuai format (kolom <span className="font-medium text-ink">NIP, Tanggal, Jam, Status, Keterangan</span>),
            lalu unggah lagi file yang sudah diisi. Status yang valid: <span className="font-mono">sesuai</span>, <span className="font-mono">luar</span>, <span className="font-mono">tidak_apel</span>.
            Keterangan boleh dikosongkan atau diisi <span className="font-mono">gabungan</span> / <span className="font-mono">hari_besar</span> / <span className="font-mono">wfh</span>.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadTemplate}
              className="rounded-lg border border-moss-600 text-moss-700 text-sm font-medium px-4 py-2 hover:bg-moss-50 transition-colors"
            >
              Unduh Template
            </button>
            <label className="inline-flex items-center gap-2 bg-moss-700 text-paper text-sm font-medium rounded-lg px-4 py-2 cursor-pointer hover:bg-moss-800 transition-colors">
              {mengunggahImport ? 'Mengunggah…' : 'Upload File Terisi'}
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadImport} disabled={mengunggahImport} />
            </label>
          </div>
          {pesanImport && (
            <p className={`text-sm rounded-lg px-3 py-2 mt-4 ${pesanImport.startsWith('Gagal') ? 'text-clay bg-clay/10' : 'text-moss-800 bg-moss-50'}`}>
              {pesanImport}
            </p>
          )}
        </div>
      )}

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
          <table className="w-full text-sm min-w-[1280px]">
            <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Bagian</th>
                <th className="px-4 py-3">Jabatan</th>
                <th className="px-4 py-3">Cuti</th>
                <th className="px-4 py-3">TL</th>
                <th className="px-4 py-3">Sesuai Lokasi</th>
                <th className="px-4 py-3">Diluar Lokasi</th>
                <th className="px-4 py-3">Tidak Apel</th>
                <th className="px-4 py-3">Apel Gabungan</th>
                <th className="px-4 py-3">Apel Hari Besar</th>
                <th className="px-4 py-3">WFH</th>
                <th className="px-4 py-3">Total Hadir</th>
                <th className="px-4 py-3">% dari Hari Absen</th>
                <th className="px-4 py-3">Pot. Apel</th>
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
                  <td className="px-4 py-3">{p.cuti ?? <span className="text-ink/30">—</span>}</td>
                  <td className="px-4 py-3">{p.tl ?? <span className="text-ink/30">—</span>}</td>
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
                  <td className="px-4 py-3 font-mono">
                    {p.potApel > 0 ? <span className="text-clay font-medium">{p.potApel}%</span> : `${p.potApel}%`}
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/koreksi?uid=${p.id}`} className="text-moss-700 font-medium hover:underline whitespace-nowrap">
                      Koreksi
                    </Link>
                  </td>
                </tr>
              ))}
              {rekap.length === 0 && (
                <tr><td colSpan={16} className="px-4 py-6 text-center text-ink/40">Belum ada pegawai / data.</td></tr>
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
