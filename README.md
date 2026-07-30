# e-Apel

Aplikasi web absensi apel pegawai berbasis **radius titik koordinat** (geolocation).
Dibangun dengan React + Vite, data disimpan di **Firebase Firestore** (cloud, real-time, bisa diakses dari HP semua pegawai).

## Fitur

**Halaman Absen (beranda, `/`) — Face ID**
- Kamera menyala otomatis dan mengenali wajah pegawai secara langsung, tanpa perlu login manual.
- Jika wajah dikenali, sesi otomatis masuk dan lanjut ke pengecekan lokasi (radius) untuk mencatat absen.
- Jika dalam **3 detik** wajah tidak dikenali, muncul notifikasi dengan pilihan **Coba Lagi** atau **Daftar Data** (pendaftaran mandiri).
- Data wajah yang tersimpan juga dipakai sebagai metode login — begitu wajah dikenali, pegawai otomatis punya sesi penuh untuk melihat **Riwayat Saya**, tidak hanya untuk mencatat absen hari itu.

**Pendaftaran Mandiri (`/daftar-wajah`)**
- Pegawai baru mengisi NIP, Nama, Bagian (pilih dari daftar, bisa ketik untuk filter cepat), Jabatan, dan password cadangan, lalu merekam wajah lewat kamera (beberapa jepretan dirata-ratakan agar lebih akurat).
- Data langsung tersimpan dan bisa dipakai untuk absen wajah saat itu juga.

**Menu Pegawai** (setelah masuk lewat wajah atau NIP/password)
- Absensi: cek lokasi GPS otomatis dibandingkan dengan titik koordinat kantor → status **"Berada Sesuai Lokasi"** atau **"Berada Diluar Lokasi"**.
- Jika sesuai lokasi, keterangan otomatis terisi **"Apel Pagi"**. Jika diluar lokasi, wajib pilih keterangan: **Apel Gabungan**, **Apel Hari Besar**, atau **WFH**.
- Absen apel hanya bisa dilakukan mulai pukul **07:50 WITA** (UTC+8) — sebelum itu muncul keterangan **"Jam Absen Apel Belum Dimulai"**. Begitu admin menjalankan **Generate Absen** (menu Absen Harian) untuk tanggal itu, sesi absen ditutup dan pegawai yang belum sempat absen akan melihat **"Jam Absen Apel Sudah Selesai"**.
- Riwayat Saya: rekap absensi pribadi per periode (bulan/tahun), lengkap dengan jumlah Hari Absen.
- Profil: menampilkan Foto, NIP, Nama, Bagian, dan Jabatan pegawai. NIP/Nama/Bagian/Jabatan hanya bisa diubah admin — pegawai hanya bisa mengganti **foto profil** dan **password** sendiri.

**Menu Admin** (login NIP & password di `/login`)
- Rekap Pegawai: akumulasi kehadiran seluruh pegawai per periode (bulan/tahun), dengan tombol **Download Excel** untuk mengunduh rekap bulan itu.
- Area Lokasi: atur titik koordinat (latitude/longitude) & radius toleransi lokasi apel.
- Hari Absen: cek list tiap tanggal dalam sebulan (bawaan Senin–Jumat) dan ubah langsung mana saja yang dihitung sebagai Hari Absen Apel — misalnya meniadakan tanggal libur nasional, atau menambahkan Sabtu untuk apel khusus. Jumlah ini dipakai untuk menghitung persentase kehadiran di Rekap Pegawai & Riwayat Saya.
- Kelola Pegawai: tambah/**edit**/hapus akun pegawai & admin (NIP, Nama, Bagian, Jabatan, Peran, dan reset password), lihat status rekam wajah tiap pegawai.
- Koreksi Absensi: ubah, hapus, atau tambahkan data absen pegawai secara manual untuk koreksi.
- Absen Harian: pilih tanggal, lalu klik **Generate Absen** untuk menandai pegawai yang belum absen apel pada tanggal itu sebagai **"Tidak Apel"** sekaligus **menutup sesi absen apel** tanggal tersebut. Ini proses manual — admin yang menentukan kapan dijalankan, tidak ada proses otomatis di background. Tanggal yang bisa di-generate mengikuti pengaturan Hari Absensi Apel (tombol Generate nonaktif untuk tanggal yang bukan Hari Absen). Ada juga tombol **Download Excel** untuk mengunduh absensi harian tanggal itu (semua pegawai, termasuk yang belum absen).

## 1. Setup Firebase (sekali saja)

1. Buka [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → beri nama, ikuti langkah sampai selesai.
2. Di dashboard project → klik ikon **</>** (Web) → daftarkan app (tidak perlu Firebase Hosting) → salin konfigurasi `firebaseConfig` yang muncul.
3. Di menu kiri, buka **Build → Firestore Database** → **Create database** → pilih mode **production** → pilih lokasi server (mis. `asia-southeast2` untuk Indonesia).
4. Buka tab **Rules** di Firestore, ganti isinya dengan isi file `firestore.rules` di repo ini, lalu **Publish**.
   > Catatan: aplikasi ini pakai sistem login sendiri (bukan Firebase Authentication), jadi rules ini cocok untuk pemakaian internal dengan pengguna yang saling percaya. Lihat komentar di `firestore.rules` untuk detail keterbatasannya.


## 2. Jalankan di komputer (development)

```bash
npm install
cp .env.example .env
```

Isi file `.env` dengan nilai dari `firebaseConfig` di langkah setup:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Jalankan:

```bash
npm run dev
```

Buka `http://localhost:5173`, klik **"pertama kali pakai?"** di halaman login untuk membuat akun **admin pertama**. Setelah itu, tambahkan akun pegawai lain lewat menu **Kelola Pegawai**, dan atur titik lokasi kantor lewat menu **Area Lokasi** sebelum pegawai bisa absen.

> Layanan lokasi (GPS) browser hanya aktif di `https://` atau `localhost` — jadi saat development di komputer, `localhost` sudah otomatis diizinkan.

## 3. Deploy ke GitHub Pages

### a. Unggah kode ke GitHub

```bash
git init
git add .
git commit -m "e-Apel - initial commit"
git branch -M main
git remote add origin https://github.com/<username>/<nama-repo>.git
git push -u origin main
```

### b. Simpan konfigurasi Firebase sebagai GitHub Secrets

Di repo GitHub → **Settings → Secrets and variables → Actions → New repository secret**, tambahkan satu per satu (nilainya sama seperti isi `.env`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### c. Aktifkan GitHub Pages

Di repo GitHub → **Settings → Pages → Build and deployment → Source**, pilih **GitHub Actions**.

Workflow di `.github/workflows/deploy.yml` sudah disiapkan: setiap kali kamu `git push` ke branch `main`, aplikasi otomatis di-build dan di-deploy. Setelah selesai (cek tab **Actions**), aplikasi bisa diakses di:

```
https://<username>.github.io/<nama-repo>/
```

### d. Izinkan domain di Firebase (jika perlu)

Firestore biasanya tidak membatasi domain, tapi jika suatu saat menambah Firebase Authentication, buka **Authentication → Settings → Authorized domains** dan tambahkan `<username>.github.io`.

> GitHub Pages otomatis berjalan di `https://`, jadi layanan lokasi (GPS) di browser akan berfungsi normal setelah deploy.

## Struktur data Firestore

```
users/{id}        { nip, nama, bagian, jabatan, passwordHash, role: 'admin' | 'pegawai',
                      faceDescriptor?: number[128], foto?: string (data URL JPEG) }
settings/lokasi    { nama, lat, lng, radius }
settings/hariAbsen { override: { 'YYYY-MM-DD': true|false, ... } } — hanya tanggal yang beda dari bawaan (Senin-Jumat)
settings/penutupanApel { tanggal: 'YYYY-MM-DD' } — tanggal terakhir sesi absen apel ditutup (ditulis saat admin klik Generate Absen di menu Absen Harian)
absensi/{id}       { uid, nama, tanggal, jam, status: 'sesuai' | 'luar',
                      keterangan: 'gabungan' | 'senam' | 'wfh' | null,
                      lat, lng, jarakMeter, dibuat }
```

## Batasan yang perlu diketahui

- Pilihan **Bagian** memakai daftar tetap di `src/utils/bagian.js` (Administrasi Pembangunan, Hukum, Kesra, Organisasi, Pemerintahan, Pengadaan Barang dan Jasa, Perekonomian dan SDA, Protokol dan Komunikasi Pimpinan, Umum). Untuk menambah/mengubah daftar bagian, edit file tersebut lalu deploy ulang.

- Pencatatan "Tidak Apel" sepenuhnya **manual** lewat menu **Absen Harian** — admin memilih tanggal dan klik Generate Absen. Ini sengaja dibuat manual (bukan berjalan sendiri di background) karena aplikasi ini tidak punya server/cron sungguhan.
- Login memakai hash password sederhana (SHA-256) yang disimpan di Firestore, bukan Firebase Authentication penuh. Cukup untuk pemakaian internal, tapi untuk keamanan tingkat produksi sebaiknya dimigrasikan ke Firebase Authentication + Cloud Functions.
- Akurasi lokasi bergantung pada GPS perangkat pegawai (bisa meleset beberapa meter, terutama di dalam gedung).
- Radius sebaiknya disesuaikan dengan kondisi lapangan (mis. 50–150 meter) agar tidak terlalu ketat/longgar.
- Pengenalan wajah berjalan sepenuhnya di browser (model `face-api.js` di folder `public/models`, ± 7 MB, terunduh sekali lalu ter-cache). Akurasinya dipengaruhi pencahayaan dan kualitas kamera perangkat; pendaftaran mandiri sebaiknya dilakukan di tempat terang dengan wajah menghadap kamera.
- Akses kamera browser hanya bisa jalan di `https://` atau `localhost` — otomatis terpenuhi setelah deploy ke GitHub Pages.
- Pendaftaran mandiri (`/daftar-wajah`) langsung membuat akun aktif tanpa persetujuan admin terlebih dahulu. Jika perlu ada verifikasi manual sebelum pegawai baru bisa absen, tambahkan status "menunggu persetujuan" dan filter di sisi admin — saat ini belum tersedia.
- Data wajah (descriptor 128 angka, bukan foto) tersimpan di Firestore per pegawai; siapa pun yang tahu URL aplikasi & lolos rules yang berlaku bisa membaca data ini (lihat catatan keamanan di `firestore.rules`).
