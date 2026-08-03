import * as XLSX from 'xlsx'

// Membaca file Excel e-Kinerja. Format yang diharapkan (baris pertama = header):
// NIP, Nama, Nilai e-Kinerja
export async function parseFileEKinerja(file) {
  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer, { type: 'array' })
  const namaSheet = wb.SheetNames[0]
  const ws = wb.Sheets[namaSheet]
  const baris = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  // Cari baris header (baris yang salah satu selnya mengandung kata "nip")
  let indeksHeader = -1
  for (let i = 0; i < Math.min(baris.length, 10); i++) {
    const b = baris[i]
    if (b && b.some((v) => typeof v === 'string' && v.trim().toLowerCase() === 'nip')) {
      indeksHeader = i
      break
    }
  }
  if (indeksHeader === -1) {
    throw new Error('Format file tidak dikenali. Pastikan ada kolom NIP, Nama, dan Nilai e-Kinerja.')
  }

  const header = baris[indeksHeader].map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
  const idxNip = header.findIndex((h) => h === 'nip')
  const idxNama = header.findIndex((h) => h.includes('nama'))
  const idxNilai = header.findIndex((h) => h.includes('nilai') || h.includes('e-kinerja') || h.includes('ekinerja') || h.includes('skor'))

  if (idxNip === -1 || idxNilai === -1) {
    throw new Error('Kolom NIP dan Nilai e-Kinerja wajib ada pada file.')
  }

  const hasil = []
  for (let i = indeksHeader + 1; i < baris.length; i++) {
    const b = baris[i]
    if (!b || b[idxNip] == null || String(b[idxNip]).trim() === '') continue
    hasil.push({
      nip: String(b[idxNip]).trim(),
      nama: idxNama !== -1 ? (b[idxNama] || '') : '',
      nilai: Number(b[idxNilai]) || 0,
    })
  }
  if (hasil.length === 0) {
    throw new Error('Tidak ada baris data pegawai yang terbaca dari file ini.')
  }
  return hasil
}
