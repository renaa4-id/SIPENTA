// Tampilkan 6 pelanggaran terbaru di tabel beranda
function tampilkanPelanggaranTerbaru() {
  const elTabel = document.getElementById("recentViolationTable");
  if (!elTabel) return;

  const terbaru = dataPelanggaran.slice(0, 6);

  if (terbaru.length === 0) {
    elTabel.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4 small">
          <i class="bi bi-inbox d-block fs-3 opacity-25 mb-1"></i>
          Belum ada pelanggaran
        </td>
      </tr>`;
    return;
  }

  elTabel.innerHTML = terbaru
    .map(
      (p) => `
    <tr>
      <td>
        <strong>${p.nama}</strong>
        <div class="text-muted" style="font-size:.7rem">${p.kelas}</div>
      </td>
      <td>${p.jenis}</td>
      <td><span class="badge-${p.kategori}">${kapital(p.kategori)}</span></td>
      <td><strong>${p.poin}</strong></td>
      <td><span class="badge-${p.status}">${kapital(p.status)}</span></td>
      <td>
        ${p.pengirim ? `
          <div style="font-size:.78rem;font-weight:600">${p.pengirim}</div>
          <div style="font-size:.68rem;color:#6b7280">${{admin:'Administrator',guru:'Guru / Wali Kelas',bp:'Guru BK / BP',sp2tk:'SP2TK'}[p.peranPengirim] || p.peranPengirim || ''}</div>
        ` : '<span style="font-size:.75rem;color:#9ca3af">–</span>'}
      </td>
    </tr>`
    )
    .join("");
}

// Hitung dan update stat cards beranda
function updateStatCards() {
  const pelBulanIni = hitungPelBulanIni();
  const bermasalah = hitungSiswaBermasalah();
  const total = dataSiswa.length;
  const kepatuhan =
    total > 0 ? Math.max(0, Math.round(100 - (bermasalah / total) * 100)) : 100;

  const elPel = document.getElementById("statPelBulanIni");
  const elMasalah = document.getElementById("statBermasalah");
  const elKepatuhan = document.getElementById("statKepatuhan");
  if (elPel) elPel.textContent = pelBulanIni.toLocaleString("id-ID");
  if (elMasalah) elMasalah.textContent = bermasalah.toLocaleString("id-ID");
  if (elKepatuhan) elKepatuhan.textContent = kepatuhan.toLocaleString("id-ID");
}

// ── JUMLAH SISWA (editable, tersimpan di DB) ──
function tampilkanJumlahSiswa() {
  const el = document.getElementById("statJumlahSiswa");
  if (!el) return;
  // Gunakan jumlah aktual dari dataSiswa sebagai default jika belum ada override
  const tersimpan = localStorage.getItem("sipenta_jumlah_siswa");
  const jumlah = tersimpan !== null ? parseInt(tersimpan) : dataSiswa.length;
  animasiAngka(el, jumlah);
}

function editJumlahSiswa() {
  const tersimpan = localStorage.getItem("sipenta_jumlah_siswa");
  const jumlahSekarang =
    tersimpan !== null ? parseInt(tersimpan) : dataSiswa.length;
  const input = document.getElementById("inputJumlahSiswa");
  if (input) input.value = jumlahSekarang;
  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalEditSiswa")
  );
  modal.show();
}

async function simpanJumlahSiswa() {
  const input = document.getElementById("inputJumlahSiswa");
  if (!input) return;
  const nilai = parseInt(input.value);
  if (isNaN(nilai) || nilai < 0) {
    tampilkanToast("Masukkan angka yang valid", "danger");
    return;
  }

  // Simpan ke localStorage (sinkron cepat)
  localStorage.setItem("sipenta_jumlah_siswa", nilai);

  // Simpan juga ke JSONBin lewat storage agar persisten di semua device
  try {
    const semua = await ambilSemuaData();
    semua.jumlahSiswa = nilai;
    await simpanSemuaData(semua);
  } catch (e) {
    // localStorage tetap jadi fallback
    console.warn("Gagal simpan ke DB:", e);
  }

  // Update tampilan
  const el = document.getElementById("statJumlahSiswa");
  if (el) animasiAngka(el, nilai);

  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modalEditSiswa")
  ).hide();
  tampilkanToast("Jumlah siswa berhasil disimpan!");
}

// ── INIT BERANDA ──
(async function mulai() {
  if (!document.getElementById("mainContent")) return;

  const sesi = localStorage.getItem("sipenta_user");
  if (!sesi) {
    window.location.replace("../index.html");
    return;
  }

  const pengguna = JSON.parse(sesi);

  // Sapaan
  const elGreet = document.getElementById("greetName");
  if (elGreet) elGreet.textContent = pengguna.nama;

  // Ambil data dari JSONBin dulu (satu kali fetch, hasil dipakai langsung)
  tampilkanLoading("Memuat dashboard...");
  const semua = await initData();
  sembunyikanLoading();

  // Sinkron jumlahSiswa dari DB (pakai hasil initData, tidak perlu fetch ulang)
  if (semua && semua.jumlahSiswa !== undefined) {
    localStorage.setItem("sipenta_jumlah_siswa", semua.jumlahSiswa);
  }

  // Animasi stat cards
  const bms = hitungSiswaBermasalah();
  const tot = dataSiswa.length;
  const kpt = tot > 0 ? Math.max(0, Math.round(100 - (bms / tot) * 100)) : 100;
  [
    ["statPelBulanIni", hitungPelBulanIni()],
    ["statBermasalah", bms],
    ["statKepatuhan", kpt],
  ].forEach(([id, target]) => {
    const el = document.getElementById(id);
    if (el) animasiAngka(el, target);
  });

  // Jumlah siswa
  tampilkanJumlahSiswa();

  // Tombol simpan jumlah siswa
  document
    .getElementById("btnSimpanJumlahSiswa")
    ?.addEventListener("click", simpanJumlahSiswa);

  // Konten beranda
  tampilkanPelanggaranTerbaru();
  tampilkanKategori("categoryList");
})();