import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext.jsx'
import { hashPassword } from '../utils/hash'
import { namaBulan } from '../utils/date'
import { KRITERIA_PENILAIAN } from '../data/kriteriaPenilaian'

function idPenetapan(bulanIdx, tahun, atasan) {
  return `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}_${atasan.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
}
function idPenilaian(bulanIdx, tahun, nip) {
  return `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}_${nip}`
}

export default function PimpinanPortal() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [menu, setMenu] = useState('nilai') // 'nilai' | 'password'

  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth())
  const [tahun, setTahun] = useState(now.getFullYear())
  const [dataPegawai, setDataPegawai] = useState(null)
  const [penetapanTersimpan, setPenetapanTersimpan] = useState(null)
  const [nilaiTersimpanMap, setNilaiTersimpanMap] = useState({})
  const [memuat, setMemuat] = useState(false)

  const [pegawaiDinilai, setPegawaiDinilai] = useState(null)
  const [jawabanForm, setJawabanForm] = useState({})
  const [menyimpanNilai, setMenyimpanNilai] = useState(false)
  const [pesanNilai, setPesanNilai] = useState('')

  const [sandiLama, setSandiLama] = useState('')
  const [sandiBaru, setSandiBaru] = useState('')
  const [sandiUlang, setSandiUlang] = useState('')
  const [menyimpanSandi, setMenyimpanSandi] = useState(false)
  const [pesanSandi, setPesanSandi] = useState('')
  const [errorSandi, setErrorSandi] = useState('')

  useEffect(() => {
    if (menu !== 'nilai') return
    muatData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu, bulan, tahun])

  async function muatData() {
    setMemuat(true)
    setPegawaiDinilai(null)
    try {
      const snapPegawai = await getDoc(doc(db, 'dataPegawai', 'utama'))
      const semua = snapPegawai.exists() ? (snapPegawai.data().data || []) : []
      setDataPegawai(semua)

      const snapPenetapan = await getDoc(doc(db, 'atasanPenilai', idPenetapan(bulan, tahun, user.nama)))
      const penetapan = snapPenetapan.exists() ? snapPenetapan.data() : null
      setPenetapanTersimpan(penetapan)

      const daftar = penetapan ? penetapan.pegawai : semua.filter((p) => p.atasan === user.nama)
      const peta = {}
      await Promise.all(daftar.map(async (p) => {
        const snap = await getDoc(doc(db, 'penilaianIndividu', idPenilaian(bulan, tahun, p.nip)))
        if (snap.exists()) peta[p.nip] = snap.data()
      }))
      setNilaiTersimpanMap(peta)
    } catch {
      setDataPegawai([])
    } finally {
      setMemuat(false)
    }
  }

  function mulaiNilaiPegawai(pegawai) {
    setPesanNilai('')
    const tersimpan = nilaiTersimpanMap[pegawai.nip]
    if (tersimpan?.jawaban) {
      const isi = {}
      tersimpan.jawaban.forEach((j, i) => { isi[i] = { huruf: j.huruf, teks: j.jawaban, skor: j.skor } })
      setJawabanForm(isi)
    } else {
      setJawabanForm({})
    }
    setPegawaiDinilai(pegawai)
  }

  async function simpanNilaiPegawai() {
    if (Object.keys(jawabanForm).length < KRITERIA_PENILAIAN.length) {
      setPesanNilai('Semua kriteria wajib dijawab sebelum disimpan.')
      return
    }
    setMenyimpanNilai(true)
    setPesanNilai('')
    try {
      const skorTotal = KRITERIA_PENILAIAN.reduce((sum, _, i) => sum + (jawabanForm[i]?.skor || 0), 0)
      const skorAkhir = Math.round((skorTotal * 0.25) * 100) / 100
      const data = {
        nip: pegawaiDinilai.nip,
        nama: pegawaiDinilai.nama,
        jabatan: pegawaiDinilai.jabatan,
        unitKerja: pegawaiDinilai.unitKerja,
        pejabatPenilai: user.nama,
        bulan, tahun,
        jawaban: KRITERIA_PENILAIAN.map((k, i) => ({
          pertanyaan: k.pertanyaan, huruf: jawabanForm[i].huruf, jawaban: jawabanForm[i].teks, skor: jawabanForm[i].skor,
        })),
        skorTotal, skorAkhir,
        dinilaiPada: serverTimestamp(),
      }
      await setDoc(doc(db, 'penilaianIndividu', idPenilaian(bulan, tahun, pegawaiDinilai.nip)), data)
      setNilaiTersimpanMap((prev) => ({ ...prev, [pegawaiDinilai.nip]: data }))
      setPegawaiDinilai(null)
    } catch (err) {
      setPesanNilai('Gagal menyimpan: ' + err.message)
    } finally {
      setMenyimpanNilai(false)
    }
  }

  async function handleSimpanSandi(e) {
    e.preventDefault()
    setErrorSandi('')
    setPesanSandi('')
    if (sandiBaru !== sandiUlang) {
      setErrorSandi('Konfirmasi password baru tidak cocok.')
      return
    }
    if (sandiBaru.length < 4) {
      setErrorSandi('Password baru minimal 4 karakter.')
      return
    }
    setMenyimpanSandi(true)
    try {
      const hashLama = await hashPassword(sandiLama)
      const snap = await getDoc(doc(db, 'pimpinan', user.id))
      if (!snap.exists() || snap.data().passwordHash !== hashLama) {
        setErrorSandi('Password lama tidak sesuai.')
        setMenyimpanSandi(false)
        return
      }
      const hashBaru = await hashPassword(sandiBaru)
      await setDoc(doc(db, 'pimpinan', user.id), { ...snap.data(), passwordHash: hashBaru })
      setPesanSandi('Password berhasil diperbarui.')
      setSandiLama(''); setSandiBaru(''); setSandiUlang('')
    } catch (err) {
      setErrorSandi('Gagal menyimpan: ' + err.message)
    } finally {
      setMenyimpanSandi(false)
    }
  }

  if (!user || user.role !== 'pimpinan') {
    return <Navigate to="/pimpinan" replace />
  }

  const daftarUntukDinilai = penetapanTersimpan
    ? penetapanTersimpan.pegawai
    : (dataPegawai || []).filter((p) => p.atasan === user.nama)

  return (
    <div className="min-h-screen md:flex">
      <aside className="w-full md:w-64 shrink-0 bg-white border-r border-ink/10 md:h-screen md:sticky md:top-0 flex flex-col">
        <div className="px-5 py-5 border-b border-ink/10">
          <p className="font-display font-semibold leading-tight">{user.nama}</p>
          <p className="text-xs text-ink/50 font-mono">Portal Pimpinan</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button
            type="button"
            onClick={() => setMenu('nilai')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${menu === 'nilai' ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'}`}
          >
            Penilaian Individu
          </button>
          <button
            type="button"
            onClick={() => setMenu('password')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${menu === 'password' ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'}`}
          >
            Update Password
          </button>
        </nav>
        <div className="p-4 border-t border-ink/10">
          <button
            onClick={() => { logout(); navigate('/') }}
            className="w-full text-sm font-medium px-3 py-2 rounded-lg border border-ink/15 hover:bg-ink hover:text-paper transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-5 sm:px-6 py-8 max-w-3xl mx-auto w-full">
        {menu === 'nilai' ? (
          pegawaiDinilai ? (
            <div>
              <button
                type="button"
                onClick={() => setPegawaiDinilai(null)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink mb-4"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Kembali ke Daftar
              </button>

              <div className="bg-white/60 border border-ink/10 rounded-xl2 p-5 mb-5">
                <p className="font-display font-semibold text-lg">{pegawaiDinilai.nama}</p>
                <p className="text-ink/50 text-xs font-mono">{pegawaiDinilai.nip} · {pegawaiDinilai.jabatan}</p>
                <p className="text-ink/50 text-xs font-mono mt-1">Periode: {namaBulan(bulan)} {tahun}</p>
              </div>

              {pesanNilai && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2 mb-4">{pesanNilai}</p>}

              <div className="space-y-5">
                {KRITERIA_PENILAIAN.map((k, i) => (
                  <div key={i} className="bg-white/60 border border-ink/10 rounded-xl2 p-4">
                    <p className="font-medium text-ink text-sm mb-3">{i + 1}. {k.pertanyaan}</p>
                    <div className="space-y-2">
                      {k.opsi.map((o) => (
                        <label key={o.huruf} className="flex items-start gap-2.5 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name={`kriteria-${i}`}
                            checked={jawabanForm[i]?.huruf === o.huruf}
                            onChange={() => setJawabanForm((prev) => ({ ...prev, [i]: { huruf: o.huruf, teks: o.teks, skor: o.skor } }))}
                            className="mt-0.5"
                          />
                          <span className="text-ink/80">{o.huruf}. {o.teks}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button
                  type="button"
                  disabled={menyimpanNilai}
                  onClick={simpanNilaiPegawai}
                  className="bg-moss-700 text-paper text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-50"
                >
                  {menyimpanNilai ? 'Menyimpan…' : 'Simpan Penilaian'}
                </button>
                <p className="text-xs text-ink/40 font-mono">{Object.keys(jawabanForm).length} dari {KRITERIA_PENILAIAN.length} kriteria terisi</p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="font-display font-bold text-2xl text-ink mb-4">Penilaian Individu</h1>
              <p className="text-ink/60 text-sm mb-4">Daftar pegawai binaan kamu untuk periode yang dipilih.</p>

              <div className="flex flex-wrap items-end gap-3 mb-5">
                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Bulan</label>
                  <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
                    {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Tahun</label>
                  <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm">
                    {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {memuat ? (
                <p className="text-ink/50 font-mono text-sm">Memuat…</p>
              ) : (
                <div className="border border-ink/10 rounded-xl2 overflow-x-auto">
                  <table className="w-full text-sm min-w-[560px]">
                    <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
                      <tr>
                        <th className="px-3 py-3">NIP</th>
                        <th className="px-3 py-3">Nama</th>
                        <th className="px-3 py-3 w-24">Pot. Penilaian</th>
                        <th className="px-3 py-3 w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {daftarUntukDinilai.map((p, i) => {
                        const sudah = nilaiTersimpanMap[p.nip]
                        return (
                          <tr key={`${p.nip}-${i}`}>
                            <td className="px-3 py-2.5 font-mono whitespace-nowrap">{p.nip}</td>
                            <td className="px-3 py-2.5 font-medium whitespace-nowrap">{p.nama}</td>
                            <td className="px-3 py-2.5">
                              {sudah ? `${sudah.skorAkhir}%` : <span className="text-xs px-2 py-0.5 rounded-full bg-clay/10 text-clay font-medium">Belum</span>}
                            </td>
                            <td className="px-3 py-2.5">
                              <button type="button" onClick={() => mulaiNilaiPegawai(p)} className="text-moss-700 font-medium hover:underline text-sm">
                                {sudah ? 'Ubah Nilai' : 'Beri Nilai'}
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {daftarUntukDinilai.length === 0 && (
                        <tr><td colSpan={4} className="px-3 py-4 text-center text-ink/40">Belum ada pegawai binaan untuk periode ini.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="max-w-md">
            <h1 className="font-display font-bold text-2xl text-ink mb-4">Update Password</h1>
            <form onSubmit={handleSimpanSandi} className="bg-white/60 border border-ink/10 rounded-xl2 p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Password Lama</label>
                <input type="password" value={sandiLama} onChange={(e) => setSandiLama(e.target.value)} required className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Password Baru</label>
                <input type="password" value={sandiBaru} onChange={(e) => setSandiBaru(e.target.value)} required className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Ulangi Password Baru</label>
                <input type="password" value={sandiUlang} onChange={(e) => setSandiUlang(e.target.value)} required className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2.5 bg-white focus:border-moss-600 outline-none" />
              </div>
              {errorSandi && <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2">{errorSandi}</p>}
              {pesanSandi && <p className="text-sm text-moss-700 bg-moss-50 rounded-lg px-3 py-2">{pesanSandi}</p>}
              <button type="submit" disabled={menyimpanSandi} className="w-full bg-moss-700 text-paper font-medium rounded-lg py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-50">
                {menyimpanSandi ? 'Menyimpan…' : 'Simpan Password Baru'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
