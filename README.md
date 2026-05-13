# SIPENTA
**Sistem Informasi Tata Tertib & Pelanggaran Sekolah**

Aplikasi web untuk mencatat dan memantau pelanggaran tata tertib siswa di lingkungan sekolah.

---

## Fitur
- Login multi-peran (Admin, Guru, Guru BK/BP, SP2TK)
- Pencatatan pelanggaran siswa
- Manajemen data siswa
- Data tata tertib sekolah
- Laporan & statistik pelanggaran
- Cetak laporan

## Teknologi
- **Frontend** — HTML, CSS, JavaScript (Vanilla)
- **UI Framework** — Bootstrap 5.3
- **Backend** — Vercel Serverless Functions
- **Database** — JSONBin (via API)

## Struktur Folder
```
PROJEK-SIPENTA/
├── public/
│   ├── index.html          # Halaman login
│   ├── pages/              # Halaman-halaman aplikasi
│   └── assets/
│       ├── css/            # Stylesheet
│       ├── img/            # Gambar & ikon
│       └── js/
│           ├── core/       # Logic inti (auth, config, utils, dll)
│           ├── pages/      # Script per halaman
│           └── data/       # Data statis
├── api/                    # Serverless functions
├── data/                   # Database lokal (db.json)
├── .env                    # Konfigurasi environment
└── vercel.json             # Konfigurasi deployment
```

## Instalasi & Menjalankan

1. Clone repositori ini
2. Isi file `.env` dengan kredensial JSONBin:
   ```
   JSONBIN_BIN_ID=your_bin_id
   JSONBIN_API_KEY=your_api_key
   ```
3. Install Vercel CLI (jika belum):
   ```bash
   npm install -g vercel
   ```
4. Jalankan secara lokal:
   ```bash
   vercel dev
   ```
5. Buka browser di `http://localhost:3000`

## Deployment

```bash
vercel --prod
```

## Peran Pengguna

| Peran | Keterangan |
|---|---|
| Admin | Akses penuh ke semua fitur |
| Guru / Wali Kelas | Melihat & mencatat pelanggaran |
| Guru BK / BP | Manajemen kasus pelanggaran |
| SP2TK | Monitoring & laporan |

---

&copy; 2026 SIPENTA
