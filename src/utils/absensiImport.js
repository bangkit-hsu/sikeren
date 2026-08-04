import * as XLSX from 'xlsx'

const STATUS_VALID = ['sesuai', 'luar', 'tidak_apel']
const KETERANGAN_VALID = ['', 'gabungan', 'hari_besar', 'wfh']

function keTanggalIso(nilai) {
  if (nilai instanceof Date) {
    return `${nilai.getFullYear()}-${String(nilai.getMonth() + 1).padStart(2, '0')}-${String(nilai.getDate()).padStart(2, '0')}`
  }
  if (typeof nilai === 'number') {
    // Serial tanggal Excel
    const tgl = XLSX.SSF.parse_date_code(nilai)
    return `${tgl.y}-${String(tgl.m).padStart(2, '0')}-${String(tgl.d).padStart(2, '0')}`
  }
  return String(nilai || '').trim()
}

// Membaca file Excel berisi data absensi lama untuk diimpor.
// Kolom baku: NIP, Tanggal, Jam, Status (sesuai/luar/tidak_apel), Keterangan (opsional: gabungan/hari_besar/wfh)
export async function parseFileAbsensiImport(file) {
  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const baris = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  let indeksHeader = -1
  for (let i = 0; i < Math.min(baris.length, 10); i++) {
    const b = baris[i]
    if (b && b.some((v) => typeof v === 'string' && v.trim().toLowerCase() === 'nip')) {
      indeksHeader = i
      break
    }
  }
  if (indeksHeader === -1) {
    throw new Error('Format file tidak dikenali. Pastikan ada kolom NIP, Tanggal, Jam, dan Status.')
  }

  const header = baris[indeksHeader].map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
  const idxNip = header.findIndex((h) => h === 'nip')
  const idxTanggal = header.findIndex((h) => h.includes('tanggal'))
  const idxJam = header.findIndex((h) => h.includes('jam'))
  const idxStatus = header.findIndex((h) => h === 'status')
  const idxKeterangan = header.findIndex((h) => h.includes('keterangan'))

  if (idxNip === -1 || idxTanggal === -1 || idxStatus === -1) {
    throw new Error('Kolom NIP, Tanggal, dan Status wajib ada pada file.')
  }

  const hasil = []
  const barisError = []
  for (let i = indeksHeader + 1; i < baris.length; i++) {
    const b = baris[i]
    if (!b || b[idxNip] == null || String(b[idxNip]).trim() === '') continue
    const nomorBaris = i + 1
    const status = String(b[idxStatus] || '').trim().toLowerCase()
    const keterangan = idxKeterangan !== -1 ? String(b[idxKeterangan] || '').trim().toLowerCase() : ''
    if (!STATUS_VALID.includes(status)) {
      barisError.push(`Baris ${nomorBaris}: Status "${b[idxStatus]}" tidak dikenali (harus sesuai/luar/tidak_apel).`)
      continue
    }
    if (!KETERANGAN_VALID.includes(keterangan)) {
      barisError.push(`Baris ${nomorBaris}: Keterangan "${b[idxKeterangan]}" tidak dikenali (kosongkan atau isi gabungan/hari_besar/wfh).`)
      continue
    }
    const tanggal = keTanggalIso(b[idxTanggal])
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      barisError.push(`Baris ${nomorBaris}: Tanggal "${b[idxTanggal]}" tidak valid (format YYYY-MM-DD).`)
      continue
    }
    hasil.push({
      nip: String(b[idxNip]).trim(),
      tanggal,
      jam: idxJam !== -1 && b[idxJam] != null ? String(b[idxJam]).trim() : '00:00',
      status,
      keterangan: keterangan || null,
    })
  }
  if (barisError.length > 0) {
    throw new Error(`Ditemukan ${barisError.length} baris bermasalah. Contoh: ${barisError.slice(0, 3).join(' ')}`)
  }
  if (hasil.length === 0) {
    throw new Error('Tidak ada baris data yang terbaca dari file ini.')
  }
  return hasil
}

// Menyiapkan file template Excel untuk diisi admin.
export function templateAbsensiImport() {
  return [
    { NIP: '197011181991011002', Tanggal: '2026-07-03', Jam: '07:52', Status: 'sesuai', Keterangan: '' },
    { NIP: '197011181991011002', Tanggal: '2026-07-04', Jam: '08:10', Status: 'luar', Keterangan: '' },
    { NIP: '197011181991011002', Tanggal: '2026-07-07', Jam: '', Status: 'tidak_apel', Keterangan: '' },
    { NIP: '197102051992031009', Tanggal: '2026-07-17', Jam: '07:45', Status: 'sesuai', Keterangan: 'hari_besar' },
  ]
}
