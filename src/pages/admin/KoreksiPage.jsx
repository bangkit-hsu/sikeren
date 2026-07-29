import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { namaBulan } from '../../utils/date'
import { KETERANGAN_LUAR, KETERANGAN_OTOMATIS_SESUAI } from '../../utils/keterangan'

const OPSI_STATUS = [
  { value: 'sesuai', label: 'Sesuai Lokasi' },
  { value: 'luar', label: 'Diluar Lokasi' },
  { value: 'tidak_apel', label: 'Tidak Apel' },
]

function keteranganUntukStatus(status, keteranganLuar) {
  if (status === 'luar') return keteranganLuar || null
  if (status === 'sesuai') return KETERANGAN_OTOMATIS_SESUAI
  return null
}

function SelectKeterangan({ status, value, onChange }) {
  return (
    <select
      value={status === 'luar' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={status !== 'luar'}
      className="rounded-lg border border-ink/15 px-2 py-1.5 bg-white text-sm disabled:opacity-40"
    >
      <option value="">
        {status === 'sesuai' ? 'Apel Pagi (otomatis)' : status === 'tidak_apel' ? '–' : 'Pilih…'}
      </option>
      {KETERANGAN_LUAR.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function BarisKosong({ pegawaiId, onTersimpan }) {
  const [tanggal, setTanggal] = useState('')
  const [jam, setJam] = useState('08:00:00')
  const [status, setStatus] = useState('sesuai')
  const [keterangan, setKeterangan] = useState('')
  const [menyimpan, setMenyimpan] = useState(false)
  const [error, setError] = useState('')

  async function tambah() {
    if (!tanggal) return
    setMenyimpan(true)
    setError('')
    try {
      await addDoc(collection(db, 'absensi'), {
        uid: pegawaiId,
        tanggal,
        jam: status === 'tidak_apel' ? null : jam,
        status,
        keterangan: keteranganUntukStatus(status, keterangan),
        dikoreksiAdmin: true,
        dibuat: serverTimestamp(),
      })
      setTanggal('')
      setJam('08:00:00')
      setStatus('sesuai')
      setKeterangan('')
      onTersimpan()
    } catch (err) {
      setError(err.message)
    } finally {
      setMenyimpan(false)
    }
  }

  return (
    <tr className="bg-moss-50/60">
      <td className="px-4 py-2">
        <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="rounded-lg border border-ink/15 px-2 py-1.5 bg-white font-mono text-sm" />
      </td>
      <td className="px-4 py-2">
        <input
          type="time" step="1" value={jam}
          onChange={(e) => setJam(e.target.value)}
          disabled={status === 'tidak_apel'}
          className="rounded-lg border border-ink/15 px-2 py-1.5 bg-white font-mono text-sm w-28 disabled:opacity-40"
        />
      </td>
      <td className="px-4 py-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-ink/15 px-2 py-1.5 bg-white text-sm">
          {OPSI_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td className="px-4 py-2">
        <SelectKeterangan status={status} value={keterangan} onChange={setKeterangan} />
      </td>
      <td className="px-4 py-2">
        <button
          onClick={tambah}
          disabled={!tanggal || menyimpan}
          className="text-sm font-medium bg-moss-700 text-paper rounded-lg px-3 py-1.5 hover:bg-moss-800 disabled:opacity-50"
        >
          {menyimpan ? 'Menambah…' : 'Tambah'}
        </button>
        {error && <p className="text-xs text-clay mt-1">{error}</p>}
      </td>
    </tr>
  )
}

function BarisAbsensi({ item, onUbah }) {
  const [status, setStatus] = useState(item.status)
  const [keterangan, setKeterangan] = useState(item.keterangan && item.keterangan !== KETERANGAN_OTOMATIS_SESUAI ? item.keterangan : '')
  const [jam, setJam] = useState(item.jam || '')
  const [menyimpan, setMenyimpan] = useState(false)
  const [menghapus, setMenghapus] = useState(false)
  const [pesan, setPesan] = useState('')

  const adaPerubahan = status !== item.status || keterangan !== (item.keterangan && item.keterangan !== KETERANGAN_OTOMATIS_SESUAI ? item.keterangan : '') || jam !== (item.jam || '')

  async function simpan() {
    setMenyimpan(true)
    setPesan('')
    try {
      const keteranganBaru = keteranganUntukStatus(status, keterangan)
      const jamBaru = status === 'tidak_apel' ? null : jam
      await updateDoc(doc(db, 'absensi', item.id), {
        status,
        keterangan: keteranganBaru,
        jam: jamBaru,
        dikoreksiAdmin: true,
      })
      onUbah({ ...item, status, keterangan: keteranganBaru, jam: jamBaru })
      setPesan('Tersimpan.')
    } catch (err) {
      setPesan('Gagal: ' + err.message)
    } finally {
      setMenyimpan(false)
    }
  }

  async function hapus() {
    if (!confirm(`Hapus data absen tanggal ${item.tanggal}?`)) return
    setMenghapus(true)
    try {
      await deleteDoc(doc(db, 'absensi', item.id))
      onUbah(null)
    } catch (err) {
      setPesan('Gagal menghapus: ' + err.message)
      setMenghapus(false)
    }
  }

  return (
    <tr>
      <td className="px-4 py-2 font-mono">{item.tanggal}</td>
      <td className="px-4 py-2">
        <input
          type="time" step="1" value={jam || ''}
          onChange={(e) => setJam(e.target.value)}
          disabled={status === 'tidak_apel'}
          className="rounded-lg border border-ink/15 px-2 py-1.5 bg-white font-mono text-sm w-28 disabled:opacity-40"
        />
      </td>
      <td className="px-4 py-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-ink/15 px-2 py-1.5 bg-white text-sm">
          {OPSI_STATUS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td className="px-4 py-2">
        <SelectKeterangan status={status} value={keterangan} onChange={setKeterangan} />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={simpan}
            disabled={!adaPerubahan || menyimpan}
            className="text-sm font-medium bg-moss-700 text-paper rounded-lg px-3 py-1.5 hover:bg-moss-800 disabled:opacity-40"
          >
            {menyimpan ? 'Menyimpan…' : 'Simpan'}
          </button>
          <button
            onClick={hapus}
            disabled={menghapus}
            className="text-sm font-medium text-clay hover:underline disabled:opacity-50"
          >
            Hapus
          </button>
        </div>
        {pesan && <p className="text-xs text-ink/50 mt-1">{pesan}</p>}
      </td>
    </tr>
  )
}

export default function KoreksiPage() {
  const now = new Date()
  const [searchParams, setSearchParams] = useSearchParams()
  const [pegawai, setPegawai] = useState([])
  const [pegawaiId, setPegawaiId] = useState(searchParams.get('uid') || '')
  const [tahun, setTahun] = useState(now.getFullYear())
  const [bulan, setBulan] = useState(now.getMonth())
  const [absensi, setAbsensi] = useState([])
  const [memuat, setMemuat] = useState(true)
  const [memuatAbsensi, setMemuatAbsensi] = useState(false)

  useEffect(() => {
    async function load() {
      setMemuat(true)
      const usersSnap = await getDocs(collection(db, 'users'))
      const users = usersSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => u.role === 'pegawai')
        .sort((a, b) => a.nama.localeCompare(b.nama))
      setPegawai(users)
      if (!pegawaiId && users.length > 0) {
        setPegawaiId(users[0].id)
      }
      setMemuat(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!pegawaiId) return
    setSearchParams({ uid: pegawaiId })
    muatAbsensi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pegawaiId, tahun, bulan])

  async function muatAbsensi() {
    setMemuatAbsensi(true)
    const bulanStr = `${tahun}-${String(bulan + 1).padStart(2, '0')}`
    const snap = await getDocs(collection(db, 'absensi'))
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((a) => a.uid === pegawaiId && a.tanggal.startsWith(bulanStr))
      .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    setAbsensi(data)
    setMemuatAbsensi(false)
  }

  function ubahBaris(id, hasilBaru) {
    if (hasilBaru === null) {
      setAbsensi((prev) => prev.filter((a) => a.id !== id))
    } else {
      setAbsensi((prev) => prev.map((a) => (a.id === id ? hasilBaru : a)))
    }
  }

  const pegawaiTerpilih = useMemo(() => pegawai.find((p) => p.id === pegawaiId), [pegawai, pegawaiId])

  if (memuat) return <p className="text-ink/50 font-mono text-sm">Memuat…</p>

  return (
    <div>
      <h1 className="font-display font-semibold text-2xl mb-1">Koreksi Data Absensi</h1>
      <p className="text-ink/60 text-sm mb-6">Ubah, hapus, atau tambahkan data absen pegawai yang sudah tersimpan.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={pegawaiId}
          onChange={(e) => setPegawaiId(e.target.value)}
          className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm min-w-[220px]"
        >
          {pegawai.map((p) => (
            <option key={p.id} value={p.id}>{p.nama} · {p.nip}</option>
          ))}
        </select>
        <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
          {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
        </select>
        <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {pegawai.length === 0 ? (
        <p className="text-ink/40 text-sm">Belum ada pegawai terdaftar.</p>
      ) : (
        <>
          {pegawaiTerpilih && (
            <p className="text-sm text-ink/60 mb-3">
              <span className="font-medium text-ink">{pegawaiTerpilih.nama}</span> · <span className="font-mono">NIP {pegawaiTerpilih.nip}</span> · {pegawaiTerpilih.bagian} · {pegawaiTerpilih.jabatan}
            </p>
          )}
          <div className="border border-ink/10 rounded-xl2 overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Jam</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {memuatAbsensi ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-ink/40 font-mono">Memuat…</td></tr>
                ) : (
                  <>
                    {absensi.map((item) => (
                      <BarisAbsensi key={item.id} item={item} onUbah={(hasil) => ubahBaris(item.id, hasil)} />
                    ))}
                    {absensi.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-4 text-center text-ink/40">Belum ada data absen pada periode ini.</td></tr>
                    )}
                    <BarisKosong pegawaiId={pegawaiId} onTersimpan={muatAbsensi} />
                  </>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
