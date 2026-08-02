export const DAFTAR_BAGIAN = [
  'Administrasi Pembangunan',
  'Hukum',
  'Kesra',
  'Organisasi',
  'Pemerintahan',
  'Pengadaan Barang dan Jasa',
  'Perekonomian dan SDA',
  'Protokol dan Komunikasi Pimpinan',
  'Umum',
]

// Daftar Jabatan yang umum dipakai tiap Bagian, dipakai supaya pilihan Jabatan saat
// pendaftaran otomatis menyesuaikan Bagian yang dipilih. Kalau jabatan pegawai tidak
// ada di daftar ini, tetap bisa diketik manual lewat pilihan "Lainnya".
export const JABATAN_PER_BAGIAN = {
  "Administrasi Pembangunan": ["Arsiparis Ahli Pertama", "Fasilitator Pemerintahan", "Kepala Bagian", "Penelaah Teknis Kebijakan"],
  "Hukum": ["Arsiparis Ahli Pertama", "Kepala Bagian", "Operator Layanan Operasional", "Penelaah Teknis Kebijakan", "Pengadministrasian Perkantoran", "Penyuluh Hukum Ahli Muda", "Penyusun Materi Hukum dan Perundang-undangan"],
  "Kesra": ["Kepala Bagian", "Penelaah Teknis Kebijakan", "Pengadministrasian Perkantoran"],
  "Organisasi": ["Analis SDM Aparatur Ahli Muda", "Analis Sumber Daya Manusia Aparatur", "Kepala Bagian", "Operator Layanan Operasional", "Penata Kelola Sistem dan Teknologi Informasi", "Penelaah Teknis Kebijakan", "Pengadministrasi Perkantoran", "Perencana"],
  "Pemerintahan": ["Kepala Bagian", "Penata Kelola Pemerintahan", "Penata Layanan Operasional", "Penelaah Teknis Kebijakan", "Pengadministrasian Perkantoran", "Perencana"],
  "Pengadaan Barang dan Jasa": ["Kepala Bagian", "Penata Layanan Operasional", "Penelaah Teknis Kebijakan", "Pengadministrasi Perkantoran", "Pengadministrasian Perkantoran", "Pengelola PBJ", "Pengelola Pengadaan Barang dan Jasa Ahli Muda", "Pengelola Pengadaan Barang dan Jasa Ahli Pertama", "Pengelola Pengadaan Barang/Jasa Ahli Pertama", "Pengelola Pengadaan Barang/Jasa ahli pertama", "Pengelola Unit Layanan Pengadaan", "Pengolah Data dan Informasi"],
  "Perekonomian dan SDA": ["Arsiparis Ahli Pertama", "Kepala Bagian", "Penata Kelola Sistem dan Teknologi Informasi", "Penelaah Teknis Kebijakan", "Pengadministrasi Perkantoran"],
  "Protokol dan Komunikasi Pimpinan": ["Kasubbag Prokopim", "Kepala Bagian", "Operator Layanan Operasional", "Penata Layanan Operasional", "Penelaah Teknis Kebijakan", "Pengadministrasian Perkantoran", "Pranata Humas"],
  "Umum": ["Analis Sumber Daya Manusia Aparatur", "Arsiparis", "Kasubbag Keuangan", "Kasubbag Rumah Tangga dan Perlengkapan", "Kepala Bagian", "Kepala Subbagian  tata usaha pimpinan, staf ahli dan kepegawaian", "Operator Layanan Operasional", "Penata Kelola Sistem dan Teknologi Informasi", "Penata Layanan Operasional", "Penelaah Teknis Kebijakan", "Pengadministrasi Perkantoran", "Pengadministrasian Perkantoran", "Perencana", "Teknisi Sarana dan prasaran"],
}
