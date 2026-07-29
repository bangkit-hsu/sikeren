import { useEffect, useMemo, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { namaBulan, hariAbsenBawaan, apakahHariAbsen, hitungHariKerja } from '../../utils/date'

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export default function HariAbsenPage() {
  const now = new Date()
  const [tahun, setTahun] = useState(now.getFullYear())
  const [bulan, setBulan] = useState(now.getMonth())
  const [override, setOverride] = useState({})
  const [memuat, setMemuat] = useState(true)
  const [menyimpan, setMenyimpan] = useState(false)

  useEffect(() => {
    async function load() {
      setMemuat(true)
      const snap = await getDoc(doc(db, 'settings', 'hariAbsen'))
      setOverride(snap.exists() ? snap.data().override || {} : {})
      setMemuat(false)
    }
    load()
  }, [])

  const jumlahHariDalamBulan = new Date(tahun, bulan + 1, 0).getDate()
  const daftarTanggal = useMemo(() => {
    const list = []
    for (let d = 1; d <= jumlahHariDalamBulan; d++) {
      const iso = `${tahun}-${String(bulan + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const tglObj = new Date(tahun, bulan, d)
      list.push({
        iso,
        tanggal: d,
        namaHari: NAMA_HARI[tglObj.getDay()],
        bawaan: hariAbsenBawaan(iso),
        dihitung: apakahHariAbsen(iso, override),
      })
    }
    return list
  }, [tahun, bulan, jumlahHariDalamBulan, override])

  const totalHariAbsen = daftarTanggal.filter((t) => t.dihitung).length

  async function simpanOverride(overrideBaru) {
    setOverride(overrideBaru)
    setMenyimpan(true)
    try {
      await setDoc(doc(db, 'settings', 'hariAbsen'), { override: overrideBaru })
    } finally {
      setMenyimpan(false)
    }
  }

  function toggle(item) {
    const nilaiBaru = !item.dihitung
    const baru = { ...override }
    if (nilaiBaru === item.bawaan) {
      delete baru[item.iso] // sama dengan bawaan, tidak perlu disimpan sebagai override
    } else {
      baru[item.iso] = nilaiBaru
    }
    simpanOverride(baru)
  }

  function resetKeBawaan() {
    if (!confirm(`Kembalikan semua tanggal ${namaBulan(bulan)} ${tahun} ke pengaturan bawaan (Senin-Jumat)?`)) return
    const baru = { ...override }
    daftarTanggal.forEach((t) => { delete baru[t.iso] })
    simpanOverride(baru)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-semibold text-2xl mb-1">Hari Absen</h1>
      <p className="text-ink/60 text-sm mb-6">
        Centang tanggal yang dihitung sebagai Hari Absen Apel bulan ini. Bawaannya Senin–Jumat,
        tapi setiap tanggal bisa diubah manual (misalnya meniadakan hari libur nasional, atau menambahkan Sabtu untuk apel khusus).
      </p>

      <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
        <div className="flex gap-2">
          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
            {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
          </select>
          <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={resetKeBawaan} className="text-sm text-clay font-medium hover:underline">
          Reset ke bawaan
        </button>
      </div>

      <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-4 mb-4 flex items-center justify-between">
        <p className="text-sm text-moss-800">
          <span className="font-display font-semibold text-lg">{totalHariAbsen}</span> dari {jumlahHariDalamBulan} tanggal dihitung sebagai Hari Absen
        </p>
        {menyimpan && <span className="text-xs text-moss-700 font-mono">Menyimpan…</span>}
      </div>

      {memuat ? (
        <p className="text-ink/50 font-mono text-sm">Memuat…</p>
      ) : (
        <ul className="border border-ink/10 rounded-xl2 divide-y divide-ink/10 overflow-hidden">
          {daftarTanggal.map((item) => (
            <li
              key={item.iso}
              className={`flex items-center justify-between px-4 py-2.5 ${item.dihitung ? 'bg-white/60' : 'bg-ink/5'}`}
            >
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={item.dihitung}
                  onChange={() => toggle(item)}
                  className="w-4 h-4 accent-moss-700"
                />
                <span className="font-mono text-sm">{item.iso}</span>
                <span className={`text-sm ${item.dihitung ? 'text-ink/70' : 'text-ink/40'}`}>{item.namaHari}</span>
              </label>
              {item.dihitung !== item.bawaan && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-clay/10 text-clay font-medium">diubah manual</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
