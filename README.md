# Absen Apel Pegawai

Aplikasi web absensi apel pegawai berbasis **radius titik koordinat** (geolocation).
Dibangun dengan React + Vite, data disimpan di **Firebase Firestore** (cloud, real-time, bisa diakses dari HP semua pegawai).

## Fitur

**Menu Pegawai**
- Absensi: cek lokasi GPS otomatis dibandingkan dengan titik koordinat kantor → status **"Berada Sesuai Lokasi"** atau **"Berada Diluar Lokasi"**.
- Jika diluar lokasi, wajib pilih keterangan: **Absen Gabungan**, **Senam**, atau **WFH**.
- Riwayat Saya: rekap absensi pribadi per periode (bulan/tahun), lengkap dengan jumlah hari kerja.

**Menu Admin**
- Rekap Pegawai: akumulasi kehadiran seluruh pegawai per periode (bulan/tahun).
- Area Lokasi: atur titik koordinat (latitude/longitude) & radius toleransi lokasi apel.
- Hari Libur: tentukan tanggal libur/cuti bersama agar tidak dihitung sebagai hari kerja (Sabtu & Minggu otomatis dikecualikan).
- Kelola Pegawai: tambah/hapus akun pegawai & admin.

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
git commit -m "Absen Apel Pegawai - initial commit"
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
users/{id}        { nama, username, passwordHash, role: 'admin' | 'pegawai' }
settings/lokasi    { nama, lat, lng, radius }
settings/libur     { tanggal: [ 'YYYY-MM-DD', ... ], detail: [{ tanggal, keterangan }] }
absensi/{id}       { uid, nama, tanggal, jam, status: 'sesuai' | 'luar',
                      keterangan: 'gabungan' | 'senam' | 'wfh' | null,
                      lat, lng, jarakMeter, dibuat }
```

## Batasan yang perlu diketahui

- Login memakai hash password sederhana (SHA-256) yang disimpan di Firestore, bukan Firebase Authentication penuh. Cukup untuk pemakaian internal, tapi untuk keamanan tingkat produksi sebaiknya dimigrasikan ke Firebase Authentication + Cloud Functions.
- Akurasi lokasi bergantung pada GPS perangkat pegawai (bisa meleset beberapa meter, terutama di dalam gedung).
- Radius sebaiknya disesuaikan dengan kondisi lapangan (mis. 50–150 meter) agar tidak terlalu ketat/longgar.
