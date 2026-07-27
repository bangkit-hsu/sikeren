import { useEffect, useMemo, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { namaBulan, hitungHariKerja } from '../../utils/date'

export default function LiburPage() {
  const now = new Date()
  const [tahun, setTahun] = useState(now.getFullYear())
  const [bulan, setBulan] = useState(now.getMonth())
  const [tanggalBaru, setTanggalBaru] = useState('')
  const [keteranganBaru, setKeteranganBaru] = useState('')
  const [libur, setLibur] = useState([]) // [{tanggal, keterangan}]
  const [memuat, setMemuat] = useState(true)
  const [menyimpan, setMenyimpan] = useState(false)

  useEffect(() => {
    async function load() {
      setMemuat(true)
      const snap = await getDoc(doc(db, 'settings', 'libur'))
      if (snap.exists()) {
        setLibur(snap.data().detail || [])
      }
      setMemuat(false)
    }
    load()
  }, [])

  async function simpan(list) {
    setMenyimpan(true)
    await setDoc(doc(db, 'settings', 'libur'), {
      tanggal: list.map((l) => l.tanggal),
      detail: list,
    })
    setMenyimpan(false)
  }

  async function tambahLibur(e) {
    e.preventDefault()
    if (!tanggalBaru) return
    if (libur.some((l) => l.tanggal === tanggalBaru)) return
    const baru = [...libur, { tanggal: tanggalBaru, keterangan: keteranganBaru || 'Libur' }].sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    setLibur(baru)
    setTanggalBaru('')
    setKeteranganBaru('')
    await simpan(baru)
  }

  async function hapusLibur(tanggal) {
    const baru = libur.filter((l) => l.tanggal !== tanggal)
    setLibur(baru)
    await simpan(baru)
  }

  const bulanStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}`
  const liburBulanIni = libur.filter((l) => l.tanggal.startsWith(bulanStr))
  const liburSet = useMemo(() => new Set(libur.map((l) => l.tanggal)), [libur])
  const hariKerja = useMemo(() => hitungHariKerja(tahun, bulan, liburSet), [tahun, bulan, liburSet])

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-semibold text-2xl mb-1">Hari Libur & Hari Kerja</h1>
      <p className="text-ink/60 text-sm mb-6">
        Tanggal libur tidak dihitung sebagai hari kerja saat menghitung rekap kehadiran bulanan (Sabtu & Minggu otomatis dikecualikan).
      </p>

      <form onSubmit={tambahLibur} className="bg-white/60 border border-ink/10 rounded-xl2 p-5 flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Tanggal</label>
          <input
            type="date" value={tanggalBaru}
            onChange={(e) => setTanggalBaru(e.target.value)}
            required
            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white font-mono text-sm"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Keterangan</label>
          <input
            value={keteranganBaru}
            onChange={(e) => setKeteranganBaru(e.target.value)}
            placeholder="mis. Cuti Bersama"
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={menyimpan}
          className="bg-moss-700 text-paper font-medium rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors disabled:opacity-60"
        >
          Tambah
        </button>
      </form>

      <div className="flex items-end justify-between gap-4 mb-3">
        <div className="flex gap-2">
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
            {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
          </select>
          <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <p className="text-sm text-ink/60 font-mono">Hari kerja: <span className="text-ink font-semibold">{hariKerja}</span></p>
      </div>

      {memuat ? (
        <p className="text-ink/50 font-mono text-sm">Memuat…</p>
      ) : liburBulanIni.length === 0 ? (
        <p className="text-ink/40 text-sm">Belum ada tanggal libur di bulan ini.</p>
      ) : (
        <ul className="divide-y divide-ink/10 border border-ink/10 rounded-xl2 overflow-hidden">
          {liburBulanIni.map((l) => (
            <li key={l.tanggal} className="flex items-center justify-between px-4 py-3 bg-white/60">
              <div>
                <p className="font-mono text-sm">{l.tanggal}</p>
                <p className="text-sm text-ink/60">{l.keterangan}</p>
              </div>
              <button onClick={() => hapusLibur(l.tanggal)} className="text-sm text-clay font-medium hover:underline">
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
