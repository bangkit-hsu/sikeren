// Halaman ini sengaja dibuat terpisah dari alur aplikasi utama (tidak memakai Layout/AuthContext),
// supaya pengembangan di sini tidak mengganggu aplikasi e-Apel yang sudah berjalan.
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { namaBulan } from '../utils/date'
import { parseFileSipp } from '../utils/sipp'
import { SIPP_MEI_2026 } from '../data/sippMei2026'
import { useAuth } from '../context/AuthContext.jsx'

function IkonDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <rect x="3.5" y="3.5" width="7.5" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="3.5" width="7.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="11" width="7.5" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3.5" y="14.5" width="7.5" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
function IkonBintang() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M12 3.5l2.4 5 5.4.7-3.9 3.8.9 5.4L12 15.8l-4.8 2.6.9-5.4-3.9-3.8 5.4-.7L12 3.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
function IkonDokumen() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M6 3.5h8l4.5 4.5V20a1 1 0 01-1 1H6a1 1 0 01-1-1V4.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 12.5h8M8 16h5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IkonOrang() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function IkonAdmin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
      <path d="M12 3l7 3v5c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

const LANGKAH_UPLOAD = [
  { key: 'membaca', label: 'Membaca file Excel' },
  { key: 'menyimpan', label: 'Menyimpan ke database' },
]

function ProgresUpload({ tahap, tahapGagalDi }) {
  if (!tahap) return null
  const indeksSaatIni = LANGKAH_UPLOAD.findIndex((l) => l.key === (tahap === 'gagal' ? tahapGagalDi : tahap))

  return (
    <div className="bg-white/60 border border-ink/10 rounded-xl2 p-4 mb-4 space-y-2.5">
      {LANGKAH_UPLOAD.map((langkah, i) => {
        let status = 'menunggu'
        if (tahap === 'gagal' && i === indeksSaatIni) status = 'gagal'
        else if (tahap === 'gagal' && i < indeksSaatIni) status = 'selesai'
        else if (tahap === 'sukses' || i < indeksSaatIni) status = 'selesai'
        else if (i === indeksSaatIni) status = 'berjalan'

        return (
          <div key={langkah.key} className="flex items-center gap-2.5 text-sm">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              status === 'selesai' ? 'bg-moss-700 text-paper'
                : status === 'berjalan' ? 'bg-gold-500 text-ink animate-pulse'
                : status === 'gagal' ? 'bg-clay text-paper'
                : 'bg-ink/10 text-ink/40'
            }`}>
              {status === 'selesai' ? '✓' : status === 'gagal' ? '✕' : i + 1}
            </span>
            <span className={status === 'menunggu' ? 'text-ink/40' : status === 'gagal' ? 'text-clay font-medium' : 'text-ink'}>
              {langkah.label}
              {status === 'berjalan' && '…'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

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

function SegeraHadir({ label }) {
  return (
    <div className="mt-4 bg-white/60 border border-ink/10 rounded-xl2 p-6 text-center">
      <span className="inline-block text-xs px-3 py-1 rounded-full bg-clay/10 text-clay font-medium mb-3">Segera Hadir</span>
      <p className="text-ink/60 text-sm">{label} masih dalam pengembangan dan akan tersedia di sini.</p>
    </div>
  )
}

// Struktur menu sidebar: dua grup accordion (mengikuti gaya sidebar admin e-Apel),
// ditambah beberapa menu langsung tanpa submenu.
const NAV_GROUPS = [
  {
    key: 'penilaian-asn',
    label: 'Penilaian ASN',
    items: [
      { key: 'penilaian-asn:utama', label: 'Penilaian ASN' },
      { key: 'penilaian-asn:data-pegawai', label: 'Data Pegawai' },
    ],
  },
  {
    key: 'sipp',
    label: 'SIPP',
    items: [
      { key: 'sipp:utama', label: 'Rekap SIPP' },
      { key: 'sipp:potongan-tpp', label: 'Potongan TPP' },
    ],
  },
]

export default function BasedataPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [searchParams] = useSearchParams()
  const menuAwal = searchParams.get('menu')

  const [menuAktif, setMenuAktif] = useState(() => {
    if (menuAwal === 'data-pegawai') return 'penilaian-asn'
    if (menuAwal === 'potongan-tpp') return 'sipp'
    if (['penilaian-asn', 'sipp', 'penilaian-individu'].includes(menuAwal)) return menuAwal
    return 'dashboard'
  })
  const [subPenilaianAsn, setSubPenilaianAsn] = useState(menuAwal === 'data-pegawai' ? 'data-pegawai' : 'utama')
  const [subSipp, setSubSipp] = useState(menuAwal === 'potongan-tpp' ? 'potongan-tpp' : 'utama')
  const [menuTerbuka, setMenuTerbuka] = useState(false)
  const [grupTerbuka, setGrupTerbuka] = useState(() => {
    if (menuAktif === 'penilaian-asn') return 'penilaian-asn'
    if (menuAktif === 'sipp') return 'sipp'
    return null
  })

  function handleKeluar() {
    logout()
    navigate('/')
  }

  const now = new Date()
  const [sippBulan, setSippBulan] = useState(now.getMonth())
  const [sippTahun, setSippTahun] = useState(now.getFullYear())
  const [dataSipp, setDataSipp] = useState(null)
  const [memuatSipp, setMemuatSipp] = useState(false)
  const [mengunggahSipp, setMengunggahSipp] = useState(false)
  const [pesanSipp, setPesanSipp] = useState('')
  const [tahapUpload, setTahapUpload] = useState(null)
  const [tahapGagalDi, setTahapGagalDi] = useState(null)

  useEffect(() => {
    if (menuAktif !== 'sipp' || subSipp !== 'utama') return
    muatDataSipp(sippBulan, sippTahun)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuAktif, subSipp, sippBulan, sippTahun])

  async function muatDataSipp(bulanIdx, tahun) {
    setMemuatSipp(true)
    setPesanSipp('')
    setTahapUpload(null)
    setTahapGagalDi(null)
    const id = `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}`
    try {
      const snap = await getDoc(doc(db, 'sipp', id))
      if (snap.exists()) {
        setDataSipp(snap.data().data || [])
      } else if (bulanIdx === 4 && tahun === 2026) {
        await setDoc(doc(db, 'sipp', id), {
          bulan: bulanIdx, tahun, data: SIPP_MEI_2026, diunggahPada: serverTimestamp(),
        })
        setDataSipp(SIPP_MEI_2026)
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

  async function handleUploadSipp(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMengunggahSipp(true)
    setPesanSipp('')
    setTahapGagalDi(null)
    let langkahSaatIni = 'membaca'
    setTahapUpload(langkahSaatIni)
    try {
      const diparsing = await parseFileSipp(file)

      langkahSaatIni = 'menyimpan'
      setTahapUpload(langkahSaatIni)
      const id = `${sippTahun}-${String(sippBulan + 1).padStart(2, '0')}`
      await setDoc(doc(db, 'sipp', id), {
        bulan: sippBulan, tahun: sippTahun, data: diparsing, diunggahPada: serverTimestamp(),
      })

      setDataSipp(diparsing)
      setTahapUpload('sukses')
      setPesanSipp(`Berhasil mengunggah data ${diparsing.length} pegawai untuk ${namaBulan(sippBulan)} ${sippTahun}.`)
    } catch (err) {
      setTahapGagalDi(langkahSaatIni)
      setTahapUpload('gagal')
      setPesanSipp('Gagal mengunggah: ' + err.message)
    } finally {
      setMengunggahSipp(false)
      e.target.value = ''
    }
  }

  function pilihMenu(key) {
    if (key === 'penilaian-asn:utama') {
      setMenuAktif('penilaian-asn'); setSubPenilaianAsn('utama')
    } else if (key === 'penilaian-asn:data-pegawai') {
      setMenuAktif('penilaian-asn'); setSubPenilaianAsn('data-pegawai')
    } else if (key === 'sipp:utama') {
      setMenuAktif('sipp'); setSubSipp('utama')
    } else if (key === 'sipp:potongan-tpp') {
      setMenuAktif('sipp'); setSubSipp('potongan-tpp')
    } else {
      setMenuAktif(key)
    }
    setMenuTerbuka(false)
  }

  function toggleGrup(key) {
    setGrupTerbuka((prev) => (prev === key ? null : key))
  }

  const judulHalaman = {
    dashboard: 'Dashboard',
    'penilaian-asn': 'Penilaian ASN',
    sipp: 'SIPP',
    'penilaian-individu': 'Penilaian Individu',
  }[menuAktif] || 'Dashboard'

  return (
    <div className="min-h-screen md:flex">
      {menuTerbuka && (
        <div className="fixed inset-0 bg-ink/40 z-30 md:hidden" onClick={() => setMenuTerbuka(false)} />
      )}

      {/* Sidebar — tetap terlihat di desktop, geser dari kiri di smartphone (sama seperti Panel Admin e-Apel) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-white border-r border-ink/10 flex-col transform transition-transform duration-200 md:flex md:translate-x-0 ${
          menuTerbuka ? 'flex translate-x-0' : 'flex -translate-x-full md:translate-x-0'
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
            <p className="font-display font-semibold leading-tight">SiKeren</p>
            <p className="text-xs text-ink/50 font-mono">Portal Admin</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            type="button"
            onClick={() => pilihMenu('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              menuAktif === 'dashboard' ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
            }`}
          >
            <IkonDashboard />
            Dashboard
          </button>

          {NAV_GROUPS.map((group) => {
            const terbuka = grupTerbuka === group.key
            const Ikon = group.key === 'penilaian-asn' ? IkonBintang : IkonDokumen
            return (
              <div key={group.key} className="pt-2">
                <button
                  type="button"
                  onClick={() => toggleGrup(group.key)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wide text-ink/50 hover:bg-moss-50 hover:text-ink/70 transition-colors"
                >
                  <Ikon />
                  <span className="flex-1 text-left">{group.label}</span>
                  <IkonChevron terbuka={terbuka} />
                </button>
                {terbuka && (
                  <div className="space-y-1 mt-1">
                    {group.items.map((item) => {
                      const aktif = menuAktif === group.key
                        && ((item.key.endsWith('utama') && (group.key === 'penilaian-asn' ? subPenilaianAsn === 'utama' : subSipp === 'utama'))
                          || (item.key.endsWith('data-pegawai') && subPenilaianAsn === 'data-pegawai')
                          || (item.key.endsWith('potongan-tpp') && subSipp === 'potongan-tpp'))
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => pilihMenu(item.key)}
                          className={`w-full pl-10 pr-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                            aktif ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => pilihMenu('penilaian-individu')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left mt-2 ${
              menuAktif === 'penilaian-individu' ? 'bg-moss-700 text-paper' : 'text-ink/70 hover:bg-moss-100'
            }`}
          >
            <IkonOrang />
            Penilaian Individu
          </button>

          <Link
            to="/login"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-ink/70 hover:bg-moss-100 transition-colors mt-2"
          >
            <IkonAdmin />
            e-Apel
          </Link>
        </nav>

        <div className="p-4 border-t border-ink/10">
          <p className="text-sm text-ink/70 mb-2">Admin</p>
          <button
            onClick={handleKeluar}
            className="w-full text-sm font-medium px-3 py-2 rounded-lg border border-ink/15 hover:bg-ink hover:text-paper transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-ink/10 flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMenuTerbuka(true)}
            aria-label="Buka menu"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink/15 shrink-0"
          >
            <IkonHamburger />
          </button>
          <p className="font-display font-semibold">SiKeren</p>
        </header>

        <main className={`flex-1 w-full mx-auto px-5 sm:px-6 py-8 ${menuAktif === 'dashboard' || menuAktif === 'sipp' ? 'max-w-5xl' : 'max-w-2xl'}`}>
          {menuAktif === 'dashboard' ? (
            <div>
              <div className="relative overflow-hidden rounded-xl2 bg-moss-900 text-paper px-6 py-10 sm:py-12 mb-8 text-center">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 12% 15%, rgba(201,162,39,0.35), transparent 35%), radial-gradient(circle at 88% 85%, rgba(201,162,39,0.25), transparent 40%)',
                  }}
                />
                <div className="relative max-w-lg mx-auto">
                  <div className="w-14 h-14 mx-auto rounded-full bg-moss-800 border-2 border-gold-500 flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gold-500">
                      <path d="M4 21V6.5L12 3l8 3.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M9 21v-6h6v6M9 10h.01M12 10h.01M15 10h.01M9 13.5h.01M12 13.5h.01M15 13.5h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-xs font-mono uppercase tracking-widest text-gold-400 mb-2">Portal Modul Internal</p>
                  <h1 className="font-display font-bold text-3xl sm:text-4xl">SiKeren</h1>
                  <p className="text-paper/80 text-sm sm:text-base mt-2">
                    Portal terpadu penilaian, presensi, dan data kepegawaian.
                  </p>
                </div>
              </div>

              <p className="text-xs font-mono uppercase tracking-wide text-ink/40 mb-3">Modul Tersedia</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <button type="button" onClick={() => pilihMenu('penilaian-asn')} className="text-left bg-white border border-ink/10 rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-ink/10 text-ink/50"><IkonBintang /></div>
                  <p className="font-display font-semibold text-ink">Penilaian ASN</p>
                  <p className="text-ink/50 text-xs mt-1.5 leading-relaxed">Penilaian kinerja dan perilaku kerja ASN secara berkala.</p>
                  <span className="inline-block mt-4 text-xs px-2.5 py-1 rounded-full font-medium bg-clay/10 text-clay">Segera Hadir</span>
                </button>

                <button type="button" onClick={() => pilihMenu('sipp')} className="text-left bg-white border border-ink/10 rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-moss-700 text-paper"><IkonDokumen /></div>
                  <p className="font-display font-semibold text-ink">SIPP</p>
                  <p className="text-ink/50 text-xs mt-1.5 leading-relaxed">Rekapitulasi presensi bulanan & perhitungan potongan TPP.</p>
                  <span className="inline-block mt-4 text-xs px-2.5 py-1 rounded-full font-medium bg-moss-100 text-moss-800">Aktif</span>
                </button>

                <Link to="/login" className="text-left bg-ink text-paper border border-ink/10 rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gold-500 text-ink"><IkonAdmin /></div>
                  <p className="font-display font-semibold">e-Apel</p>
                  <p className="text-paper/60 text-xs mt-1.5 leading-relaxed">Kelola data pegawai, laporan absensi, dan konfigurasi lokasi apel.</p>
                  <span className="inline-block mt-4 text-xs px-2.5 py-1 rounded-full font-medium bg-gold-500/20 text-gold-400">Aktif</span>
                </Link>

                <button type="button" onClick={() => pilihMenu('penilaian-individu')} className="text-left bg-white border border-ink/10 rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-ink/10 text-ink/50"><IkonOrang /></div>
                  <p className="font-display font-semibold text-ink">Penilaian Individu</p>
                  <p className="text-ink/50 text-xs mt-1.5 leading-relaxed">Catatan penilaian dan capaian kerja per individu pegawai.</p>
                  <span className="inline-block mt-4 text-xs px-2.5 py-1 rounded-full font-medium bg-clay/10 text-clay">Segera Hadir</span>
                </button>
              </div>
            </div>
          ) : menuAktif === 'penilaian-asn' ? (
            <div>
              <h1 className="font-display font-bold text-2xl text-ink mb-4">{subPenilaianAsn === 'utama' ? 'Penilaian ASN' : 'Data Pegawai'}</h1>
              {subPenilaianAsn === 'utama' ? <SegeraHadir label="Penilaian ASN" /> : <SegeraHadir label="Data Pegawai" />}
            </div>
          ) : menuAktif === 'sipp' ? (
            <div>
              <h1 className="font-display font-bold text-2xl text-ink mb-4">{subSipp === 'utama' ? 'SIPP' : 'Potongan TPP'}</h1>

              {subSipp === 'utama' ? (
                <div>
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

                  <ProgresUpload tahap={tahapUpload} tahapGagalDi={tahapGagalDi} />

                  {pesanSipp && (
                    <p className={`text-sm rounded-lg px-3 py-2 mb-4 ${pesanSipp.startsWith('Gagal') ? 'text-clay bg-clay/10' : 'text-moss-800 bg-moss-50'}`}>
                      {pesanSipp}
                    </p>
                  )}

                  {memuatSipp ? (
                    <p className="text-ink/50 font-mono text-sm">Memuat…</p>
                  ) : dataSipp && dataSipp.length > 0 ? (
                    <div className="border border-ink/10 rounded-xl2 overflow-x-auto">
                      <table className="w-full text-sm min-w-[2200px]">
                        <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
                          <tr>
                            <th className="px-3 py-2" rowSpan={2}>Nama</th>
                            <th className="px-3 py-2" rowSpan={2}>NIP</th>
                            <th className="px-3 py-2" rowSpan={2}>Pangkat/Gol</th>
                            <th className="px-3 py-2" rowSpan={2}>Status</th>
                            <th className="px-3 py-2" rowSpan={2}>Hari Kerja</th>
                            <th className="px-3 py-2" rowSpan={2}>Hadir</th>
                            <th className="px-3 py-2" rowSpan={2}>Cuti</th>
                            <th className="px-3 py-2" rowSpan={2}>TL</th>
                            <th className="px-3 py-2" rowSpan={2}>Perbaikan Presensi</th>
                            <th className="px-3 py-2" rowSpan={2}>Dianggap Tidak Hadir</th>
                            <th className="px-3 py-2" rowSpan={2}>Tidak Hadir</th>
                            <th className="px-3 py-2 text-center border-l border-ink/10" colSpan={6}>Check In</th>
                            <th className="px-3 py-2 text-center border-l border-ink/10" colSpan={6}>Check Out</th>
                            <th className="px-3 py-2 border-l border-ink/10" rowSpan={2}>Perbaikan Check Out</th>
                            <th className="px-3 py-2" rowSpan={2}>Alpa</th>
                            <th className="px-3 py-2 border-l border-ink/10" rowSpan={2}>Pot. Presensi</th>
                            <th className="px-3 py-2" rowSpan={2}>Pot. Apel</th>
                            <th className="px-3 py-2" rowSpan={2}>Nilai Akhir</th>
                            <th className="px-3 py-2" rowSpan={2}>Ket.</th>
                          </tr>
                          <tr>
                            <th className="px-2 py-2 border-l border-ink/10">Tepat Waktu</th>
                            <th className="px-2 py-2">Terlambat</th>
                            <th className="px-2 py-2">Terlambat (diterima)</th>
                            <th className="px-2 py-2">Dalam Area</th>
                            <th className="px-2 py-2">Luar Area (diterima)</th>
                            <th className="px-2 py-2">Luar Area (ditolak)</th>
                            <th className="px-2 py-2 border-l border-ink/10">Tepat Waktu</th>
                            <th className="px-2 py-2">Lebih Awal</th>
                            <th className="px-2 py-2">Lebih Awal (diterima)</th>
                            <th className="px-2 py-2">Dalam Area</th>
                            <th className="px-2 py-2">Luar Area (diterima)</th>
                            <th className="px-2 py-2">Luar Area (ditolak)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                          {dataSipp.map((p, i) => (
                            <tr key={`${p.nip}-${i}`}>
                              <td className="px-3 py-2.5 font-medium whitespace-nowrap">{p.nama}</td>
                              <td className="px-3 py-2.5 font-mono">{p.nip}</td>
                              <td className="px-3 py-2.5 whitespace-nowrap">{p.pangkatGolongan}</td>
                              <td className="px-3 py-2.5">{p.statusKepegawaian}</td>
                              <td className="px-3 py-2.5">{p.jumlahHariKerja}</td>
                              <td className="px-3 py-2.5">{p.hadir}</td>
                              <td className="px-3 py-2.5">{p.cuti}</td>
                              <td className="px-3 py-2.5">{p.tl}</td>
                              <td className="px-3 py-2.5">{p.perbaikanPresensi ?? 0}</td>
                              <td className="px-3 py-2.5">{p.dianggapTidakHadir ?? 0}</td>
                              <td className="px-3 py-2.5">{p.tidakHadir}</td>
                              <td className="px-2 py-2.5 border-l border-ink/10">{p.checkInTepatWaktu ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkInTerlambat ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkInTerlambatDiterima ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkInDalamArea ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkInLuarAreaDiterima ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkInLuarAreaDitolak ?? '—'}</td>
                              <td className="px-2 py-2.5 border-l border-ink/10">{p.checkOutTepatWaktu ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkOutLebihAwal ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkOutLebihAwalDiterima ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkOutDalamArea ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkOutLuarAreaDiterima ?? '—'}</td>
                              <td className="px-2 py-2.5">{p.checkOutLuarAreaDitolak ?? '—'}</td>
                              <td className="px-3 py-2.5 border-l border-ink/10">{p.perbaikanCheckOut ?? 0}</td>
                              <td className="px-3 py-2.5">{p.alpa ?? 0}</td>
                              <td className="px-3 py-2.5 border-l border-ink/10">{p.penguranganPresensi}%</td>
                              <td className="px-3 py-2.5">{p.penguranganApel}%</td>
                              <td className="px-3 py-2.5 font-semibold text-moss-800">{p.nilaiAkhir}</td>
                              <td className="px-3 py-2.5">{p.keterangan || '—'}</td>
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
              ) : (
                <div className="space-y-8">
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
              )}
            </div>
          ) : (
            <div>
              <h1 className="font-display font-bold text-2xl text-ink mb-1">{judulHalaman}</h1>
              <SegeraHadir label={judulHalaman} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
