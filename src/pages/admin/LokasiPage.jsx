import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { ambilLokasiSaatIni } from '../../utils/geo'

export default function LokasiPage() {
  const [form, setForm] = useState({ nama: '', lat: '', lng: '', radius: 100 })
  const [memuat, setMemuat] = useState(true)
  const [menyimpan, setMenyimpan] = useState(false)
  const [mencariLokasi, setMencariLokasi] = useState(false)
  const [pesan, setPesan] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'settings', 'lokasi'))
      if (snap.exists()) {
        const d = snap.data()
        setForm({ nama: d.nama || '', lat: d.lat, lng: d.lng, radius: d.radius })
      }
      setMemuat(false)
    }
    load()
  }, [])

  async function gunakanLokasiSaatIni() {
    setMencariLokasi(true)
    setError('')
    try {
      const pos = await ambilLokasiSaatIni()
      setForm((f) => ({ ...f, lat: pos.lat, lng: pos.lng }))
    } catch (err) {
      setError(err.message)
    } finally {
      setMencariLokasi(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMenyimpan(true)
    setPesan('')
    setError('')
    try {
      await setDoc(doc(db, 'settings', 'lokasi'), {
        nama: form.nama,
        lat: Number(form.lat),
        lng: Number(form.lng),
        radius: Number(form.radius),
      })
      setPesan('Area lokasi berhasil disimpan.')
    } catch (err) {
      setError('Gagal menyimpan: ' + err.message)
    } finally {
      setMenyimpan(false)
    }
  }

  if (memuat) return <p className="text-ink/50 font-mono text-sm">Memuat…</p>

  return (
    <div className="max-w-lg">
      <h1 className="font-display font-semibold text-2xl mb-1">Area Lokasi Apel</h1>
      <p className="text-ink/60 text-sm mb-6">Titik koordinat pusat & radius toleransi absen dianggap "sesuai lokasi".</p>

      <form onSubmit={handleSubmit} className="bg-white/60 border border-ink/10 rounded-xl2 p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Nama Lokasi</label>
          <input
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            required
            placeholder="mis. Halaman Kantor Utama"
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Latitude</label>
            <input
              type="number" step="any" value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white font-mono focus:border-moss-600 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Longitude</label>
            <input
              type="number" step="any" value={form.lng}
              onChange={(e) => setForm({ ...form, lng: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white font-mono focus:border-moss-600 outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={gunakanLokasiSaatIni}
          disabled={mencariLokasi}
          className="text-sm font-medium text-moss-700 underline underline-offset-2"
        >
          {mencariLokasi ? 'Mengambil lokasi…' : 'Gunakan lokasi perangkat saya saat ini'}
        </button>
        <div>
          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Radius Toleransi (meter)</label>
          <input
            type="number" min="1" value={form.radius}
            onChange={(e) => setForm({ ...form, radius: e.target.value })}
            required
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none"
          />
        </div>

        {pesan && <p className="text-sm text-moss-700 bg-moss-50 rounded-lg px-3 py-2">{pesan}</p>}
        {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={menyimpan}
          className="w-full bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-60"
        >
          {menyimpan ? 'Menyimpan…' : 'Simpan Area Lokasi'}
        </button>
      </form>
    </div>
  )
}
