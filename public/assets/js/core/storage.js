// assets/js/storage.js
// Penyimpanan data via Vercel Serverless Function → JSONBin
// API Key TIDAK ada di sini — aman tersimpan di server Vercel

// ── Cache lokal agar tidak perlu fetch ulang sebelum simpan ─────────────────
var _cacheData = null;

// ── Ambil semua data dari JSONBin via /api/getData ──────────────────────────
async function ambilSemuaData() {
  try {
    const res = await fetch("/api/getData");
    if (!res.ok) throw new Error("Gagal mengambil data");
    const data = await res.json();
    _cacheData = {
      pelanggaran: data.pelanggaran || [],
      siswa: data.siswa || [],
      accounts: data.accounts || [],
      jumlahSiswa: data.jumlahSiswa ?? null,
    };
    return _cacheData;
  } catch (err) {
    console.error("ambilSemuaData error:", err);
    return { pelanggaran: [], siswa: [], accounts: [] };
  }
}

// ── Simpan semua data ke JSONBin via /api/saveData ──────────────────────────
async function simpanSemuaData(data) {
  try {
    const res = await fetch("/api/saveData", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal menyimpan data");
    // Update cache agar konsisten
    _cacheData = data;
    return true;
  } catch (err) {
    console.error("simpanSemuaData error:", err);
    return false;
  }
}

// ── Shortcut per jenis data ─────────────────────────────────────────────────
// Perbaikan: fungsi simpan menerima seluruh data agar tidak perlu GET dulu
// Pemanggil wajib pastikan sudah memanggil ambilSemuaData() / initData() sebelumnya

async function ambilPelanggaran() {
  const d = await ambilSemuaData();
  return d.pelanggaran;
}

async function simpanPelanggaran(pelanggaran) {
  // Gunakan cache supaya tidak perlu fetch ulang
  const d = _cacheData
    ? { ..._cacheData, pelanggaran }
    : { ...(await ambilSemuaData()), pelanggaran };
  return await simpanSemuaData(d);
}

async function ambilSiswa() {
  const d = await ambilSemuaData();
  return d.siswa;
}

async function simpanSiswa(siswa) {
  const d = _cacheData
    ? { ..._cacheData, siswa }
    : { ...(await ambilSemuaData()), siswa };
  return await simpanSemuaData(d);
}

async function ambilAkun() {
  const d = await ambilSemuaData();
  return d.accounts;
}

async function simpanAkun(accounts) {
  const d = _cacheData
    ? { ..._cacheData, accounts }
    : { ...(await ambilSemuaData()), accounts };
  return await simpanSemuaData(d);
}

// ── Inisialisasi data global (dipanggil saat halaman load) ──────────────────
// Semua halaman harus panggil initData() di awal sebelum pakai dataSiswa/dataPelanggaran
var dataPelanggaran = [];
var dataSiswa = [];

async function initData() {
  const d = await ambilSemuaData();
  dataPelanggaran = d.pelanggaran;
  dataSiswa = d.siswa;
  return d;
}

// ── Loading overlay helper ───────────────────────────────────────────────────
function tampilkanLoading(pesan = "Memuat data...") {
  let el = document.getElementById("sipentaLoading");
  if (!el) {
    el = document.createElement("div");
    el.id = "sipentaLoading";
    el.style.cssText = `
      position:fixed;inset:0;background:rgba(255,255,255,0.85);
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;z-index:9999;gap:12px;
      font-family:inherit;
    `;
    el.innerHTML = `
      <div class="spinner-border text-primary" role="status" style="width:2.5rem;height:2.5rem"></div>
      <p class="mb-0 text-muted small fw-semibold" id="sipentaLoadingPesan">${pesan}</p>
    `;
    document.body.appendChild(el);
  } else {
    document.getElementById("sipentaLoadingPesan").textContent = pesan;
    el.style.display = "flex";
  }
}

function sembunyikanLoading() {
  const el = document.getElementById("sipentaLoading");
  if (el) el.style.display = "none";
}
