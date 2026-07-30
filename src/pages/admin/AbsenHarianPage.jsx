import { useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { formatTanggal } from '../../utils/date'
import { generateTidakApelUntukTanggal } from '../../utils/absensiOtomatis'

export default function AbsenHarianPage() {
  const [tanggal, setTanggal] = useState(formatTanggal())
  const [memproses, setMemproses] = useState(false)
  const [hasil, setHasil] = useState(null) // { dilewati, pegawaiDitandai } | null
  const [error, setError] = useState('')

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
    } catch (err) {
      setError('Gagal memproses: ' + err.message)
    } finally {
      setMemproses(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display font-semibold text-2xl mb-1">Absen Harian</h1>
      <p className="text-ink/60 text-sm mb-6">
        Pilih tanggal, lalu klik <span className="font-medium text-ink">Generate Absen</span> untuk menandai pegawai
        yang belum melakukan absen apel pada tanggal itu sebagai <span className="font-medium text-ink">Tidak Apel</span>.
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
          disabled={memproses || !tanggal}
          className="bg-moss-700 text-paper font-medium rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors disabled:opacity-50"
        >
          {memproses ? 'Memproses…' : 'Generate Absen'}
        </button>
      </div>

      {error && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {hasil?.dilewati && (
        <div className="bg-clay/10 border border-clay/30 rounded-xl2 p-5 text-clay text-sm">
          Tanggal {tanggal} bukan Hari Absen (lihat menu Hari Absensi Apel), sehingga tidak diproses.
        </div>
      )}

      {hasil && !hasil.dilewati && hasil.pegawaiDitandai.length === 0 && (
        <div className="bg-moss-50 border border-moss-200 rounded-xl2 p-5 text-moss-800 text-sm">
          Semua pegawai sudah punya data absen pada tanggal {tanggal}. Tidak ada yang ditandai Tidak Apel.
        </div>
      )}

      {hasil && !hasil.dilewati && hasil.pegawaiDitandai.length > 0 && (
        <div>
          <p className="text-sm text-ink/60 mb-3">
            <span className="font-semibold text-clay">{hasil.pegawaiDitandai.length} pegawai</span> ditandai
            <span className="font-medium text-ink"> Tidak Apel</span> untuk tanggal {tanggal}:
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

    </div>
  )
}
