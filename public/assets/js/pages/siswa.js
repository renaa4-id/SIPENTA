// Ambil data siswa yang sudah difilter
function ambilSiswaTerfilter() {
  const cari = (
    document.getElementById("searchSiswa")?.value || ""
  ).toLowerCase();
  const kelas = document.getElementById("filterKelas")?.value || "";
  const risiko = document.getElementById("filterRisiko")?.value || "";

  return dataSiswa.filter((s) => {
    const cocoNama =
      !cari ||
      s.nama.toLowerCase().includes(cari) ||
      s.kelas.toLowerCase().includes(cari);
    const cocoKelas = !kelas || s.kelas === kelas;
    const cocoRisiko = !risiko || getRisiko(s.totalPoin) === risiko;
    return cocoNama && cocoKelas && cocoRisiko;
  });
}

// Tampilkan kartu siswa di grid
function tampilkanSiswa(data) {
  const elGrid = document.getElementById("siswaGrid");
  if (!elGrid) return;

  if (data.length === 0) {
    elGrid.innerHTML = `
      <div class="col-12">
        <div class="text-center py-5 text-muted">
          <i class="bi bi-people display-3 opacity-25 d-block mb-3"></i>
          <h6 class="fw-semibold mb-1">Belum ada data siswa</h6>
          <p class="small mb-3">Data siswa otomatis muncul saat ada pelanggaran ditambahkan.</p>
          <a href="pelanggaran.html" class="btn btn-primary btn-sm">
            <i class="bi bi-plus-lg me-1"></i>Tambah Pelanggaran Pertama
          </a>
        </div>
      </div>`;
    return;
  }

  elGrid.innerHTML = data
    .map((s, i) => {
      const risiko = getRisiko(s.totalPoin);
      const label = {
        aman: "Aman ✅",
        waspada: "Waspada ⚠️",
        kritis: "Kritis 🔴",
      }[risiko];
      const warna = warnaAvatar(i);

      return `
      <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
        <article class="siswa-card" role="button" tabindex="0"
          onclick="lihatDetailSiswa('${s.nama.replace(/'/g, "\\'")}')">
          <div class="siswa-avatar" style="background:${warna}22; color:${warna}">
            ${inisial(s.nama)}
          </div>
          <div class="siswa-body">
            <div class="siswa-name">${s.nama}</div>
            <div class="siswa-meta">${s.kelas} · NISN ${s.nisn || "–"}</div>
            <span class="poin-chip poin-${risiko}">${
        s.totalPoin
      }P · ${label}</span>
          </div>
        </article>
      </div>`;
    })
    .join("");
}

// Buka modal detail siswa
function lihatDetailSiswa(nama) {
  const siswa = dataSiswa.find((s) => s.nama === nama);
  if (!siswa) return;

  const risiko = getRisiko(siswa.totalPoin);
  const riwayat = dataPelanggaran.filter(
    (p) => p.nama.toLowerCase() === siswa.nama.toLowerCase()
  );
  const elBody = document.getElementById("siswaDetailBody");
  if (!elBody) return;

  elBody.innerHTML = `
    <div class="text-center mb-3">
      <div class="profil-avatar mx-auto mb-2" style="width:52px;height:52px;font-size:1.1rem">
        ${inisial(siswa.nama)}
      </div>
      <h6 class="fw-bold mb-0">${siswa.nama}</h6>
      <small class="text-muted">${siswa.kelas} · NISN ${
    siswa.nisn || "–"
  }</small>
    </div>

    <div class="row g-2 mb-3 text-center">
      <div class="col-4">
        <div class="mini-stat">
          <span class="mini-val">${siswa.totalPoin}</span>
          <span class="mini-lbl">Total Poin</span>
        </div>
      </div>
      <div class="col-4">
        <div class="mini-stat">
          <span class="mini-val">${riwayat.length}</span>
          <span class="mini-lbl">Pelanggaran</span>
        </div>
      </div>
      <div class="col-4">
        <div class="mini-stat">
          <span class="mini-val">
            <span class="poin-chip poin-${risiko}" style="font-size:.65rem">${kapital(
    risiko
  )}</span>
          </span>
          <span class="mini-lbl">Risiko</span>
        </div>
      </div>
    </div>

    <h6 class="fw-bold small mb-2">Riwayat Pelanggaran</h6>
    ${
      riwayat.length > 0
        ? `<ul class="list-group list-group-flush">
          ${riwayat
            .map(
              (r) => `
            <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2 small">
              <div>
                <div>${r.jenis}</div>
                <div class="text-muted" style="font-size:.7rem">
                  ${formatTanggal(r.tanggal)} · <span class="badge-${
                r.status
              }">${kapital(r.status)}</span>
                </div>
                ${
                  r.keterangan
                    ? `<div class="text-muted fst-italic" style="font-size:.7rem">📝 ${r.keterangan}</div>`
                    : ""
                }
              </div>
              <span class="badge-${r.kategori} ms-2">${r.poin}P</span>
            </li>`
            )
            .join("")}
        </ul>`
        : `<p class="text-muted small text-center py-3">Tidak ada riwayat pelanggaran</p>`
    }
  `;

  new bootstrap.Modal(document.getElementById("modalSiswaDetail")).show();
}

// Aktifkan filter pencarian siswa
function initFilterSiswa() {
  document
    .getElementById("searchSiswa")
    ?.addEventListener("input", () => tampilkanSiswa(ambilSiswaTerfilter()));
  document
    .getElementById("filterKelas")
    ?.addEventListener("change", () => tampilkanSiswa(ambilSiswaTerfilter()));
  document
    .getElementById("filterRisiko")
    ?.addEventListener("change", () => tampilkanSiswa(ambilSiswaTerfilter()));
}
