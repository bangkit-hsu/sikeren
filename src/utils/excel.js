import * as XLSX from 'xlsx'

// Mengunduh sekumpulan baris data (array of objects) sebagai file Excel (.xlsx).
// Nama kolom mengikuti key pada objek baris pertama.
export function unduhExcel(namaFile, baris, namaSheet = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(baris)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, namaSheet)
  XLSX.writeFile(wb, namaFile)
}
