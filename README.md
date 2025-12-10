# Admin Page - Sistem Manajemen Pembelian

Aplikasi web untuk mengelola pembelian produk di toko. Admin dapat melihat daftar produk, membuat pembelian baru, melihat riwayat pembelian, dan membatalkan pembelian.

## Fitur Utama

- Melihat daftar produk beserta stok
- Membuat pembelian baru
- Melihat riwayat pembelian
- Membatalkan pembelian (stok otomatis dikembalikan)
- Tampilan responsif (bisa diakses dari HP, tablet, dan komputer)

## Struktur Folder

```
admin-page/
├── client/                 # Frontend (tampilan website)
│   ├── src/
│   │   ├── components/     # Komponen yang bisa dipakai ulang
│   │   ├── pages/          # Halaman-halaman website
│   │   └── services/       # Koneksi ke server
│   └── package.json
│
├── server/                 # Backend (server)
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Validasi data
│   │   └── db/             # Database
│   ├── database.db         # File database SQLite
│   └── package.json
│
└── README.md
```

## Cara Menjalankan Aplikasi

### Prasyarat

Pastikan sudah menginstall:

- Node.js versi 18 atau lebih baru
- npm (biasanya sudah terinstall bersama Node.js)

### Langkah 1: Install Dependencies

Buka terminal, lalu jalankan perintah berikut:

**Untuk Backend (Server):**

```bash
cd admin-page/server
npm install
```

**Untuk Frontend (Client):**

```bash
cd admin-page/client
npm install
```

### Langkah 2: Jalankan Aplikasi

**1. Jalankan Server terlebih dahulu:**

```bash
cd admin-page/server
npm run dev
```

Server akan berjalan di `http://localhost:3000`

**2. Buka terminal baru, lalu jalankan Frontend:**

```bash
cd admin-page/client
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### Langkah 3: Buka Aplikasi

Buka browser dan akses: `http://localhost:5173`

## Catatan Penting

- Pastikan server (backend) sudah berjalan sebelum membuka frontend
- Database akan otomatis dibuat dengan 10 produk contoh saat pertama kali server dijalankan
- Jika ingin menghentikan aplikasi, tekan `Ctrl + C` di terminal

## Teknologi yang Digunakan

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: SQLite
