// Kriteria penilaian individu ASN, disalin persis dari struktur Google Form yang sudah dipakai
// selama ini (lihat sheet "Bobot Nilai" pada file contoh hasil pengisian). Tiap kriteria punya
// 4 pilihan jawaban dengan skor 4 (terbaik) sampai 1 (terendah).
export const KRITERIA_PENILAIAN = [
  {
    pertanyaan: 'Bagaimana tingkat kehadiran ASN selama periode penilaian?',
    opsi: [
      { huruf: 'a', teks: 'Tidak pernah absen tanpa keterangan', skor: 4 },
      { huruf: 'b', teks: 'Pernah absen dengan alasan yang dapat dipertanggungjawabkan', skor: 3 },
      { huruf: 'c', teks: 'Beberapa kali tidak hadir sehingga memengaruhi pekerjaan', skor: 2 },
      { huruf: 'd', teks: 'Sering tidak hadir tanpa alasan yang jelas', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana kepatuhan ASN terhadap jam masuk kerja?',
    opsi: [
      { huruf: 'a', teks: 'Selalu hadir sebelum atau tepat waktu', skor: 4 },
      { huruf: 'b', teks: 'Pernah terlambat 1–2 kali', skor: 3 },
      { huruf: 'c', teks: 'Beberapa kali terlambat', skor: 2 },
      { huruf: 'd', teks: 'Sering terlambat', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana kepatuhan ASN dalam menjalankan jam kerja sampai waktu yang ditentukan?',
    opsi: [
      { huruf: 'a', teks: 'Selalu berada dalam jam kerja sesuai ketentuan', skor: 4 },
      { huruf: 'b', teks: 'Pernah meninggalkan pekerjaan dengan izin', skor: 3 },
      { huruf: 'c', teks: 'Beberapa kali meninggalkan pekerjaan tanpa alasan mendesak', skor: 2 },
      { huruf: 'd', teks: 'Sering meninggalkan pekerjaan sebelum waktunya', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana keberadaan ASN pada lokasi atau ruang kerja selama jam kerja?',
    opsi: [
      { huruf: 'a', teks: 'Selalu berada di tempat tugas kecuali untuk kedinasan', skor: 4 },
      { huruf: 'b', teks: 'Sesekali berada di luar ruang kerja untuk kepentingan pekerjaan', skor: 3 },
      { huruf: 'c', teks: 'Sering berada di luar tempat tugas tanpa kejelasan', skor: 2 },
      { huruf: 'd', teks: 'Sulit ditemukan pada jam kerja', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana kemampuan ASN menyelesaikan tugas sesuai target yang ditetapkan?',
    opsi: [
      { huruf: 'a', teks: 'Selalu mencapai atau melampaui target', skor: 4 },
      { huruf: 'b', teks: 'Sebagian besar target tercapai', skor: 3 },
      { huruf: 'c', teks: 'Beberapa target tidak tercapai', skor: 2 },
      { huruf: 'd', teks: 'Banyak target tidak tercapai', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana kualitas hasil pekerjaan yang dihasilkan ASN?',
    opsi: [
      { huruf: 'a', teks: 'Sangat baik dan minim koreksi', skor: 4 },
      { huruf: 'b', teks: 'Baik dengan sedikit koreksi', skor: 3 },
      { huruf: 'c', teks: 'Cukup baik namun memerlukan banyak perbaikan', skor: 2 },
      { huruf: 'd', teks: 'Kurang baik dan sering dikembalikan', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana ASN mempertanggungjawabkan pekerjaan yang menjadi tugasnya?',
    opsi: [
      { huruf: 'a', teks: 'Sangat bertanggung jawab dan mandiri', skor: 4 },
      { huruf: 'b', teks: 'Bertanggung jawab dengan arahan minimal', skor: 3 },
      { huruf: 'c', teks: 'Kurang konsisten dalam tanggung jawab', skor: 2 },
      { huruf: 'd', teks: 'Sering mengabaikan tanggung jawab', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana pelaksanaan tugas yang diberikan oleh atasan?',
    opsi: [
      { huruf: 'a', teks: 'Selalu dilaksanakan tepat waktu dan sesuai arahan', skor: 4 },
      { huruf: 'b', teks: 'Dilaksanakan dengan baik', skor: 3 },
      { huruf: 'c', teks: 'Kadang terlambat atau kurang sesuai', skor: 2 },
      { huruf: 'd', teks: 'Sering tidak melaksanakan arahan', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana sikap ASN dalam memberikan pelayanan kepada masyarakat atau pengguna layanan?',
    opsi: [
      { huruf: 'a', teks: 'Sangat responsif, ramah, dan solutif', skor: 4 },
      { huruf: 'b', teks: 'Memberikan pelayanan dengan baik', skor: 3 },
      { huruf: 'c', teks: 'Kurang responsif', skor: 2 },
      { huruf: 'd', teks: 'Sering mendapat keluhan', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana ASN menunjukkan integritas dalam pelaksanaan tugas?',
    opsi: [
      { huruf: 'a', teks: 'Menjadi teladan dalam kejujuran dan kepatuhan aturan', skor: 4 },
      { huruf: 'b', teks: 'Menunjukkan integritas yang baik', skor: 3 },
      { huruf: 'c', teks: 'Pernah melakukan pelanggaran ringan', skor: 2 },
      { huruf: 'd', teks: 'Sering melanggar ketentuan', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana kemampuan ASN melaksanakan tugas sesuai jabatan yang diemban?',
    opsi: [
      { huruf: 'a', teks: 'Sangat menguasai pekerjaan', skor: 4 },
      { huruf: 'b', teks: 'Menguasai pekerjaan dengan baik', skor: 3 },
      { huruf: 'c', teks: 'Masih memerlukan pendampingan intensif', skor: 2 },
      { huruf: 'd', teks: 'Belum menguasai pekerjaan', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana upaya ASN meningkatkan pengetahuan dan keterampilan kerja?',
    opsi: [
      { huruf: 'a', teks: 'Aktif belajar dan mengembangkan diri', skor: 4 },
      { huruf: 'b', teks: 'Bersedia mengikuti pengembangan kompetensi', skor: 3 },
      { huruf: 'c', teks: 'Kurang berinisiatif mengembangkan diri', skor: 2 },
      { huruf: 'd', teks: 'Tidak menunjukkan upaya pengembangan', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana kemampuan ASN bekerja sama dengan rekan kerja?',
    opsi: [
      { huruf: 'a', teks: 'Sangat mendukung dan membantu rekan kerja', skor: 4 },
      { huruf: 'b', teks: 'Dapat bekerja sama dengan baik', skor: 3 },
      { huruf: 'c', teks: 'Kurang aktif dalam kerja sama', skor: 2 },
      { huruf: 'd', teks: 'Menimbulkan hambatan dalam kerja sama', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana respons ASN terhadap perubahan kebijakan atau sistem kerja?',
    opsi: [
      { huruf: 'a', teks: 'Cepat menyesuaikan dan mendukung perubahan', skor: 4 },
      { huruf: 'b', teks: 'Mampu menyesuaikan diri', skor: 3 },
      { huruf: 'c', teks: 'Lambat menyesuaikan diri', skor: 2 },
      { huruf: 'd', teks: 'Menolak atau menghambat perubahan', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana kemampuan ASN memberikan gagasan atau solusi dalam pekerjaan?',
    opsi: [
      { huruf: 'a', teks: 'Sering memberikan inovasi yang bermanfaat', skor: 4 },
      { huruf: 'b', teks: 'Sesekali memberikan solusi yang baik', skor: 3 },
      { huruf: 'c', teks: 'Jarang memberikan masukan', skor: 2 },
      { huruf: 'd', teks: 'Tidak menunjukkan inisiatif', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana ASN memanfaatkan waktu kerja untuk mendukung pencapaian kinerja?',
    opsi: [
      { huruf: 'a', teks: 'Seluruh waktu kerja digunakan secara produktif', skor: 4 },
      { huruf: 'b', teks: 'Sebagian besar waktu digunakan secara produktif', skor: 3 },
      { huruf: 'c', teks: 'Masih terdapat waktu kerja yang kurang efektif', skor: 2 },
      { huruf: 'd', teks: 'Banyak waktu kerja tidak dimanfaatkan untuk pekerjaan', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana kepatuhan ASN menggunakan pakaian dinas sesuai ketentuan hari kerja?',
    opsi: [
      { huruf: 'a', teks: 'Selalu sesuai ketentuan', skor: 4 },
      { huruf: 'b', teks: 'Pernah tidak sesuai 1–2 kali', skor: 3 },
      { huruf: 'c', teks: 'Beberapa kali tidak sesuai', skor: 2 },
      { huruf: 'd', teks: 'Sering tidak sesuai', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana kepatuhan ASN menggunakan atribut kedinasan yang diwajibkan?',
    opsi: [
      { huruf: 'a', teks: 'Selalu lengkap', skor: 4 },
      { huruf: 'b', teks: 'Hampir selalu lengkap', skor: 3 },
      { huruf: 'c', teks: 'Kadang tidak lengkap', skor: 2 },
      { huruf: 'd', teks: 'Sering tidak lengkap', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Bagaimana penampilan ASN dalam mendukung citra profesional instansi?',
    opsi: [
      { huruf: 'a', teks: 'Sangat rapi dan profesional', skor: 4 },
      { huruf: 'b', teks: 'Rapi dan sesuai ketentuan', skor: 3 },
      { huruf: 'c', teks: 'Kurang rapi', skor: 2 },
      { huruf: 'd', teks: 'Tidak mencerminkan profesionalisme ASN', skor: 1 },
    ],
  },
  {
    pertanyaan: 'Berdasarkan penilaian secara keseluruhan, bagaimana kelayakan ASN untuk memperoleh penghargaan kinerja?',
    opsi: [
      { huruf: 'a', teks: 'Sangat layak memperoleh penghargaan', skor: 4 },
      { huruf: 'b', teks: 'Layak memperoleh penghargaan', skor: 3 },
      { huruf: 'c', teks: 'Perlu pembinaan lebih lanjut', skor: 2 },
      { huruf: 'd', teks: 'Tidak layak memperoleh penghargaan', skor: 1 },
    ],
  },
]
