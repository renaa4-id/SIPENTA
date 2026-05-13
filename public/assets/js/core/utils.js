// ─── Toggle show/hide password ────────────────────────────────────────────────
function togglePassword(inputId, eyeId) {
  const input = document.getElementById(inputId);
  const eye = document.getElementById(eyeId);
  if (!input || !eye) return;
  if (input.type === "password") {
    input.type = "text";
    eye.className = "bi bi-eye-slash";
  } else {
    input.type = "password";
    eye.className = "bi bi-eye";
  }
}

// ─── Kapitalisasi huruf pertama ───────────────────────────────────────────────
function kapital(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Format tanggal ke dd Bulan yyyy ─────────────────────────────────────────
function formatTanggal(isoStr) {
  if (!isoStr) return "-";
  const bulanArr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const d = new Date(isoStr + "T00:00:00");
  return `${d.getDate()} ${bulanArr[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Prefix bulan ini dalam format "YYYY-MM" ─────────────────────────────────
function bulanIni() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${m}`;
}

// ─── Toast notifikasi ─────────────────────────────────────────────────────────
function tampilkanToast(pesan, tipe = "success") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.style.cssText =
      "position:fixed;bottom:1.5rem;right:1.5rem;z-index:10000;display:flex;flex-direction:column;gap:.5rem;";
    document.body.appendChild(container);
  }
  const warna = {
    success: "#16a34a",
    danger: "#dc2626",
    warning: "#d97706",
    info: "#0891b2",
  };
  const toast = document.createElement("div");
  toast.style.cssText = `
    background:#fff; border-left:4px solid ${warna[tipe] || warna.success};
    border-radius:8px; padding:.75rem 1rem; box-shadow:0 4px 16px rgba(0,0,0,.12);
    font-size:.875rem; max-width:320px; animation:fadeInUp .25s ease;
  `;
  toast.innerHTML = pesan;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ─── Navigasi ke section tertentu (SPA-style) ────────────────────────────────
function bukaSection(nama) {
  document
    .querySelectorAll(".section-content, [data-section]")
    .forEach((el) => {
      el.style.display = el.dataset.section === nama ? "" : "none";
    });
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.classList.toggle("active", el.dataset.nav === nama);
  });
}

// ─── Inisial nama (maks 2 huruf) ─────────────────────────────────────────────
function inisial(nama) {
  if (!nama) return "?";
  const parts = nama.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

// ─── Warna avatar berdasarkan index ──────────────────────────────────────────
function warnaAvatar(index) {
  return WARNA_AVATAR[index % WARNA_AVATAR.length];
}

// ─── Level risiko berdasarkan total poin ─────────────────────────────────────
function getRisiko(poin) {
  if (poin >= 75) return "kritis";
  if (poin >= 40) return "waspada";
  return "aman";
}

// ─── Update / tambah data siswa setelah ada pelanggaran baru ─────────────────
async function updateDataSiswa(nama, kelas) {
  let siswa = dataSiswa.find(
    (s) => s.nama.toLowerCase() === nama.toLowerCase()
  );
  if (!siswa) {
    siswa = { nama, kelas, nisn: "", totalPoin: 0 };
    dataSiswa.push(siswa);
  }
  siswa.kelas = kelas;
  await hitungUlangPoinSemua();
}

// ─── Hitung ulang total poin semua siswa dari data pelanggaran ───────────────
async function hitungUlangPoinSemua() {
  dataSiswa.forEach((s) => {
    s.totalPoin = dataPelanggaran
      .filter((p) => p.nama.toLowerCase() === s.nama.toLowerCase())
      .reduce((acc, p) => acc + (p.poin || 0), 0);
  });
  await simpanSiswa(dataSiswa);
}

// ─── Hash password dengan SHA-256 (Web Crypto API — bawaan browser) ───────────
async function hashPassword(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Ganti tampilan antara form Login dan Daftar ──────────────────────────────
function gantiTab(tab) {
  const isLogin = tab === "login";

  document.getElementById("loginForm").style.display = isLogin ? "" : "none";
  document.getElementById("registerForm").style.display = isLogin ? "none" : "";

  document.getElementById("tabLogin").className =
    "auth-tab " + (isLogin ? "active" : "inactive");
  document.getElementById("tabDaftar").className =
    "auth-tab " + (isLogin ? "inactive" : "active");

  const ikon = isLogin ? "box-arrow-in-right" : "person-plus-fill";
  const eyebrow = isLogin ? "Masuk Akun" : "Daftar Akun";
  const judul = isLogin ? "Selamat Datang" : "Buat Akun Baru";
  const sub = isLogin
    ? "Masuk untuk melanjutkan ke dashboard SIPENTA"
    : "Daftarkan diri untuk menggunakan sistem";

  document.getElementById(
    "loginEyebrow"
  ).innerHTML = `<i class="bi bi-${ikon} me-1"></i>${eyebrow}`;
  document.getElementById("loginTitle").textContent = judul;
  document.getElementById("loginSub").textContent = sub;

  ["loginRoleErr", "userIdError", "passwordError"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  const loginAlert = document.getElementById("loginAlert");
  if (loginAlert) {
    loginAlert.className = "alert d-none mt-3";
    loginAlert.textContent = "";
  }

  [
    "regNamaErr",
    "regRoleErr",
    "regUsernameErr",
    "regPwdErr",
    "regPwd2Err",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
  const registerAlert = document.getElementById("registerAlert");
  if (registerAlert) {
    registerAlert.className = "alert d-none mt-3";
    registerAlert.textContent = "";
  }

  if (isLogin) {
    ["userId", "password"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const role = document.getElementById("role");
    if (role) role.selectedIndex = 0;
  } else {
    ["regNama", "regUsername", "regEmail", "regPwd", "regPwd2"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      }
    );
    const regRole = document.getElementById("regRole");
    if (regRole) regRole.selectedIndex = 0;
  }
}

// ─── Proses login (async) ─────────────────────────────────────────────────────
async function prosesLogin() {
  const peran = document.getElementById("role")?.value;
  const username = document.getElementById("userId")?.value.trim();
  const password = document.getElementById("password")?.value;

  const elErrPeran = document.getElementById("loginRoleErr");
  const elErrUser = document.getElementById("userIdError");
  const elErrPass = document.getElementById("passwordError");
  const elAlert = document.getElementById("loginAlert");

  [elErrPeran, elErrUser, elErrPass].forEach((el) => {
    if (el) el.textContent = "";
  });
  if (elAlert) {
    elAlert.className = "alert d-none mt-3";
    elAlert.textContent = "";
  }

  let valid = true;
  if (!peran) {
    elErrPeran.textContent = "Pilih peran terlebih dahulu.";
    valid = false;
  }
  if (!username || username.length < 3) {
    elErrUser.textContent = "Username minimal 3 karakter.";
    valid = false;
  }
  if (!password || password.length < 6) {
    elErrPass.textContent = "Kata sandi minimal 6 karakter.";
    valid = false;
  }
  if (!valid) return;

  const elBtn = document.getElementById("loginBtn");
  const elTeks = document.getElementById("loginBtnText");
  const elSpin = document.getElementById("loginSpinner");

  elBtn.disabled = true;
  elTeks.textContent = "Memverifikasi...";
  elSpin.classList.remove("d-none");

  try {
    tampilkanLoading("Mengambil data akun...");
    const semuaAkun = await ambilAkun();
    sembunyikanLoading();

    if (semuaAkun.length === 0) {
      gantiTab("daftar");
      const el = document.getElementById("registerAlert");
      if (el) {
        el.className = "alert alert-info mt-3";
        el.textContent =
          "Belum ada akun terdaftar. Silakan buat akun baru di sini.";
      }
      elBtn.disabled = false;
      elTeks.textContent = "Masuk ke Dashboard";
      elSpin.classList.add("d-none");
      return;
    }

    const hashedInput = await hashPassword(password);

    const akun = semuaAkun.find(
      (a) =>
        a.username.toLowerCase() === username.toLowerCase() &&
        a.password === hashedInput
    );

    if (!akun) {
      elAlert.className = "alert alert-danger mt-3";
      elAlert.textContent = "Username atau kata sandi salah.";
      elBtn.disabled = false;
      elTeks.textContent = "Masuk ke Dashboard";
      elSpin.classList.add("d-none");
      return;
    }

    const peranAkun = akun.peran || akun.role;
    if (peranAkun !== peran) {
      elAlert.className = "alert alert-warning mt-3";
      elAlert.textContent = "Peran tidak sesuai dengan akun ini.";
      elBtn.disabled = false;
      elTeks.textContent = "Masuk ke Dashboard";
      elSpin.classList.add("d-none");
      return;
    }

    localStorage.setItem(
      "sipenta_user",
      JSON.stringify({
        nama: akun.nama,
        peran: akun.peran,
        userId: akun.username,
        email: akun.email || "",
      })
    );
    window.location.replace("pages/dashboard.html");
  } catch (err) {
    sembunyikanLoading();
    elBtn.disabled = false;
    elTeks.textContent = "Masuk ke Dashboard";
    elSpin.classList.add("d-none");
    elAlert.className = "alert alert-danger mt-3";
    elAlert.textContent = "Terjadi kesalahan koneksi, coba lagi.";
  }
}

// ─── Proses daftar akun baru (async) ──────────────────────────────────────────
async function prosesDaftar() {
  const nama = document.getElementById("regNama")?.value.trim();
  const peran = document.getElementById("regRole")?.value;
  const username = document.getElementById("regUsername")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPwd")?.value;
  const konfirm = document.getElementById("regPwd2")?.value;

  const elErrNama = document.getElementById("regNamaErr");
  const elErrPeran = document.getElementById("regRoleErr");
  const elErrUser = document.getElementById("regUsernameErr");
  const elErrPass = document.getElementById("regPwdErr");
  const elErrKonf = document.getElementById("regPwd2Err");
  const elAlert = document.getElementById("registerAlert");

  [elErrNama, elErrPeran, elErrUser, elErrPass, elErrKonf].forEach((el) => {
    if (el) el.textContent = "";
  });
  if (elAlert) {
    elAlert.className = "alert d-none mt-3";
    elAlert.textContent = "";
  }

  let valid = true;
  if (!nama) {
    elErrNama.textContent = "Nama tidak boleh kosong.";
    valid = false;
  }
  if (!peran) {
    elErrPeran.textContent = "Pilih peran terlebih dahulu.";
    valid = false;
  }
  if (!username || username.length < 3) {
    elErrUser.textContent = "Username minimal 3 karakter.";
    valid = false;
  }
  if (!password || password.length < 8) {
    elErrPass.textContent = "Kata sandi minimal 8 karakter.";
    valid = false;
  } else if (!/[A-Z]/.test(password)) {
    elErrPass.textContent = "Kata sandi harus mengandung minimal 1 huruf besar.";
    valid = false;
  } else if (!/[a-z]/.test(password)) {
    elErrPass.textContent = "Kata sandi harus mengandung minimal 1 huruf kecil.";
    valid = false;
  } else if (!/[0-9]/.test(password)) {
    elErrPass.textContent = "Kata sandi harus mengandung minimal 1 angka.";
    valid = false;
  } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    elErrPass.textContent = "Kata sandi harus mengandung minimal 1 karakter spesial (!@#$%^&*...).";
    valid = false;
  }
  if (password && konfirm && password !== konfirm) {
    elErrKonf.textContent = "Kata sandi tidak cocok.";
    valid = false;
  }
  if (!valid) return;

  const elBtn = document.getElementById("registerBtn");
  const elTeks = document.getElementById("registerBtnText");
  const elSpin = document.getElementById("registerSpinner");

  elBtn.disabled = true;
  elTeks.textContent = "Membuat Akun...";
  elSpin.classList.remove("d-none");

  try {
    tampilkanLoading("Menyimpan akun...");
    const semuaAkun = await ambilAkun();

    const sudahAda = semuaAkun.find(
      (a) => a.username.toLowerCase() === username.toLowerCase()
    );
    if (sudahAda) {
      sembunyikanLoading();
      elErrUser.textContent = "Username sudah digunakan, pilih yang lain.";
      elBtn.disabled = false;
      elTeks.textContent = "Buat Akun";
      elSpin.classList.add("d-none");
      return;
    }

    const hashedPassword = await hashPassword(password);

    semuaAkun.push({
      nama,
      peran,
      username,
      email,
      password: hashedPassword,
    });
    await simpanAkun(semuaAkun);
    sembunyikanLoading();

    localStorage.setItem(
      "sipenta_user",
      JSON.stringify({ nama, peran, userId: username, email })
    );
    window.location.replace("pages/dashboard.html");
  } catch (err) {
    sembunyikanLoading();
    elBtn.disabled = false;
    elTeks.textContent = "Buat Akun";
    elSpin.classList.add("d-none");
    elAlert.className = "alert alert-danger mt-3";
    elAlert.textContent = "Terjadi kesalahan koneksi, coba lagi.";
  }
}

// ─── Tampilkan statistik di panel brand (async) ───────────────────────────────
async function tampilkanStatLogin() {
  try {
    const semua = await ambilSemuaData();
    const dataPel = semua.pelanggaran || [];
    const dataSiswaL = semua.siswa || [];

    // Gunakan jumlahSiswa dari DB jika ada (sesuai yang diset di dashboard)
    // fallback ke jumlah record siswa jika belum pernah diset
    const totalSiswa =
      semua.jumlahSiswa !== undefined && semua.jumlahSiswa !== null
        ? semua.jumlahSiswa
        : dataSiswaL.length;

    const bln = bulanIni();
    const pelBulanIni = dataPel.filter((p) =>
      p.tanggal?.startsWith(bln)
    ).length;
    const siswaMelanggar = new Set(
      dataPel.filter((p) => p.tanggal?.startsWith(bln)).map((p) => p.nama)
    ).size;
    const pctKepatuhan =
      totalSiswa > 0
        ? Math.max(
            0,
            Math.round(((totalSiswa - siswaMelanggar) / totalSiswa) * 100)
          )
        : 0;

    const elSiswa = document.getElementById("loginSiswaAktif");
    const elPel = document.getElementById("loginPelBulanIni");
    const elKepatuhan = document.getElementById("loginKepatuhan");

    if (elSiswa)
      elSiswa.textContent =
        totalSiswa >= 1000
          ? (totalSiswa / 1000).toFixed(1) + " rb"
          : String(totalSiswa);
    if (elPel) elPel.textContent = pelBulanIni;
    if (elKepatuhan) elKepatuhan.textContent = pctKepatuhan + "%";
  } catch (err) {
    console.error("tampilkanStatLogin error:", err);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  tampilkanStatLogin();
  document.getElementById("loginForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    prosesLogin();
  });
  document.getElementById("registerForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    prosesDaftar();
  });
});

// ─── Hitung jumlah pelanggaran bulan ini ─────────────────────────────────────
function hitungPelBulanIni() {
  const bln = bulanIni();
  return dataPelanggaran.filter((p) => p.tanggal?.startsWith(bln)).length;
}

// ─── Hitung jumlah siswa bermasalah (poin >= 40) ─────────────────────────────
function hitungSiswaBermasalah() {
  return dataSiswa.filter((s) => s.totalPoin >= 40).length;
}

// ─── Animasi angka dari 0 ke target ──────────────────────────────────────────
function animasiAngka(el, target, durasi = 800) {
  if (!el) return;
  const mulai = performance.now();
  function langkah(sekarang) {
    const progress = Math.min((sekarang - mulai) / durasi, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(ease * target).toLocaleString("id-ID");
    if (progress < 1) requestAnimationFrame(langkah);
  }
  requestAnimationFrame(langkah);
}
