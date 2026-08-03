// Halaman ini sengaja dibuat terpisah dari alur aplikasi utama (tidak memakai Layout/AuthContext),
// supaya pengembangan di sini tidak mengganggu aplikasi e-Apel yang sudah berjalan.
import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { doc, getDoc, getDocs, collection, query, where, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { namaBulan } from '../utils/date'
import { hashPassword } from '../utils/hash'
import { parseFileSipp } from '../utils/sipp'
import { SIPP_MEI_2026 } from '../data/sippMei2026'
import { DATA_PEGAWAI } from '../data/dataPegawai'
import { KRITERIA_PENILAIAN } from '../data/kriteriaPenilaian'
import { unduhExcel } from '../utils/excel'
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

function FormPimpinan({ awal, onBatal, onSimpan, menyimpan, daftarJabatan }) {
  const [form, setForm] = useState({ nip: awal?.nip || '', nama: awal?.nama || '', jabatan: awal?.jabatan || '', password: '' })
  const [jabatanManual, setJabatanManual] = useState(!!awal?.jabatan && !(daftarJabatan || []).includes(awal.jabatan))
  return (
    <div className="bg-white/60 border border-ink/10 rounded-xl2 p-5 grid sm:grid-cols-2 gap-3 mb-4">
      <div>
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">NIP</label>
        <input
          value={form.nip}
          onChange={(e) => setForm({ ...form, nip: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm font-mono"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Nama</label>
        <input
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Jabatan</label>
        {jabatanManual || (daftarJabatan || []).length === 0 ? (
          <div>
            <input
              value={form.jabatan}
              onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
            />
            {(daftarJabatan || []).length > 0 && (
              <button
                type="button"
                onClick={() => { setJabatanManual(false); setForm({ ...form, jabatan: '' }) }}
                className="text-xs text-moss-700 underline mt-1"
              >
                Pilih dari daftar Atasan (Kelompok ASN)
              </button>
            )}
          </div>
        ) : (
          <select
            value={form.jabatan}
            onChange={(e) => {
              if (e.target.value === '__lainnya__') { setJabatanManual(true); setForm({ ...form, jabatan: '' }) }
              else setForm({ ...form, jabatan: e.target.value })
            }}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
          >
            <option value="">— Pilih Jabatan —</option>
            {daftarJabatan.map((j) => <option key={j} value={j}>{j}</option>)}
            <option value="__lainnya__">Lainnya (ketik manual)</option>
          </select>
        )}
        <p className="text-xs text-ink/40 mt-1">Pilih persis sama dengan Atasan di Data ASN, supaya cocok dengan Kelompok ASN.</p>
      </div>
      <div>
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">
          Password {awal ? '(kosongkan jika tidak diubah)' : ''}
        </label>
        <input
          type="text"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm font-mono"
        />
      </div>
      <div className="sm:col-span-2 flex gap-2">
        <button
          type="button"
          disabled={menyimpan}
          onClick={() => onSimpan(form)}
          className="text-sm font-medium bg-moss-700 text-paper rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors disabled:opacity-50"
        >
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
        <button
          type="button"
          disabled={menyimpan}
          onClick={onBatal}
          className="text-sm font-medium border border-ink/15 rounded-lg px-4 py-2 hover:bg-ink/5 transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  )
}

function FormPegawai({ awal, onBatal, onSimpan, menyimpan }) {
  const [form, setForm] = useState(awal || { nip: '', nama: '', jabatan: '', unitKerja: '', atasan: '' })
  return (
    <div className="bg-white/60 border border-ink/10 rounded-xl2 p-5 grid sm:grid-cols-2 gap-3 mb-4">
      <div>
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">NIP</label>
        <input
          value={form.nip}
          onChange={(e) => setForm({ ...form, nip: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm font-mono"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Nama</label>
        <input
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Jabatan</label>
        <input
          value={form.jabatan}
          onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Unit Kerja</label>
        <input
          value={form.unitKerja}
          onChange={(e) => setForm({ ...form, unitKerja: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
        />
      </div>
      <div className="sm:col-span-2 flex gap-2">
        <button
          type="button"
          disabled={menyimpan}
          onClick={() => onSimpan(form)}
          className="text-sm font-medium bg-moss-700 text-paper rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors disabled:opacity-50"
        >
          {menyimpan ? 'Menyimpan…' : 'Simpan'}
        </button>
        <button
          type="button"
          disabled={menyimpan}
          onClick={onBatal}
          className="text-sm font-medium border border-ink/15 rounded-lg px-4 py-2 hover:bg-ink/5 transition-colors"
        >
          Batal
        </button>
      </div>
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
    label: 'Nilai ASN',
    items: [
      { key: 'penilaian-asn:utama', label: 'Nilai ASN' },
      { key: 'penilaian-asn:data-pegawai', label: 'Data ASN' },
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
  {
    key: 'penilaian-individu',
    label: 'Penilaian Individu',
    items: [
      { key: 'penilaian-individu:nilai', label: 'Penilaian Individu' },
      { key: 'penilaian-individu:atasan', label: 'Kelompok ASN' },
      { key: 'penilaian-individu:pimpinan', label: 'Daftar Pimpinan' },
    ],
  },
]

export default function BasedataPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [searchParams] = useSearchParams()
  const menuAwal = searchParams.get('menu')

  const location = useLocation()
  const path = location.pathname.replace(/^.*\/basedata\/?/, '').replace(/\/$/, '')

  let menuAktif = 'dashboard'
  let subPenilaianAsn = 'utama'
  let subSipp = 'utama'
  let subPenilaianIndividu = 'nilai'

  if (path === 'nilai-asn') { menuAktif = 'penilaian-asn'; subPenilaianAsn = 'utama' }
  else if (path === 'nilai-asn/data-asn') { menuAktif = 'penilaian-asn'; subPenilaianAsn = 'data-pegawai' }
  else if (path === 'sipp') { menuAktif = 'sipp'; subSipp = 'utama' }
  else if (path === 'sipp/potongan-tpp') { menuAktif = 'sipp'; subSipp = 'potongan-tpp' }
  else if (path === 'penilaian-individu') { menuAktif = 'penilaian-individu'; subPenilaianIndividu = 'nilai' }
  else if (path === 'penilaian-individu/kelompok-asn') { menuAktif = 'penilaian-individu'; subPenilaianIndividu = 'atasan' }
  else if (path === 'penilaian-individu/daftar-pimpinan') { menuAktif = 'penilaian-individu'; subPenilaianIndividu = 'pimpinan' }

  useEffect(() => {
    if (!menuAwal || path) return // hanya redirect kalau masih di /basedata polos dengan ?menu=
    const peta = {
      'penilaian-asn': '/basedata/nilai-asn',
      'data-pegawai': '/basedata/nilai-asn/data-asn',
      sipp: '/basedata/sipp',
      'potongan-tpp': '/basedata/sipp/potongan-tpp',
      'penilaian-individu': '/basedata/penilaian-individu',
    }
    if (peta[menuAwal]) navigate(peta[menuAwal], { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [atasanBulan, setAtasanBulan] = useState(new Date().getMonth())
  const [atasanTahun, setAtasanTahun] = useState(new Date().getFullYear())
  const [atasanTerpilih, setAtasanTerpilih] = useState('')
  const [menyimpanPenetapan, setMenyimpanPenetapan] = useState(false)
  const [pesanPenetapan, setPesanPenetapan] = useState('')
  const [penetapanTersimpan, setPenetapanTersimpan] = useState(null)

  const [daftarPimpinan, setDaftarPimpinan] = useState(null)
  const [memuatPimpinan, setMemuatPimpinan] = useState(false)
  const [tambahPimpinanAktif, setTambahPimpinanAktif] = useState(false)
  const [editPimpinanId, setEditPimpinanId] = useState(null)
  const [menyimpanPimpinan, setMenyimpanPimpinan] = useState(false)
  const [pesanPimpinan, setPesanPimpinan] = useState('')
  const [daftarPenetapan, setDaftarPenetapan] = useState(null)
  const [memuatDaftarPenetapan, setMemuatDaftarPenetapan] = useState(false)
  const [editPenetapanId, setEditPenetapanId] = useState(null)
  const [nipTerpilihEdit, setNipTerpilihEdit] = useState(new Set())
  const [menyimpanEditPenetapan, setMenyimpanEditPenetapan] = useState(false)
  const [cariPegawaiEdit, setCariPegawaiEdit] = useState('')

  const [pegawaiDinilai, setPegawaiDinilai] = useState(null) // objek pegawai yang sedang diberi nilai, atau null
  const [jawabanForm, setJawabanForm] = useState({}) // { [indeksKriteria]: { huruf, teks, skor } }
  const [menyimpanNilai, setMenyimpanNilai] = useState(false)
  const [pesanNilai, setPesanNilai] = useState('')
  const [nilaiTersimpanMap, setNilaiTersimpanMap] = useState({}) // nip -> { skorAkhir, jawaban }
  const [memuatNilaiMap, setMemuatNilaiMap] = useState(false)

  const [nilaiAsnBulan, setNilaiAsnBulan] = useState(new Date().getMonth())
  const [nilaiAsnTahun, setNilaiAsnTahun] = useState(new Date().getFullYear())
  const [nilaiAsnData, setNilaiAsnData] = useState(null)
  const [memuatNilaiAsn, setMemuatNilaiAsn] = useState(false)
  const [cariNilaiAsn, setCariNilaiAsn] = useState('')
  const [menuTerbuka, setMenuTerbuka] = useState(false)
  const [grupTerbuka, setGrupTerbuka] = useState(() => {
    if (menuAktif === 'penilaian-asn') return 'penilaian-asn'
    if (menuAktif === 'sipp') return 'sipp'
    return null
  })

  function handleKeluar() {
    if (menuAktif === 'dashboard') {
      logout()
      navigate('/')
    } else {
      pilihMenu('dashboard')
    }
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

  const [dataPegawai, setDataPegawai] = useState(null)
  const [memuatDataPegawai, setMemuatDataPegawai] = useState(false)
  const [cariPegawai, setCariPegawai] = useState('')
  const [tambahPegawaiAktif, setTambahPegawaiAktif] = useState(false)
  const [editPegawaiIndex, setEditPegawaiIndex] = useState(null)
  const [menyimpanPegawai, setMenyimpanPegawai] = useState(false)
  const [pesanPegawai, setPesanPegawai] = useState('')

  useEffect(() => {
    const perluDataPegawai = menuAktif === 'penilaian-asn' || menuAktif === 'penilaian-individu'
    if (!perluDataPegawai) return
    async function muatDataPegawai() {
      setMemuatDataPegawai(true)
      try {
        const ref = doc(db, 'dataPegawai', 'utama')
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setDataPegawai(snap.data().data || [])
        } else {
          await setDoc(ref, { data: DATA_PEGAWAI, diunggahPada: serverTimestamp() })
          setDataPegawai(DATA_PEGAWAI)
        }
      } catch {
        // Kalau gagal memuat dari Firestore (mis. offline), tetap tampilkan data bawaan supaya halaman tidak kosong.
        setDataPegawai(DATA_PEGAWAI)
      } finally {
        setMemuatDataPegawai(false)
      }
    }
    muatDataPegawai()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuAktif, subPenilaianAsn, subPenilaianIndividu])

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

  async function simpanDataPegawaiKeFirestore(dataBaru) {
    await setDoc(doc(db, 'dataPegawai', 'utama'), { data: dataBaru, diunggahPada: serverTimestamp() })
    setDataPegawai(dataBaru)
  }

  async function tambahPegawai(form) {
    setPesanPegawai('')
    const nip = form.nip.trim()
    if (!nip || !form.nama.trim()) {
      setPesanPegawai('NIP dan Nama wajib diisi.')
      return
    }
    if (dataPegawai.some((p) => p.nip === nip)) {
      setPesanPegawai('NIP sudah dipakai pegawai lain.')
      return
    }
    setMenyimpanPegawai(true)
    try {
      const baru = [...dataPegawai, {
        nip, nama: form.nama.trim(), jabatan: form.jabatan.trim(), unitKerja: form.unitKerja.trim(), atasan: form.atasan.trim(),
      }]
      await simpanDataPegawaiKeFirestore(baru)
      setTambahPegawaiAktif(false)
    } catch (err) {
      setPesanPegawai('Gagal menambah: ' + err.message)
    } finally {
      setMenyimpanPegawai(false)
    }
  }

  async function simpanEditPegawai(index, form) {
    setPesanPegawai('')
    const nip = form.nip.trim()
    if (!nip || !form.nama.trim()) {
      setPesanPegawai('NIP dan Nama wajib diisi.')
      return
    }
    if (dataPegawai.some((p, i) => p.nip === nip && i !== index)) {
      setPesanPegawai('NIP sudah dipakai pegawai lain.')
      return
    }
    setMenyimpanPegawai(true)
    try {
      const baru = dataPegawai.map((p, i) => (i === index ? {
        nip, nama: form.nama.trim(), jabatan: form.jabatan.trim(), unitKerja: form.unitKerja.trim(), atasan: form.atasan.trim(),
      } : p))
      await simpanDataPegawaiKeFirestore(baru)
      setEditPegawaiIndex(null)
    } catch (err) {
      setPesanPegawai('Gagal menyimpan: ' + err.message)
    } finally {
      setMenyimpanPegawai(false)
    }
  }

  async function hapusPegawai(index) {
    if (!confirm(`Hapus data ${dataPegawai[index]?.nama}?`)) return
    setPesanPegawai('')
    try {
      const baru = dataPegawai.filter((_, i) => i !== index)
      await simpanDataPegawaiKeFirestore(baru)
    } catch (err) {
      setPesanPegawai('Gagal menghapus: ' + err.message)
    }
  }

  function idPenetapan(bulanIdx, tahun, atasan) {
    return `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}_${atasan.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()}`
  }

  useEffect(() => {
    setPesanPenetapan('')
    setPenetapanTersimpan(null)
    if (!atasanTerpilih || atasanTerpilih === '__semua__') return
    async function cekPenetapan() {
      try {
        const snap = await getDoc(doc(db, 'atasanPenilai', idPenetapan(atasanBulan, atasanTahun, atasanTerpilih)))
        if (snap.exists()) setPenetapanTersimpan(snap.data())
      } catch {
        // biarkan saja, tidak fatal kalau gagal cek status penetapan
      }
    }
    cekPenetapan()
  }, [atasanBulan, atasanTahun, atasanTerpilih])

  useEffect(() => {
    if (menuAktif !== 'penilaian-individu' || subPenilaianIndividu !== 'atasan') return
    muatDaftarPenetapan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuAktif, subPenilaianIndividu])

  useEffect(() => {
    if (menuAktif !== 'penilaian-individu' || subPenilaianIndividu !== 'nilai' || !atasanTerpilih || !dataPegawai) return
    let daftar
    if (atasanTerpilih === '__semua__') {
      daftar = dataPegawai
    } else {
      const pakai = penetapanTersimpan && penetapanTersimpan.atasan === atasanTerpilih
      daftar = pakai ? penetapanTersimpan.pegawai : dataPegawai.filter((p) => p.atasan === atasanTerpilih)
    }
    if (daftar.length > 0) muatPetaNilai(daftar, atasanBulan, atasanTahun)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuAktif, subPenilaianIndividu, atasanTerpilih, atasanBulan, atasanTahun, dataPegawai, penetapanTersimpan])

  async function simpanPenetapanAtasan(daftarPegawaiBinaan) {
    setMenyimpanPenetapan(true)
    setPesanPenetapan('')
    try {
      const id = idPenetapan(atasanBulan, atasanTahun, atasanTerpilih)
      await setDoc(doc(db, 'atasanPenilai', id), {
        bulan: atasanBulan,
        tahun: atasanTahun,
        atasan: atasanTerpilih,
        pegawai: daftarPegawaiBinaan.map((p) => ({ nip: p.nip, nama: p.nama, jabatan: p.jabatan, unitKerja: p.unitKerja })),
        ditetapkanPada: serverTimestamp(),
      })
      setPenetapanTersimpan({ atasan: atasanTerpilih, pegawai: daftarPegawaiBinaan })
      setPesanPenetapan(`Berhasil menetapkan ${daftarPegawaiBinaan.length} pegawai binaan untuk ${atasanTerpilih}.`)
      muatDaftarPenetapan()
    } catch (err) {
      setPesanPenetapan('Gagal menyimpan: ' + err.message)
    } finally {
      setMenyimpanPenetapan(false)
    }
  }

  async function muatDaftarPenetapan() {
    setMemuatDaftarPenetapan(true)
    try {
      const snap = await getDocs(collection(db, 'atasanPenilai'))
      const daftar = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      daftar.sort((a, b) => (b.tahun - a.tahun) || (b.bulan - a.bulan) || a.atasan.localeCompare(b.atasan))
      setDaftarPenetapan(daftar)
    } catch {
      setDaftarPenetapan([])
    } finally {
      setMemuatDaftarPenetapan(false)
    }
  }

  async function hapusPenetapan(id) {
    if (!confirm('Hapus penetapan ini?')) return
    try {
      await deleteDoc(doc(db, 'atasanPenilai', id))
      setDaftarPenetapan((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      alert('Gagal menghapus: ' + err.message)
    }
  }

  useEffect(() => {
    if (menuAktif !== 'penilaian-individu' || subPenilaianIndividu !== 'pimpinan') return
    muatDaftarPimpinan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuAktif, subPenilaianIndividu])

  async function muatDaftarPimpinan() {
    setMemuatPimpinan(true)
    try {
      const snap = await getDocs(collection(db, 'pimpinan'))
      const daftar = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.nama.localeCompare(b.nama))
      setDaftarPimpinan(daftar)
    } catch {
      setDaftarPimpinan([])
    } finally {
      setMemuatPimpinan(false)
    }
  }

  async function tambahPimpinan(form) {
    setPesanPimpinan('')
    const nip = form.nip.trim()
    if (!nip || !form.nama.trim() || !form.password) {
      setPesanPimpinan('NIP, Nama, dan Password wajib diisi.')
      return
    }
    if ((daftarPimpinan || []).some((p) => p.nip === nip)) {
      setPesanPimpinan('NIP sudah dipakai Pimpinan lain.')
      return
    }
    setMenyimpanPimpinan(true)
    try {
      const passwordHash = await hashPassword(form.password)
      const docRef = await addDoc(collection(db, 'pimpinan'), {
        nip, nama: form.nama.trim(), jabatan: form.jabatan.trim(), passwordHash,
      })
      setDaftarPimpinan((prev) => [...(prev || []), { id: docRef.id, nip, nama: form.nama.trim(), jabatan: form.jabatan.trim(), passwordHash }].sort((a, b) => a.nama.localeCompare(b.nama)))
      setTambahPimpinanAktif(false)
    } catch (err) {
      setPesanPimpinan('Gagal menambah: ' + err.message)
    } finally {
      setMenyimpanPimpinan(false)
    }
  }

  async function simpanEditPimpinan(id, form) {
    setPesanPimpinan('')
    const nip = form.nip.trim()
    if (!nip || !form.nama.trim()) {
      setPesanPimpinan('NIP dan Nama wajib diisi.')
      return
    }
    if ((daftarPimpinan || []).some((p) => p.nip === nip && p.id !== id)) {
      setPesanPimpinan('NIP sudah dipakai Pimpinan lain.')
      return
    }
    setMenyimpanPimpinan(true)
    try {
      const perubahan = { nip, nama: form.nama.trim(), jabatan: form.jabatan.trim() }
      if (form.password) perubahan.passwordHash = await hashPassword(form.password)
      await updateDoc(doc(db, 'pimpinan', id), perubahan)
      setDaftarPimpinan((prev) => prev.map((p) => (p.id === id ? { ...p, ...perubahan } : p)).sort((a, b) => a.nama.localeCompare(b.nama)))
      setEditPimpinanId(null)
    } catch (err) {
      setPesanPimpinan('Gagal menyimpan: ' + err.message)
    } finally {
      setMenyimpanPimpinan(false)
    }
  }

  async function hapusPimpinan(id, nama) {
    if (!confirm(`Hapus akun Pimpinan ${nama}?`)) return
    try {
      await deleteDoc(doc(db, 'pimpinan', id))
      setDaftarPimpinan((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      alert('Gagal menghapus: ' + err.message)
    }
  }

  function mulaiEditPenetapan(item) {
    setEditPenetapanId(item.id)
    setNipTerpilihEdit(new Set(item.pegawai.map((p) => p.nip)))
    setCariPegawaiEdit('')
  }

  async function simpanEditPenetapan(item) {
    setMenyimpanEditPenetapan(true)
    try {
      const pegawaiBaru = (dataPegawai || [])
        .filter((p) => nipTerpilihEdit.has(p.nip))
        .map((p) => ({ nip: p.nip, nama: p.nama, jabatan: p.jabatan, unitKerja: p.unitKerja }))
      await setDoc(doc(db, 'atasanPenilai', item.id), {
        bulan: item.bulan,
        tahun: item.tahun,
        atasan: item.atasan,
        pegawai: pegawaiBaru,
        ditetapkanPada: serverTimestamp(),
      })
      setEditPenetapanId(null)
      muatDaftarPenetapan()
    } catch (err) {
      alert('Gagal menyimpan perubahan: ' + err.message)
    } finally {
      setMenyimpanEditPenetapan(false)
    }
  }

  function idPenilaian(bulanIdx, tahun, nip) {
    return `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}_${nip}`
  }

  useEffect(() => {
    if (menuAktif !== 'penilaian-asn' || subPenilaianAsn !== 'utama' || !dataPegawai) return
    muatNilaiAsn(nilaiAsnBulan, nilaiAsnTahun)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuAktif, subPenilaianAsn, nilaiAsnBulan, nilaiAsnTahun, dataPegawai])

  async function muatNilaiAsn(bulanIdx, tahun) {
    setMemuatNilaiAsn(true)
    try {
      // Pot. Presensi dari menu SIPP untuk bulan-tahun ini
      const sippId = `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}`
      const sippSnap = await getDoc(doc(db, 'sipp', sippId))
      const petaPresensi = {}
      if (sippSnap.exists()) {
        (sippSnap.data().data || []).forEach((p) => { petaPresensi[p.nip] = p.penguranganPresensi })
      }

      // Pot. Apel dari data absensi e-Apel untuk bulan-tahun ini (jumlah Tidak Apel x 0,5%)
      const bulanStr = `${tahun}-${String(bulanIdx + 1).padStart(2, '0')}`
      const absensiSnap = await getDocs(
        query(collection(db, 'absensi'), where('tanggal', '>=', `${bulanStr}-01`), where('tanggal', '<=', `${bulanStr}-31`)),
      )
      const jumlahTidakApel = {}
      absensiSnap.docs.forEach((d) => {
        const a = d.data()
        if (a.status === 'tidak_apel' && a.nip) jumlahTidakApel[a.nip] = (jumlahTidakApel[a.nip] || 0) + 1
      })

      // e-Kinerja (skor akhir) dari menu Penilaian Individu untuk bulan-tahun ini
      const penilaianSnap = await getDocs(
        query(collection(db, 'penilaianIndividu'), where('bulan', '==', bulanIdx), where('tahun', '==', tahun)),
      )
      // e-Kinerja diambil dari Pot. Penilaian (skorAkhir) di menu Penilaian Individu untuk bulan-tahun ini
      const petaKinerja = {}
      penilaianSnap.docs.forEach((d) => { const p = d.data(); petaKinerja[p.nip] = p.skorAkhir })

      const gabungan = dataPegawai.map((p) => ({
        nip: p.nip,
        nama: p.nama,
        unitKerja: p.unitKerja,
        jabatan: p.jabatan,
        presensiKehadiran: petaPresensi[p.nip] ?? null,
        kehadiranApel: jumlahTidakApel[p.nip] != null ? Math.round(jumlahTidakApel[p.nip] * 0.5 * 100) / 100 : 0,
        eKinerja: petaKinerja[p.nip] ?? null,
      }))
      setNilaiAsnData(gabungan)
    } catch (err) {
      setNilaiAsnData([])
    } finally {
      setMemuatNilaiAsn(false)
    }
  }

  async function muatPetaNilai(daftarPegawai, bulanIdx, tahun) {
    setMemuatNilaiMap(true)
    try {
      const hasil = {}
      await Promise.all(daftarPegawai.map(async (p) => {
        const snap = await getDoc(doc(db, 'penilaianIndividu', idPenilaian(bulanIdx, tahun, p.nip)))
        if (snap.exists()) hasil[p.nip] = snap.data()
      }))
      setNilaiTersimpanMap(hasil)
    } catch {
      // tidak fatal — daftar tetap tampil tanpa status nilai
    } finally {
      setMemuatNilaiMap(false)
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
        pejabatPenilai: atasanTerpilih,
        bulan: atasanBulan,
        tahun: atasanTahun,
        jawaban: KRITERIA_PENILAIAN.map((k, i) => ({
          pertanyaan: k.pertanyaan, huruf: jawabanForm[i].huruf, jawaban: jawabanForm[i].teks, skor: jawabanForm[i].skor,
        })),
        skorTotal,
        skorAkhir,
        dinilaiPada: serverTimestamp(),
      }
      await setDoc(doc(db, 'penilaianIndividu', idPenilaian(atasanBulan, atasanTahun, pegawaiDinilai.nip)), data)
      setNilaiTersimpanMap((prev) => ({ ...prev, [pegawaiDinilai.nip]: data }))
      setPegawaiDinilai(null)
    } catch (err) {
      setPesanNilai('Gagal menyimpan: ' + err.message)
    } finally {
      setMenyimpanNilai(false)
    }
  }

  function pilihMenu(key) {
    const peta = {
      dashboard: '/basedata',
      'penilaian-asn': '/basedata/nilai-asn',
      'penilaian-asn:utama': '/basedata/nilai-asn',
      'penilaian-asn:data-pegawai': '/basedata/nilai-asn/data-asn',
      sipp: '/basedata/sipp',
      'sipp:utama': '/basedata/sipp',
      'sipp:potongan-tpp': '/basedata/sipp/potongan-tpp',
      'penilaian-individu': '/basedata/penilaian-individu',
      'penilaian-individu:nilai': '/basedata/penilaian-individu',
      'penilaian-individu:atasan': '/basedata/penilaian-individu/kelompok-asn',
      'penilaian-individu:pimpinan': '/basedata/penilaian-individu/daftar-pimpinan',
    }
    navigate(peta[key] || '/basedata')
    setMenuTerbuka(false)
  }

  function toggleGrup(key) {
    setGrupTerbuka((prev) => (prev === key ? null : key))
  }

  const judulHalaman = {
    dashboard: 'Dashboard',
    'penilaian-asn': 'Nilai ASN',
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
        className={`fixed md:sticky md:top-0 inset-y-0 left-0 z-40 w-64 h-screen shrink-0 bg-white border-r border-ink/10 flex-col transform transition-transform duration-200 md:flex md:translate-x-0 ${
          menuTerbuka ? 'flex translate-x-0' : 'flex -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-5 py-5 border-b border-ink/10 flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-sikeren.png`}
            alt="SiKeren"
            className="w-9 h-9 rounded-xl shrink-0 object-cover"
          />
          <div>
            <p className="font-display font-semibold leading-tight">{menuAktif === 'dashboard' ? 'SiKeren' : judulHalaman}</p>
            <p className="text-xs text-ink/50 font-mono">Portal Admin</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuAktif === 'dashboard' && (
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
          )}

          {(menuAktif === 'dashboard' ? NAV_GROUPS : NAV_GROUPS.filter((g) => g.key === menuAktif)).map((group) => {
            const terbuka = menuAktif === group.key ? true : grupTerbuka === group.key
            const Ikon = group.key === 'penilaian-asn' ? IkonBintang : group.key === 'sipp' ? IkonDokumen : IkonOrang
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
                        && ((item.key.endsWith('utama') && group.key === 'penilaian-asn' && subPenilaianAsn === 'utama')
                          || (item.key.endsWith('data-pegawai') && group.key === 'penilaian-asn' && subPenilaianAsn === 'data-pegawai')
                          || (item.key.endsWith('utama') && group.key === 'sipp' && subSipp === 'utama')
                          || (item.key.endsWith('potongan-tpp') && group.key === 'sipp' && subSipp === 'potongan-tpp')
                          || (item.key.endsWith('nilai') && group.key === 'penilaian-individu' && subPenilaianIndividu === 'nilai')
                          || (item.key.endsWith('atasan') && group.key === 'penilaian-individu' && subPenilaianIndividu === 'atasan')
                          || (item.key.endsWith('pimpinan') && group.key === 'penilaian-individu' && subPenilaianIndividu === 'pimpinan'))
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

          {menuAktif === 'dashboard' && (
          <Link
            to="/login"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-ink/70 hover:bg-moss-100 transition-colors mt-2"
          >
            <IkonAdmin />
            e-Apel
          </Link>
          )}
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
          <p className="font-display font-semibold">{menuAktif === 'dashboard' ? 'SiKeren' : judulHalaman}</p>
        </header>

        <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 ${menuAktif === 'dashboard' || menuAktif === 'sipp' || menuAktif === 'penilaian-asn' || menuAktif === 'penilaian-individu' ? 'max-w-5xl' : 'max-w-2xl'}`}>
          {menuAktif === 'dashboard' ? (
            <div>
              <div className="relative overflow-hidden rounded-xl2 bg-moss-900 text-paper px-6 py-10 sm:py-14 mb-8 text-center">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/kantor-bupati-hsu.jpg)` }}
                />
                <div className="absolute inset-0 bg-moss-900/60" />
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 12% 15%, rgba(201,162,39,0.35), transparent 35%), radial-gradient(circle at 88% 85%, rgba(201,162,39,0.25), transparent 40%)',
                  }}
                />
                <div className="relative max-w-lg mx-auto">
                  <img
                    src={`${import.meta.env.BASE_URL}images/logo-sikeren.png`}
                    alt="SiKeren"
                    className="w-16 h-16 mx-auto rounded-2xl mb-4 object-cover"
                  />
                  <p className="text-xs font-mono uppercase tracking-widest text-gold-400 mb-2">Portal Modul Internal</p>
                  <h1 className="font-display font-bold text-3xl sm:text-5xl">SiKeren</h1>
                  <p className="text-paper/80 text-sm sm:text-base mt-2">
                    Portal terpadu penilaian, presensi, dan data kepegawaian.
                  </p>
                </div>
              </div>

              <p className="text-xs font-mono uppercase tracking-wide text-ink/40 mb-3">Modul Tersedia</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button type="button" onClick={() => pilihMenu('penilaian-asn')} className="text-left bg-gold-50 border border-gold-200 rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gold-500 text-ink"><IkonBintang /></div>
                  <p className="font-display font-semibold text-ink">Nilai ASN</p>
                  <p className="text-ink/50 text-xs mt-1.5 leading-relaxed">Penilaian kinerja dan perilaku kerja ASN secara berkala.</p>
                  <span className="inline-block mt-4 text-xs px-2.5 py-1 rounded-full font-medium bg-clay/10 text-clay">Segera Hadir</span>
                </button>

                <button type="button" onClick={() => pilihMenu('sipp')} className="text-left bg-moss-50 border border-moss-200 rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-moss-700 text-paper"><IkonDokumen /></div>
                  <p className="font-display font-semibold text-ink">SIPP</p>
                  <p className="text-ink/50 text-xs mt-1.5 leading-relaxed">Rekapitulasi presensi bulanan & perhitungan potongan TPP.</p>
                  <span className="inline-block mt-4 text-xs px-2.5 py-1 rounded-full font-medium bg-moss-100 text-moss-800">Aktif</span>
                </button>

                <Link to="/login" className="text-left bg-gold-50 border border-gold-200 rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gold-500 text-ink"><IkonAdmin /></div>
                  <p className="font-display font-semibold text-ink">e-Apel</p>
                  <p className="text-ink/50 text-xs mt-1.5 leading-relaxed">Kelola data pegawai, laporan absensi, dan konfigurasi lokasi apel.</p>
                  <span className="inline-block mt-4 text-xs px-2.5 py-1 rounded-full font-medium bg-gold-500/20 text-gold-700">Aktif</span>
                </Link>

                <button type="button" onClick={() => pilihMenu('penilaian-individu')} className="text-left bg-clay/5 border border-clay/20 rounded-xl2 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-clay text-paper"><IkonOrang /></div>
                  <p className="font-display font-semibold text-ink">Penilaian Individu</p>
                  <p className="text-ink/50 text-xs mt-1.5 leading-relaxed">Catatan penilaian dan capaian kerja per individu pegawai.</p>
                  <span className="inline-block mt-4 text-xs px-2.5 py-1 rounded-full font-medium bg-clay/10 text-clay">Aktif</span>
                </button>
              </div>
            </div>
          ) : menuAktif === 'penilaian-asn' ? (
            <div>
              <h1 className="font-display font-bold text-2xl text-ink mb-4">{subPenilaianAsn === 'utama' ? 'Nilai ASN' : 'Data ASN'}</h1>
              {subPenilaianAsn === 'utama' ? (
                (() => {
                  const q = cariNilaiAsn.toLowerCase()
                  const tersaring = (nilaiAsnData || []).filter((p) =>
                    !q
                    || p.nip.includes(q)
                    || p.nama.toLowerCase().includes(q)
                    || (p.unitKerja || '').toLowerCase().includes(q)
                    || (p.jabatan || '').toLowerCase().includes(q),
                  )
                  return (
                    <div>
                      <p className="text-ink/60 text-sm mb-4">Rekap gabungan per pegawai untuk periode yang dipilih: Presensi Kehadiran (dari SIPP), Kehadiran Apel (dari e-Apel), dan Penilaian Individu (Pot. Penilaian dari menu Penilaian Individu).</p>

                      <div className="flex flex-wrap items-end gap-3 mb-4">
                        <div>
                          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Bulan</label>
                          <select
                            value={nilaiAsnBulan}
                            onChange={(e) => setNilaiAsnBulan(Number(e.target.value))}
                            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                          >
                            {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Tahun</label>
                          <select
                            value={nilaiAsnTahun}
                            onChange={(e) => setNilaiAsnTahun(Number(e.target.value))}
                            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                          >
                            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <input
                          value={cariNilaiAsn}
                          onChange={(e) => setCariNilaiAsn(e.target.value)}
                          placeholder="Cari NIP, nama, bagian, atau jabatan…"
                          className="rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm w-full max-w-xs"
                        />
                      </div>

                      {memuatNilaiAsn ? (
                        <p className="text-ink/50 font-mono text-sm">Memuat…</p>
                      ) : (
                        <>
                          <p className="text-ink/50 text-xs font-mono mb-3">{tersaring.length} dari {(nilaiAsnData || []).length} pegawai — {namaBulan(nilaiAsnBulan)} {nilaiAsnTahun}</p>
                          <div className="border border-ink/10 rounded-xl2 overflow-x-auto">
                            <table className="w-full text-sm min-w-[820px]">
                              <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
                                <tr>
                                  <th className="px-4 py-3">NIP</th>
                                  <th className="px-4 py-3">Nama</th>
                                  <th className="px-4 py-3">Jabatan</th>
                                  <th className="px-4 py-3 w-36">Presensi Kehadiran</th>
                                  <th className="px-4 py-3 w-32">Kehadiran Apel</th>
                                  <th className="px-4 py-3 w-36">Penilaian Individu</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-ink/10">
                                {tersaring.map((p, i) => (
                                  <tr key={`${p.nip}-${i}`}>
                                    <td className="px-4 py-3 font-mono whitespace-nowrap">{p.nip}</td>
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">{p.nama}</td>
                                    <td className="px-4 py-3">{p.jabatan}</td>
                                    <td className="px-4 py-3">{p.presensiKehadiran != null ? `${p.presensiKehadiran}%` : <span className="text-ink/30">—</span>}</td>
                                    <td className="px-4 py-3">{p.kehadiranApel}%</td>
                                    <td className="px-4 py-3 font-semibold text-moss-800">{p.eKinerja != null ? `${p.eKinerja}%` : <span className="text-ink/30 font-normal">—</span>}</td>
                                  </tr>
                                ))}
                                {tersaring.length === 0 && (
                                  <tr><td colSpan={6} className="px-4 py-4 text-center text-ink/40">Tidak ada data.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })()
              ) : (
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <input
                      value={cariPegawai}
                      onChange={(e) => setCariPegawai(e.target.value)}
                      placeholder="Cari NIP, nama, jabatan, atau unit kerja…"
                      className="w-full max-w-md rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => { setTambahPegawaiAktif((v) => !v); setEditPegawaiIndex(null); setPesanPegawai('') }}
                      className="bg-moss-700 text-paper text-sm font-medium rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors"
                    >
                      {tambahPegawaiAktif ? 'Tutup Form' : '+ Tambah Pegawai'}
                    </button>
                  </div>

                  {pesanPegawai && (
                    <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2 mb-4">{pesanPegawai}</p>
                  )}

                  {tambahPegawaiAktif && (
                    <FormPegawai
                      onBatal={() => setTambahPegawaiAktif(false)}
                      onSimpan={tambahPegawai}
                      menyimpan={menyimpanPegawai}
                    />
                  )}

                  {memuatDataPegawai ? (
                    <p className="text-ink/50 font-mono text-sm">Memuat…</p>
                  ) : dataPegawai && dataPegawai.length > 0 ? (
                    (() => {
                      const q = cariPegawai.toLowerCase()
                      const tersaring = dataPegawai
                        .map((p, idx) => ({ p, idx }))
                        .filter(({ p }) =>
                          !q
                          || p.nip.includes(q)
                          || p.nama.toLowerCase().includes(q)
                          || (p.jabatan || '').toLowerCase().includes(q)
                          || (p.unitKerja || '').toLowerCase().includes(q),
                        )
                      return (
                        <>
                          <p className="text-ink/50 text-xs font-mono mb-3">{tersaring.length} dari {dataPegawai.length} pegawai</p>
                          <div className="border border-ink/10 rounded-xl2 overflow-x-auto">
                            <table className="w-full text-sm min-w-[1000px]">
                              <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
                                <tr>
                                  <th className="px-3 py-3">NIP</th>
                                  <th className="px-3 py-3">Nama</th>
                                  <th className="px-3 py-3">Jabatan</th>
                                  <th className="px-3 py-3">Unit Kerja</th>
                                  <th className="px-3 py-3 w-28">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-ink/10">
                                {tersaring.map(({ p, idx }) => (
                                  editPegawaiIndex === idx ? (
                                    <tr key={`${p.nip}-${idx}`}>
                                      <td colSpan={5} className="px-3 py-3 bg-moss-50/60">
                                        <FormPegawai
                                          awal={p}
                                          onBatal={() => setEditPegawaiIndex(null)}
                                          onSimpan={(form) => simpanEditPegawai(idx, form)}
                                          menyimpan={menyimpanPegawai}
                                        />
                                      </td>
                                    </tr>
                                  ) : (
                                    <tr key={`${p.nip}-${idx}`}>
                                      <td className="px-3 py-2.5 font-mono whitespace-nowrap">{p.nip}</td>
                                      <td className="px-3 py-2.5 font-medium whitespace-nowrap">{p.nama}</td>
                                      <td className="px-3 py-2.5">{p.jabatan}</td>
                                      <td className="px-3 py-2.5 whitespace-nowrap">{p.unitKerja}</td>
                                      <td className="px-3 py-2.5 whitespace-nowrap">
                                        <button
                                          type="button"
                                          onClick={() => { setEditPegawaiIndex(idx); setTambahPegawaiAktif(false); setPesanPegawai('') }}
                                          className="text-moss-700 font-medium hover:underline mr-3"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => hapusPegawai(idx)}
                                          className="text-clay font-medium hover:underline"
                                        >
                                          Hapus
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )
                    })()
                  ) : (
                    <div className="bg-white/60 border border-ink/10 rounded-xl2 p-6 text-center">
                      <p className="text-ink/60 text-sm">Belum ada data pegawai.</p>
                    </div>
                  )}
                </div>
              )}
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
          ) : menuAktif === 'penilaian-individu' ? (
            <div>
              <h1 className="font-display font-bold text-2xl text-ink mb-4">
                {subPenilaianIndividu === 'nilai' ? 'Penilaian Individu' : subPenilaianIndividu === 'atasan' ? 'Kelompok ASN' : 'Daftar Pimpinan'}
              </h1>

              {subPenilaianIndividu === 'nilai' ? (
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
                      <p className="text-ink/50 text-xs font-mono">{pegawaiDinilai.nip} · {pegawaiDinilai.jabatan} · {pegawaiDinilai.unitKerja}</p>
                      <p className="text-ink/50 text-xs font-mono mt-1">Pejabat Penilai: {atasanTerpilih} · Periode: {namaBulan(atasanBulan)} {atasanTahun}</p>
                    </div>

                    {pesanNilai && (
                      <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2 mb-4">{pesanNilai}</p>
                    )}

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
                (() => {
                  const daftarAtasanNilai = dataPegawai
                    ? [...new Set(dataPegawai.map((p) => p.atasan).filter(Boolean))].sort()
                    : []
                  const semuaAtasan = atasanTerpilih === '__semua__'
                  const binaanLive = atasanTerpilih && dataPegawai && !semuaAtasan
                    ? dataPegawai.filter((p) => p.atasan === atasanTerpilih)
                    : []
                  const pakaiPenetapanTersimpan = !semuaAtasan && penetapanTersimpan && penetapanTersimpan.atasan === atasanTerpilih
                  const daftarUntukDinilai = semuaAtasan
                    ? (dataPegawai || [])
                    : pakaiPenetapanTersimpan ? penetapanTersimpan.pegawai : binaanLive

                  function downloadExcelNilai() {
                    const baris = daftarUntukDinilai.map((p) => {
                      const sudah = nilaiTersimpanMap[p.nip]
                      return {
                        NIP: p.nip,
                        Nama: p.nama,
                        Skor: sudah ? sudah.skorTotal : '',
                        'Pot. Penilaian': sudah ? `${sudah.skorAkhir}%` : '0%',
                      }
                    })
                    const namaAtasan = semuaAtasan ? 'Semua-Atasan' : atasanTerpilih.replace(/[^a-zA-Z0-9]+/g, '-')
                    unduhExcel(`Penilaian-Individu-${namaAtasan}-${namaBulan(atasanBulan)}-${atasanTahun}.xlsx`, baris, 'Penilaian Individu')
                  }

                  return (
                    <div>
                      <p className="text-ink/60 text-sm mb-4">Pilih bulan, tahun, dan Atasan Penilai — daftar pegawai yang dinilai muncul otomatis (memakai penetapan tersimpan dari menu Kelompok ASN kalau ada, atau data Atasan terkini dari Data ASN).</p>

                      <div className="flex flex-wrap items-end gap-3 mb-5">
                        <div>
                          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Bulan</label>
                          <select
                            value={atasanBulan}
                            onChange={(e) => setAtasanBulan(Number(e.target.value))}
                            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                          >
                            {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Tahun</label>
                          <select
                            value={atasanTahun}
                            onChange={(e) => setAtasanTahun(Number(e.target.value))}
                            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                          >
                            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Atasan Penilai</label>
                          <select
                            value={atasanTerpilih}
                            onChange={(e) => setAtasanTerpilih(e.target.value)}
                            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm min-w-[240px]"
                          >
                            <option value="">— Pilih Atasan —</option>
                            <option value="__semua__">Semua Atasan</option>
                            {daftarAtasanNilai.map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={downloadExcelNilai}
                          disabled={!atasanTerpilih || daftarUntukDinilai.length === 0}
                          className="bg-moss-700 text-paper text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-50 ml-auto"
                        >
                          Download Excel
                        </button>
                      </div>

                      {memuatDataPegawai ? (
                        <p className="text-ink/50 font-mono text-sm">Memuat…</p>
                      ) : !atasanTerpilih ? (
                        <div className="bg-white/60 border border-ink/10 rounded-xl2 p-6 text-center">
                          <p className="text-ink/60 text-sm">Pilih Atasan Penilai untuk menampilkan daftar pegawai yang dinilai.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-ink/50 text-xs font-mono mb-3">
                            {daftarUntukDinilai.length} pegawai {semuaAtasan ? '(semua Atasan)' : `di bawah ${atasanTerpilih}`} untuk {namaBulan(atasanBulan)} {atasanTahun}
                            {semuaAtasan ? '' : pakaiPenetapanTersimpan ? ' (dari penetapan tersimpan)' : ' (dari Data ASN — belum ada penetapan tersimpan)'}
                            {memuatNilaiMap ? ' · memuat status nilai…' : ''}
                          </p>
                          <div className="border border-ink/10 rounded-xl2 overflow-x-auto">
                            <table className="w-full text-sm min-w-[620px]">
                              <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
                                <tr>
                                  <th className="px-3 py-3">NIP</th>
                                  <th className="px-3 py-3">Nama</th>
                                  <th className="px-3 py-3 w-24">Skor</th>
                                  <th className="px-3 py-3 w-32">Pot. Penilaian</th>
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
                                        {sudah ? (
                                          <span className="font-semibold text-moss-800">{sudah.skorTotal}</span>
                                        ) : (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-clay/10 text-clay font-medium">Belum</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2.5">
                                        {sudah ? `${sudah.skorAkhir}%` : '0%'}
                                      </td>
                                      <td className="px-3 py-2.5 whitespace-nowrap">
                                        <button
                                          type="button"
                                          onClick={() => mulaiNilaiPegawai(p)}
                                          className="text-moss-700 font-medium hover:underline"
                                        >
                                          {sudah ? 'Ubah Nilai' : 'Beri Nilai'}
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                })}
                                {daftarUntukDinilai.length === 0 && (
                                  <tr><td colSpan={5} className="px-3 py-4 text-center text-ink/40">Tidak ada pegawai untuk Atasan ini.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()
                )
              ) : subPenilaianIndividu === 'atasan' ? (
                (() => {
                  const daftarAtasan = dataPegawai
                    ? [...new Set(dataPegawai.map((p) => p.atasan).filter(Boolean))].sort()
                    : []
                  const pegawaiBinaan = atasanTerpilih && dataPegawai
                    ? dataPegawai.filter((p) => p.atasan === atasanTerpilih)
                    : []
                  return (
                    <div>
                      <p className="text-ink/60 text-sm mb-4">Pilih bulan, tahun, dan Atasan — daftar pegawai binaannya diambil otomatis dari menu Data ASN (Nilai ASN), berdasarkan kolom Atasan.</p>

                      <div className="flex flex-wrap items-end gap-3 mb-5">
                        <div>
                          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Bulan</label>
                          <select
                            value={atasanBulan}
                            onChange={(e) => setAtasanBulan(Number(e.target.value))}
                            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                          >
                            {Array.from({ length: 12 }).map((_, i) => <option key={i} value={i}>{namaBulan(i)}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Tahun</label>
                          <select
                            value={atasanTahun}
                            onChange={(e) => setAtasanTahun(Number(e.target.value))}
                            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                          >
                            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ink/60 uppercase tracking-wide font-mono">Atasan</label>
                          <select
                            value={atasanTerpilih}
                            onChange={(e) => setAtasanTerpilih(e.target.value)}
                            className="mt-1 rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm min-w-[240px]"
                          >
                            <option value="">— Pilih Atasan —</option>
                            {daftarAtasan.map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                      </div>

                      {memuatDataPegawai ? (
                        <p className="text-ink/50 font-mono text-sm">Memuat…</p>
                      ) : !atasanTerpilih ? (
                        <div className="bg-white/60 border border-ink/10 rounded-xl2 p-6 text-center">
                          <p className="text-ink/60 text-sm">Pilih Atasan untuk menampilkan daftar pegawai binaannya.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-ink/50 text-xs font-mono mb-3">{pegawaiBinaan.length} pegawai di bawah {atasanTerpilih} untuk {namaBulan(atasanBulan)} {atasanTahun}</p>

                          {pesanPenetapan && (
                            <p className={`text-sm rounded-lg px-3 py-2 mb-4 ${pesanPenetapan.startsWith('Gagal') ? 'text-clay bg-clay/10' : 'text-moss-800 bg-moss-50'}`}>
                              {pesanPenetapan}
                            </p>
                          )}

                          {penetapanTersimpan && (
                            <p className="text-xs text-moss-700 bg-moss-50 border border-moss-200 rounded-lg px-3 py-2 mb-4">
                              Sudah ditetapkan sebelumnya untuk periode ini.
                            </p>
                          )}

                          <div className="border border-ink/10 rounded-xl2 overflow-x-auto mb-4">
                            <table className="w-full text-sm min-w-[720px]">
                              <thead className="bg-ink/5 text-left text-xs font-mono uppercase text-ink/50">
                                <tr>
                                  <th className="px-3 py-3">NIP</th>
                                  <th className="px-3 py-3">Nama</th>
                                  <th className="px-3 py-3">Jabatan</th>
                                  <th className="px-3 py-3">Unit Kerja</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-ink/10">
                                {pegawaiBinaan.map((p, i) => (
                                  <tr key={`${p.nip}-${i}`}>
                                    <td className="px-3 py-2.5 font-mono whitespace-nowrap">{p.nip}</td>
                                    <td className="px-3 py-2.5 font-medium whitespace-nowrap">{p.nama}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">{p.jabatan}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">{p.unitKerja}</td>
                                  </tr>
                                ))}
                                {pegawaiBinaan.length === 0 && (
                                  <tr><td colSpan={4} className="px-3 py-4 text-center text-ink/40">Tidak ada pegawai dengan Atasan ini di Data ASN.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          <button
                            type="button"
                            disabled={menyimpanPenetapan || pegawaiBinaan.length === 0}
                            onClick={() => simpanPenetapanAtasan(pegawaiBinaan)}
                            className="bg-moss-700 text-paper text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-moss-800 transition-colors disabled:opacity-50"
                          >
                            {menyimpanPenetapan ? 'Menyimpan…' : 'Tetapkan sebagai Atasan Penilai Periode Ini'}
                          </button>
                        </div>
                      )}

                      <hr className="border-ink/10 my-8" />

                      <h2 className="font-display font-semibold text-lg text-ink mb-1">Daftar Penetapan Tersimpan</h2>
                      <p className="text-ink/60 text-sm mb-4">Semua penetapan Atasan Penilai yang sudah disimpan, dari periode mana pun. Edit untuk mengubah daftar pegawai binaannya secara manual, atau Hapus untuk membatalkan penetapan.</p>

                      {memuatDaftarPenetapan ? (
                        <p className="text-ink/50 font-mono text-sm">Memuat…</p>
                      ) : daftarPenetapan && daftarPenetapan.length > 0 ? (
                        <div className="space-y-3">
                          {daftarPenetapan.map((item) => (
                            <div key={item.id} className="border border-ink/10 rounded-xl2 bg-white/60 p-4">
                              {editPenetapanId === item.id ? (
                                <div>
                                  <p className="font-medium text-ink mb-1">{item.atasan} — {namaBulan(item.bulan)} {item.tahun}</p>
                                  <input
                                    value={cariPegawaiEdit}
                                    onChange={(e) => setCariPegawaiEdit(e.target.value)}
                                    placeholder="Cari pegawai untuk ditambahkan/dihapus dari daftar…"
                                    className="my-2 w-full rounded-lg border border-ink/15 px-3 py-2 bg-white text-sm"
                                  />
                                  <div className="max-h-72 overflow-y-auto border border-ink/10 rounded-lg divide-y divide-ink/10">
                                    {(dataPegawai || [])
                                      .filter((p) => {
                                        const q = cariPegawaiEdit.toLowerCase()
                                        return !q || p.nama.toLowerCase().includes(q) || p.nip.includes(q) || (p.jabatan || '').toLowerCase().includes(q)
                                      })
                                      .map((p) => (
                                        <label key={p.nip} className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-moss-50">
                                          <input
                                            type="checkbox"
                                            checked={nipTerpilihEdit.has(p.nip)}
                                            onChange={(e) => {
                                              setNipTerpilihEdit((prev) => {
                                                const baru = new Set(prev)
                                                if (e.target.checked) baru.add(p.nip); else baru.delete(p.nip)
                                                return baru
                                              })
                                            }}
                                          />
                                          <span>{p.nama} <span className="text-ink/40 font-mono text-xs">({p.nip})</span></span>
                                        </label>
                                      ))}
                                  </div>
                                  <p className="text-xs text-ink/40 font-mono mt-2 mb-3">{nipTerpilihEdit.size} pegawai terpilih</p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      disabled={menyimpanEditPenetapan}
                                      onClick={() => simpanEditPenetapan(item)}
                                      className="text-sm font-medium bg-moss-700 text-paper rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors disabled:opacity-50"
                                    >
                                      {menyimpanEditPenetapan ? 'Menyimpan…' : 'Simpan'}
                                    </button>
                                    <button
                                      type="button"
                                      disabled={menyimpanEditPenetapan}
                                      onClick={() => setEditPenetapanId(null)}
                                      className="text-sm font-medium border border-ink/15 rounded-lg px-4 py-2 hover:bg-ink/5 transition-colors"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                  <div>
                                    <p className="font-medium text-ink">{item.atasan}</p>
                                    <p className="text-xs text-ink/50 font-mono">{namaBulan(item.bulan)} {item.tahun} · {item.pegawai?.length || 0} pegawai binaan</p>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <button type="button" onClick={() => mulaiEditPenetapan(item)} className="text-sm text-moss-700 font-medium hover:underline">Edit</button>
                                    <button type="button" onClick={() => hapusPenetapan(item.id)} className="text-sm text-clay font-medium hover:underline">Hapus</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-ink/50 text-sm">Belum ada penetapan tersimpan.</p>
                      )}
                    </div>
                  )
                })()
              ) : (
                <div>
                  <p className="text-ink/60 text-sm mb-4">Akun Pimpinan yang bisa login sendiri untuk memberi penilaian ke ASN terkait. NIP, Nama, Jabatan, dan Password diatur di sini.</p>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => { setTambahPimpinanAktif((v) => !v); setEditPimpinanId(null); setPesanPimpinan('') }}
                      className="bg-moss-700 text-paper text-sm font-medium rounded-lg px-4 py-2 hover:bg-moss-800 transition-colors"
                    >
                      {tambahPimpinanAktif ? 'Tutup Form' : '+ Tambah Pimpinan'}
                    </button>
                  </div>

                  {pesanPimpinan && (
                    <p className="text-sm text-clay bg-clay/10 rounded-lg px-3 py-2 mb-4">{pesanPimpinan}</p>
                  )}

                  {tambahPimpinanAktif && (
                    <FormPimpinan
                      onBatal={() => setTambahPimpinanAktif(false)}
                      onSimpan={tambahPimpinan}
                      menyimpan={menyimpanPimpinan}
                      daftarJabatan={dataPegawai ? [...new Set(dataPegawai.map((p) => p.atasan).filter(Boolean))].sort() : []}
                    />
                  )}

                  {memuatPimpinan ? (
                    <p className="text-ink/50 font-mono text-sm">Memuat…</p>
                  ) : daftarPimpinan && daftarPimpinan.length > 0 ? (
                    <ul className="divide-y divide-ink/10 border border-ink/10 rounded-xl2 overflow-hidden">
                      {daftarPimpinan.map((p) => (
                        editPimpinanId === p.id ? (
                          <li key={p.id} className="px-4 py-4 bg-moss-50/60">
                            <FormPimpinan
                              awal={p}
                              onBatal={() => setEditPimpinanId(null)}
                              onSimpan={(form) => simpanEditPimpinan(p.id, form)}
                              menyimpan={menyimpanPimpinan}
                              daftarJabatan={dataPegawai ? [...new Set(dataPegawai.map((p2) => p2.atasan).filter(Boolean))].sort() : []}
                            />
                          </li>
                        ) : (
                          <li key={p.id} className="flex items-center justify-between px-4 py-3 bg-white/60">
                            <div>
                              <p className="font-medium">{p.nama}</p>
                              <p className="text-xs font-mono text-ink/40">NIP {p.nip}{p.jabatan ? ` · ${p.jabatan}` : ''}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <button onClick={() => { setEditPimpinanId(p.id); setTambahPimpinanAktif(false); setPesanPimpinan('') }} className="text-sm text-moss-700 font-medium hover:underline">
                                Edit
                              </button>
                              <button onClick={() => hapusPimpinan(p.id, p.nama)} className="text-sm text-clay font-medium hover:underline">
                                Hapus
                              </button>
                            </div>
                          </li>
                        )
                      ))}
                    </ul>
                  ) : (
                    <p className="text-ink/50 text-sm">Belum ada akun Pimpinan.</p>
                  )}
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
