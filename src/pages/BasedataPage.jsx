// Halaman ini sengaja dibuat terpisah dari alur aplikasi utama (tidak memakai Layout/AuthContext),
// supaya pengembangan di sini tidak mengganggu aplikasi e-Apel yang sudah berjalan.
import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { namaBulan } from '../utils/date'
import { parseFileSipp } from '../utils/sipp'
import { SIPP_MEI_2026 } from '../data/sippMei2026'

function IkonMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
function IkonKonfigurasi() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5M17.7 17.7l-1.5-1.5M7.8 7.8L6.3 6.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function IkonChevron({ terbuka }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-transform ${terbuka ? 'rotate-90' : ''}`}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IkonHamburger() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 4.5H16M2 9H16M2 13.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const MENU_ITEMS = [
  { key: 'penilaian-asn', label: 'Penilaian ASN', Ikon: IkonMenu, segeraHadir: true },
  { key: 'sipp', label: 'SIPP', Ikon: IkonMenu, segeraHadir: false },
  { key: 'penilaian-individu', label: 'Penilaian Individu', Ikon: IkonMenu, segeraHadir: true },
]

const POTONGAN_SIPP = [
  {
    huruf: 'a',
    ketentuan: 'Presensi masuk kerja terlambat tanpa alasan yang jelas/keterangan yang sah',
    baris: [
      { kondisi: 'Di dalam titik lokasi', persen: '0,5%' },
      { kondisi: 'Di luar titik lokasi', persen: '1,5%' },
    ],
  },
  {
    huruf: 'b',
    ketentuan: 'Presensi masuk kerja (tidak terlambat tetapi di luar titik lokasi) tanpa alasan yang jelas/keterangan yang sah',
    baris: [{ kondisi: '—', persen: '1,5%' }],
  },
  {
    huruf: 'c',
    ketentuan: 'Presensi pulang lebih awal tanpa alasan yang jelas/keterangan yang sah',
    baris: [
      { kondisi: 'Di dalam titik lokasi', persen: '0,5%' },
      { kondisi: 'Di luar titik lokasi', persen: '1,5%' },
    ],
  },
  {
    huruf: 'd',
    ketentuan: 'Presensi pulang di luar titik lokasi tanpa alasan yang jelas/keterangan yang sah',
    baris: [{ kondisi: '—', persen: '1,5%' }],
  },
  {
    huruf: 'e',
    ketentuan: 'Tidak presensi pulang',
    baris: [{ kondisi: '—', persen: '2%' }],
  },
  {
    huruf: 'f',
    ketentuan: 'Tidak masuk kerja tanpa alasan yang jelas/keterangan yang sah',
    baris: [{ kondisi: '—', persen: '4%' }],
  },
]

// Tarif potongan per satu kali tidak apel (huruf g pada tabel Potongan TPP) — dipakai juga
// untuk menghitung ulang kolom Pengurangan Apel saat file SIPP diunggah.
const TARIF_POTONGAN_APEL = 0.5

const POTONGAN_APEL = [
  {
    huruf: 'g',
    ketentuan: 'Tidak mengikuti apel pagi, apel gabungan dan/atau apel hari besar kenegaraan',
    baris: [{ kondisi: '—', persen: `${TARIF_POTONGAN_APEL}`.replace('.', ',') + '%' }],
  },
]

function TabelPotongan({ data }) {
  return (
    <div className="border border-ink/10 rounded-xl2 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
          <tr>
            <th className="px-3 py-3 w-10">No</th>
            <th className="px-3 py-3">Ketentuan</th>
            <th className="px-3 py-3">Kondisi</th>
            <th className="px-3 py-3 w-24">Potongan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {data.map((item) =>
            item.baris.map((b, i) => (
              <tr key={`${item.huruf}-${i}`}>
                {i === 0 && (
                  <>
                    <td className="px-3 py-3 align-top font-medium" rowSpan={item.baris.length}>{item.huruf}.</td>
                    <td className="px-3 py-3 align-top" rowSpan={item.baris.length}>{item.ketentuan}</td>
                  </>
                )}
                <td className="px-3 py-3 text-ink/70">{b.kondisi}</td>
                <td className="px-3 py-3 font-semibold text-clay">{b.persen}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function BasedataPage() {
  const [menuAktif, setMenuAktif] = useState('penilaian-asn')
  const [konfigurasiTerbuka, setKonfigurasiTerbuka] = useState(false)
  const [menuTerbuka, setMenuTerbuka] = useState(false)

  const now = new Date()
  const [sippBulan, setSippBulan] = useState(now.getMonth())
  const [sippTahun, setSippTahun] = useState(now.getFullYear())
  const [dataSipp, setDataSipp] = useState(null)
  const [memuatSipp, setMemuatSipp] = useState(false)
  const [mengunggahSipp, setMengunggahSipp] = useState(false)
  const [pesanSipp, setPesanSipp] = useState('')

  useEffect(() => {
    if (menuAktif !== 'sipp') return
    muatDataSipp(sippBulan, sippTahun)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuAktif, sippBulan, sippTahun])

  async function muatDataSipp(bulanIdx, tahun) {
    setMemuatSipp(true)
    setPesanSipp('')
    const id = `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}`
    try {
      const snap = await getDoc(doc(db, 'sipp', id))
      if (snap.exists()) {
        setDataSipp(snap.data().data || [])
      } else if (bulanIdx === 4 && tahun === 2026) {
        // Data bawaan Mei 2026 yang sudah disertakan — otomatis tersimpan begitu pertama kali dibuka,
        // dengan Pengurangan Apel & Nilai Akhir dihitung ulang seperti data yang diunggah manual.
        const dihitungUlang = await hitungUlangPenguranganApel(bulanIdx, tahun, SIPP_MEI_2026)
        await setDoc(doc(db, 'sipp', id), {
          bulan: bulanIdx, tahun, data: dihitungUlang, diunggahPada: serverTimestamp(),
        })
        setDataSipp(dihitungUlang)
      } else {
        setDataSipp(null)
      }
    } catch (err) {
      setPesanSipp('Gagal memuat data: ' + err.message)
      setDataSipp(null)
    } finally {
      setMemuatSipp(false)
    }
  }

  async function hitungUlangPenguranganApel(bulanIdx, tahun, dataPegawai) {
    const bulanStr = `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}`
    const awal = `${bulanStr}-01`
    const akhir = `${bulanStr}-31`
    const snap = await getDocs(
      query(collection(db, 'absensi'), where('tanggal', '>=', awal), where('tanggal', '<=', akhir)),
    )
    const jumlahTidakApelPerNip = new Map()
    snap.docs.forEach((d) => {
      const a = d.data()
      if (a.status !== 'tidak_apel' || !a.nip) return
      jumlahTidakApelPerNip.set(a.nip, (jumlahTidakApelPerNip.get(a.nip) || 0) + 1)
    })
    return dataPegawai.map((p) => {
      const jumlahTidakApel = jumlahTidakApelPerNip.get(p.nip) || 0
      const penguranganApel = Math.round(jumlahTidakApel * TARIF_POTONGAN_APEL * 100) / 100
      const nilaiAkhir = Math.round((100 - (p.penguranganPresensi || 0) - penguranganApel) * 100) / 100
      return { ...p, jumlahTidakApel, penguranganApel, nilaiAkhir }
    })
  }

  async function handleUploadSipp(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMengunggahSipp(true)
    setPesanSipp('')
    try {
      const diparsing = await parseFileSipp(file)
      const dihitungUlang = await hitungUlangPenguranganApel(sippBulan, sippTahun, diparsing)
      const id = `${sippTahun}-${String(sippBulan + 1).padStart(2, '0')}`
      await setDoc(doc(db, 'sipp', id), {
        bulan: sippBulan, tahun: sippTahun, data: dihitungUlang, diunggahPada: serverTimestamp(),
      })
      setDataSipp(dihitungUlang)
      setPesanSipp(`Berhasil mengunggah data ${dihitungUlang.length} pegawai untuk ${namaBulan(sippBulan)} ${sippTahun}. Kolom Pengurangan Apel & Nilai Akhir dihitung ulang berdasarkan data Tidak Apel di e-Apel (tarif ${TARIF_POTONGAN_APEL}% per kejadian).`)
    } catch (err) {
      setPesanSipp('Gagal mengunggah: ' + err.message)
    } finally {
      setMengunggahSipp(false)
      e.target.value = ''
    }
  }

  const semuaItem = [
    ...MENU_ITEMS,
    { key: 'data-pegawai', label: 'Data Pegawai', segeraHadir: true, dalamKonfigurasi: true },
    { key: 'potongan-tpp', label: 'Potongan TPP', segeraHadir: false, dalamKonfigurasi: true },
  ]
  const aktifSaatIni = semuaItem.find((m) => m.key === menuAktif)

  function pilihMenu(key) {
    setMenuAktif(key)
    setMenuTerbuka(false)
  }

  return (
    <div className="min-h-screen bg-paper md:flex">
      {menuTerbuka && (
        <div className="fixed inset-0 bg-ink/40 z-30 md:hidden" onClick={() => setMenuTerbuka(false)} />
      )}

      {/* Menu di sebelah kiri */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-white border-r border-ink/10 flex-col transform transition-transform duration-200 md:flex md:translate-x-0 ${
          menuTerbuka ? 'flex translate-x-0' : 'hidden -translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-ink/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-moss-800 border-2 border-gold-500 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gold-500">
              <path d="M4 21V6.5L12 3l8 3.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 21v-6h6v6M9 10h.01M12 10h.01M15 10h.01M9 13.5h.01M12 13.5h.01M15 13.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-display font-semibold leading-tight">Basedata</p>
            <p className="text-xs text-ink/50 font-mono">Portal Modul Internal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => pilihMenu(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                menuAktif === item.key ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
              }`}
            >
              <item.Ikon />
              {item.label}
            </button>
          ))}

          <div>
            <button
              type="button"
              onClick={() => setKonfigurasiTerbuka((v) => !v)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-ink/70 hover:bg-moss-100 transition-colors"
            >
              <IkonKonfigurasi />
              Konfigurasi
              <span className="ml-auto text-ink/40"><IkonChevron terbuka={konfigurasiTerbuka} /></span>
            </button>
            {konfigurasiTerbuka && (
              <div className="mt-1 space-y-1">
                <button
                  type="button"
                  onClick={() => pilihMenu('data-pegawai')}
                  className={`w-full flex items-center gap-2.5 pl-10 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    menuAktif === 'data-pegawai' ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
                  }`}
                >
                  Data Pegawai
                </button>
                <button
                  type="button"
                  onClick={() => pilihMenu('potongan-tpp')}
                  className={`w-full flex items-center gap-2.5 pl-10 pr-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    menuAktif === 'potongan-tpp' ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
                  }`}
                >
                  Potongan TPP
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-ink/10 flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMenuTerbuka(true)}
            aria-label="Buka menu"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink/15 shrink-0"
          >
            <IkonHamburger />
          </button>
          <p className="font-display font-semibold">Basedata</p>
        </header>

        <main className={`px-6 py-10 mx-auto ${menuAktif === 'potongan-tpp' || menuAktif === 'sipp' ? 'max-w-5xl' : 'max-w-lg'}`}>
          <h1 className="font-display font-bold text-2xl text-ink mb-1">{aktifSaatIni?.label}</h1>

          {menuAktif === 'sipp' ? (
            <div className="mt-4">
              <p className="text-ink/60 text-sm mb-4">Pilih bulan, lalu unggah file rekapitulasi presensi (.xlsx) untuk periode itu. Kalau data untuk bulan yang dipilih sudah pernah diunggah, hasilnya langsung tampil.</p>

              <div className="flex flex-wrap items-end gap-3 mb-5">
                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Bulan</label>
                  <select
                    value={sippBulan}
                    onChange={(e) => setSippBulan(Number(e.target.value))}
                    className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                  >
                    {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Tahun</label>
                  <select
                    value={sippTahun}
                    onChange={(e) => setSippTahun(Number(e.target.value))}
                    className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                  >
                    {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <label className="inline-flex items-center gap-2 bg-moss-700 text-paper text-sm font-medium rounded-lg px-4 py-2.5 cursor-pointer hover:bg-moss-800 transition-colors">
                  {mengunggahSipp ? 'Mengunggah…' : 'Upload Data'}
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadSipp} disabled={mengunggahSipp} />
                </label>
              </div>

              {pesanSipp && (
                <p className={`text-sm rounded-lg px-3 py-2 mb-4 ${pesanSipp.startsWith('Gagal') ? 'text-clay bg-clay/10' : 'text-moss-800 bg-moss-50'}`}>
                  {pesanSipp}
                </p>
              )}

              {memuatSipp ? (
                <p className="text-ink/50 font-mono text-sm">Memuat…</p>
              ) : dataSipp && dataSipp.length > 0 ? (
                <div className="border border-ink/10 rounded-xl2 overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
                      <tr>
                        <th className="px-3 py-3">Nama</th>
                        <th className="px-3 py-3">NIP</th>
                        <th className="px-3 py-3">Pangkat/Gol</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Hari Kerja</th>
                        <th className="px-3 py-3">Hadir</th>
                        <th className="px-3 py-3">Cuti</th>
                        <th className="px-3 py-3">TL</th>
                        <th className="px-3 py-3">Tidak Hadir</th>
                        <th className="px-3 py-3">Pot. Presensi</th>
                        <th className="px-3 py-3">Tidak Apel</th>
                        <th className="px-3 py-3">Pot. Apel</th>
                        <th className="px-3 py-3">Nilai Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {dataSipp.map((p, i) => (
                        <tr key={`${p.nip}-${i}`}>
                          <td className="px-3 py-2.5 font-medium whitespace-nowrap">{p.nama}</td>
                          <td className="px-3 py-2.5 font-mono">{p.nip}</td>
                          <td className="px-3 py-2.5">{p.pangkatGolongan}</td>
                          <td className="px-3 py-2.5">{p.statusKepegawaian}</td>
                          <td className="px-3 py-2.5">{p.jumlahHariKerja}</td>
                          <td className="px-3 py-2.5">{p.hadir}</td>
                          <td className="px-3 py-2.5">{p.cuti}</td>
                          <td className="px-3 py-2.5">{p.tl}</td>
                          <td className="px-3 py-2.5">{p.tidakHadir}</td>
                          <td className="px-3 py-2.5">{p.penguranganPresensi}%</td>
                          <td className="px-3 py-2.5">{p.jumlahTidakApel ?? '—'}</td>
                          <td className="px-3 py-2.5">{p.penguranganApel}%</td>
                          <td className="px-3 py-2.5 font-semibold text-moss-800">{p.nilaiAkhir}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white/60 border border-ink/10 rounded-xl2 p-6 text-center">
                  <p className="text-ink/60 text-sm">Belum ada data untuk {namaBulan(sippBulan)} {sippTahun}. Unggah file rekapitulasi presensi untuk periode ini.</p>
                </div>
              )}
            </div>
          ) : menuAktif === 'potongan-tpp' ? (
            <div className="mt-4 space-y-8">
              <div>
                <h2 className="font-display font-semibold text-lg text-moss-800 mb-1">Potongan SIPP</h2>
                <p className="text-ink/60 text-sm mb-3">Ketentuan huruf a s.d. f — pengurangan berdasarkan rekapitulasi presensi bulanan.</p>
                <TabelPotongan data={POTONGAN_SIPP} />
              </div>

              <div>
                <h2 className="font-display font-semibold text-lg text-moss-800 mb-1">Potongan Absensi Apel</h2>
                <p className="text-ink/60 text-sm mb-3">Ketentuan huruf g.</p>
                <TabelPotongan data={POTONGAN_APEL} />
              </div>

              <p className="text-xs text-ink/50 bg-white/60 border border-ink/10 rounded-xl2 p-4">
                <span className="font-semibold text-ink">h.</span> Persentase pengurangan ditiadakan apabila ketentuan sebagaimana dimaksud pada huruf a, huruf b, huruf c, huruf d, huruf e, huruf f, dan huruf g, alasannya diterima dan dapat dipertanggungjawabkan.
              </p>
            </div>
          ) : aktifSaatIni?.segeraHadir ? (
            <div className="mt-4 bg-white/60 border border-ink/10 rounded-xl2 p-6 text-center">
              <span className="inline-block text-xs px-3 py-1 rounded-full bg-clay/10 text-clay font-medium mb-3">Segera Hadir</span>
              <p className="text-ink/60 text-sm">Modul ini masih dalam pengembangan dan akan tersedia di sini.</p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
