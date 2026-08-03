import * as XLSX from 'xlsx'

// Membaca file Excel e-Kinerja (format baku ekspor e-Kinerja BKN/instansi).
// Kolom baku: No, Nama, NIP, Jabatan, Unor, Unor Induk, Periode, Tahun,
// Hasil Kerja, Perilaku Kerja, Hasil Akhir — data mulai baris ke-2.
export async function parseFileEKinerja(file) {
  const arrayBuffer = await file.arrayBuffer()
  const wb = XLSX.read(arrayBuffer, { type: 'array' })
  const namaSheet = wb.SheetNames[0]
  const ws = wb.Sheets[namaSheet]
  const baris = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })

  // Cari baris header (baris yang salah satu selnya persis "NIP")
  let indeksHeader = -1
  for (let i = 0; i < Math.min(baris.length, 10); i++) {
    const b = baris[i]
    if (b && b.some((v) => typeof v === 'string' && v.trim().toLowerCase() === 'nip')) {
      indeksHeader = i
      break
    }
  }
  if (indeksHeader === -1) {
    throw new Error('Format file tidak dikenali. Pastikan ada kolom NIP, Nama, dst sesuai format ekspor e-Kinerja.')
  }

  const header = baris[indeksHeader].map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
  const cari = (...kandidat) => header.findIndex((h) => kandidat.some((k) => h.includes(k)))
  const idxNip = cari('nip')
  const idxNama = cari('nama')
  const idxJabatan = cari('jabatan')
  const idxUnor = header.findIndex((h) => h === 'unor')
  const idxUnorInduk = cari('unor induk')
  const idxPeriode = cari('periode')
  const idxTahun = cari('tahun')
  const idxHasilKerja = cari('hasil kerja')
  const idxPerilakuKerja = cari('perilaku kerja')
  const idxHasilAkhir = cari('hasil akhir')

  if (idxNip === -1) {
    throw new Error('Kolom NIP wajib ada pada file.')
  }

  const hasil = []
  for (let i = indeksHeader + 1; i < baris.length; i++) {
    const b = baris[i]
    if (!b || b[idxNip] == null || String(b[idxNip]).trim() === '') continue
    hasil.push({
      nip: String(b[idxNip]).trim(),
      nama: idxNama !== -1 ? (b[idxNama] || '') : '',
      jabatan: idxJabatan !== -1 ? (b[idxJabatan] || '') : '',
      unor: idxUnor !== -1 ? (b[idxUnor] || '') : '',
      unorInduk: idxUnorInduk !== -1 ? (b[idxUnorInduk] || '') : '',
      periode: idxPeriode !== -1 ? (b[idxPeriode] || '') : '',
      tahunPeriode: idxTahun !== -1 ? (b[idxTahun] || '') : '',
      hasilKerja: idxHasilKerja !== -1 ? (b[idxHasilKerja] || '') : '',
      perilakuKerja: idxPerilakuKerja !== -1 ? (b[idxPerilakuKerja] || '') : '',
      hasilAkhir: idxHasilAkhir !== -1 ? (b[idxHasilAkhir] || '') : '',
    })
  }
  if (hasil.length === 0) {
    throw new Error('Tidak ada baris data pegawai yang terbaca dari file ini.')
  }
  return hasil
}
