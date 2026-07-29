// Keterangan yang dipakai secara otomatis saat pegawai absen sesuai lokasi
export const KETERANGAN_OTOMATIS_SESUAI = 'apel_pagi'

// Pilihan keterangan saat pegawai berada diluar lokasi
export const KETERANGAN_LUAR = [
  { value: 'gabungan', label: 'Apel Gabungan' },
  { value: 'hari_besar', label: 'Apel Hari Besar' },
  { value: 'wfh', label: 'WFH' },
]

export const LABEL_KETERANGAN = {
  apel_pagi: 'Apel Pagi',
  gabungan: 'Apel Gabungan',
  hari_besar: 'Apel Hari Besar',
  wfh: 'WFH',
}

export const LABEL_STATUS = {
  sesuai: 'Berada Sesuai Lokasi',
  luar: 'Berada Diluar Lokasi',
  tidak_apel: 'Tidak Apel',
}
