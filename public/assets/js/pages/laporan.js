// Buat grafik batang sederhana
function buatGrafik(idElemen, dataGrafik, keyLabel, keyNilai, warna) {
  const el = document.getElementById(idElemen);
  if (!el) return;

  const nilaiTertinggi = Math.max(...dataGrafik.map((d) => d[keyNilai]), 1);

  el.innerHTML = `<div class="chart-bars">
    ${dataGrafik
      .map(
        (d) => `
      <div class="bar-item">
        <div class="bar-fill"
          style="height:${Math.round((d[keyNilai] / nilaiTertinggi) * 100)}%;
                 background: linear-gradient(180deg, ${warna} 0%, ${warna}88 100%)"
          data-val="${d[keyNilai]}">
        </div>
        <div class="bar-label">${d[keyLabel]}</div>
      </div>`
      )
      .join("")}
  </div>`;
}

// Tampilkan tren pelanggaran per kelas (bar chart)
function tampilkanTrenKelas() {
  const el = document.getElementById("trenKelasChart");
  if (!el) return;

  // Hitung jumlah pelanggaran per kelas
  const rekapKelas = {};
  dataPelanggaran.forEach((p) => {
    if (!p.kelas) return;
    rekapKelas[p.kelas] = (rekapKelas[p.kelas] || 0) + 1;
  });

  const kelasList = Object.keys(rekapKelas).sort();

  if (kelasList.length === 0) {
    el.innerHTML = `<p class="text-center text-muted py-4 small">
      <i class="bi bi-inbox d-block fs-3 opacity-25 mb-1"></i>Belum ada data
    </p>`;
    return;
  }

  const nilaiMaks = Math.max(...kelasList.map((k) => rekapKelas[k]), 1);

  el.innerHTML = `<div class="chart-bars">
    ${kelasList
      .map(
        (k) => `
      <div class="bar-item">
        <div class="bar-fill"
          style="height:${Math.round((rekapKelas[k] / nilaiMaks) * 100)}%;
                 background: linear-gradient(180deg, #1a56db 0%, #1a56db88 100%)"
          title="${k}: ${rekapKelas[k]} pelanggaran">
        </div>
        <div class="bar-label">${k}</div>
      </div>`
      )
      .join("")}
  </div>
  <div class="d-flex flex-wrap gap-3 mt-3 justify-content-center">
    ${kelasList
      .map(
        (k) => `
      <span class="small text-muted">
        <strong class="text-primary">${k}</strong>: ${rekapKelas[k]} pelanggaran
      </span>`
      )
      .join("")}
  </div>`;
}

function tampilkanTopPelanggar() {
  const el = document.getElementById("topViolatorTable");
  if (!el) return;

  // Urutkan dari poin terbesar, ambil 5 teratas
  const terurut = [...dataSiswa]
    .sort((a, b) => b.totalPoin - a.totalPoin)
    .slice(0, 5);

  if (terurut.length === 0) {
    el.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4 small">
          <i class="bi bi-inbox d-block fs-3 opacity-25 mb-1"></i>Belum ada data
        </td>
      </tr>`;
    return;
  }

  el.innerHTML = terurut
    .map((s, i) => {
      const risiko = getRisiko(s.totalPoin);
      return `
      <tr>
        <td><strong>#${i + 1}</strong></td>
        <td>${s.nama}</td>
        <td>${s.kelas}</td>
        <td><strong>${s.totalPoin}</strong></td>
        <td><span class="poin-chip poin-${risiko}">${kapital(
        risiko
      )}</span></td>
      </tr>`;
    })
    .join("");
}

// Tampilkan bar kategori (ringan/sedang/berat) di section beranda dan laporan
function tampilkanKategori(idElemen) {
  const el = document.getElementById(idElemen);
  if (!el) return;

  const berat = dataPelanggaran.filter((p) => p.kategori === "berat").length;
  const sedang = dataPelanggaran.filter((p) => p.kategori === "sedang").length;
  const ringan = dataPelanggaran.filter((p) => p.kategori === "ringan").length;
  const total = berat + sedang + ringan || 1; // hindari pembagian 0

  const daftarKategori = [
    { label: "Ringan", jumlah: ringan, warna: "#16a34a" },
    { label: "Sedang", jumlah: sedang, warna: "#d97706" },
    { label: "Berat", jumlah: berat, warna: "#dc2626" },
  ];

  el.innerHTML = daftarKategori
    .map(
      (k) => `
    <li>
      <span style="font-size:.8rem; min-width:42px">${k.label}</span>
      <div class="cat-bar-wrap">
        <div class="cat-bar" style="width:${Math.round(
          (k.jumlah / total) * 100
        )}%; background:${k.warna}"></div>
      </div>
      <span style="font-size:.8rem; font-weight:700; color:${
        k.warna
      }; min-width:20px; text-align:right">
        ${k.jumlah}
      </span>
    </li>`
    )
    .join("");
}

// ── Export Excel menggunakan SheetJS ────────────────────────────────────────
function eksporExcel(dataFiltered, judulLaporan, dari, sampai, penggunaAktif) {
  if (typeof XLSX === "undefined") {
    tampilkanToast("Library Excel belum siap, coba lagi.", "danger");
    return;
  }

  const periodeStr =
    dari && sampai
      ? formatTanggal(dari) + " - " + formatTanggal(sampai)
      : "Semua periode";

  // Header info laporan
  const infoRows = [
    ["SIPENTA - Sistem Pencatatan Pelanggaran Tata Tertib"],
    ["Laporan: " + judulLaporan],
    ["Periode: " + periodeStr],
    ["Dicetak oleh: " + (penggunaAktif.nama || "–")],
    [
      "Tanggal cetak: " +
        new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
    ],
    [],
    [
      "#",
      "Nama Siswa",
      "Kelas",
      "Jenis Pelanggaran",
      "Kategori",
      "Poin",
      "Tanggal",
      "Status",
      "Pengirim",
      "Keterangan",
    ],
  ];

  const dataRows = dataFiltered.map((p, i) => [
    i + 1,
    p.nama,
    p.kelas,
    p.jenis,
    p.kategori ? p.kategori.charAt(0).toUpperCase() + p.kategori.slice(1) : "-",
    p.poin,
    formatTanggal(p.tanggal),
    p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "-",
    p.pengirim || "-",
    p.keterangan || "-",
  ]);

  const semuaBaris = [...infoRows, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(semuaBaris);

  // Lebar kolom
  ws["!cols"] = [
    { wch: 4 },
    { wch: 25 },
    { wch: 10 },
    { wch: 35 },
    { wch: 10 },
    { wch: 6 },
    { wch: 14 },
    { wch: 10 },
    { wch: 15 },
    { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan");

  const namaFile =
    "SIPENTA-Laporan-" +
    judulLaporan.replace(/\s+/g, "-") +
    "-" +
    new Date().toISOString().slice(0, 10) +
    ".xlsx";
  XLSX.writeFile(wb, namaFile);
  tampilkanToast("File Excel berhasil diunduh!");
}

// ── Export PDF menggunakan jsPDF + AutoTable ────────────────────────────────
function eksporPDF(dataFiltered, judulLaporan, dari, sampai, penggunaAktif) {
  if (typeof window.jspdf === "undefined") {
    tampilkanToast("Library PDF belum siap, coba lagi.", "danger");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  const periodeStr =
    dari && sampai
      ? formatTanggal(dari) + " s/d " + formatTanggal(sampai)
      : "Semua periode";

  const tanggalCetak = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // ── Header tengah (mirip pratinjau) ────────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.setTextColor(26, 86, 219);
  doc.text("SIPENTA", pageW / 2, 14, { align: "center" });

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(60, 60, 60);
  doc.text("Laporan " + judulLaporan, pageW / 2, 20, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Periode: " + periodeStr, pageW / 2, 26, { align: "center" });

  // ── 3 Kotak statistik (Total | Berat | Selesai) ────────────────────────────
  const jmlTotal = dataFiltered.length;
  const jmlBerat = dataFiltered.filter((p) => p.kategori === "berat").length;
  const jmlSelesai = dataFiltered.filter((p) => p.status === "selesai").length;

  const kotakW = 50,
    kotakH = 16,
    kotakY = 30,
    gap = 4;
  const kotakStartX = (pageW - (kotakW * 3 + gap * 2)) / 2;

  const kotakData = [
    {
      label: "Total",
      nilai: jmlTotal,
      warna: [26, 86, 219],
      warnaText: [26, 86, 219],
    },
    {
      label: "Berat",
      nilai: jmlBerat,
      warna: [220, 38, 38],
      warnaText: [220, 38, 38],
    },
    {
      label: "Selesai",
      nilai: jmlSelesai,
      warna: [22, 163, 74],
      warnaText: [22, 163, 74],
    },
  ];

  kotakData.forEach((k, i) => {
    const x = kotakStartX + i * (kotakW + gap);
    // Border kotak
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 251, 255);
    doc.roundedRect(x, kotakY, kotakW, kotakH, 2, 2, "FD");
    // Angka besar
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.setTextColor(...k.warnaText);
    doc.text(String(k.nilai), x + kotakW / 2, kotakY + 9, { align: "center" });
    // Label kecil
    doc.setFontSize(7);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(k.label, x + kotakW / 2, kotakY + 13.5, { align: "center" });
  });

  // ── Tabel (8 kolom dengan pengirim) ──────────────────────────────────
  const head = [
    ["#", "Nama", "Kelas", "Pelanggaran", "Poin", "Tanggal", "Status", "Pengirim"],
  ];
  const body =
    dataFiltered.length > 0
      ? dataFiltered.map((p, i) => [
          i + 1,
          p.nama,
          p.kelas,
          p.jenis,
          p.poin,
          formatTanggal(p.tanggal),
          p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : "-",
          p.pengirim || "-",
        ])
      : [["", "Tidak ada data dalam rentang ini", "", "", "", "", "", ""]];

  doc.autoTable({
    head,
    body,
    startY: kotakY + kotakH + 4,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [26, 86, 219], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      2: { halign: "center", cellWidth: 18 },
      4: { halign: "center", cellWidth: 12 },
      5: { halign: "center", cellWidth: 26 },
      6: { halign: "center", cellWidth: 20 },
      7: { halign: "center", cellWidth: 18 },
    },
  });

  // ── Footer ──────────────────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 5;
  doc.setFontSize(7);
  doc.setFont(undefined, "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Dicetak oleh: " + (penggunaAktif.nama || "-") + "   ·   " + tanggalCetak,
    pageW - 14,
    finalY,
    { align: "right" }
  );

  const namaFile =
    "SIPENTA-Laporan-" +
    judulLaporan.replace(/\s+/g, "-") +
    "-" +
    new Date().toISOString().slice(0, 10) +
    ".pdf";
  doc.save(namaFile);
  tampilkanToast("File PDF berhasil diunduh!");
}

// Siapkan tombol generate laporan
function initCetak(penggunaAktif) {
  // Kalau tidak ada parameter, ambil dari localStorage
  if (!penggunaAktif)
    penggunaAktif = JSON.parse(
      localStorage.getItem("sipenta_user") || '{"nama":"–"}'
    );
  document
    .getElementById("btnGenerate")
    ?.addEventListener("click", function () {
      const jenis = document.getElementById("jenisLaporan").value;
      const dari = document.getElementById("cetakDari").value;
      const sampai = document.getElementById("cetakSampai").value;
      const format =
        document.querySelector("input[name=formatCetak]:checked")?.value ||
        "pdf";
      const elHasil = document.getElementById("previewLaporan");
      if (!elHasil) return;

      const judulLaporan = {
        semua: "Semua Pelanggaran",
        bulanan: "Rekap Bulanan",
        kelas: "Per Kelas",
        kategori: "Per Kategori",
      }[jenis];

      // Filter data sesuai rentang tanggal
      const dataFiltered = dataPelanggaran.filter(
        (p) => (!dari || p.tanggal >= dari) && (!sampai || p.tanggal <= sampai)
      );

      // Tampilkan pratinjau dulu — JANGAN langsung download
      elHasil.innerHTML = `
      <div class="text-center mb-3 pb-2 border-bottom">
        <i class="bi bi-shield-check-fill text-primary fs-3 d-block mb-1"></i>
        <h6 class="fw-bold mb-0">SIPENTA</h6>
        <p class="text-muted small mb-0">Laporan ${judulLaporan}</p>
        <small class="text-muted">Periode: ${formatTanggal(
          dari
        )} s/d ${formatTanggal(sampai)}</small>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;text-align:center">
        <tr>
          <td style="width:33%;border:1px solid #ddd;padding:8px">
            <div style="font-size:20pt;font-weight:bold">${
              dataFiltered.length
            }</div>
            <div style="font-size:9pt;color:#555">Total</div>
          </td>
          <td style="width:33%;border:1px solid #ddd;padding:8px">
            <div style="font-size:20pt;font-weight:bold;color:#dc2626">${
              dataFiltered.filter((p) => p.kategori === "berat").length
            }</div>
            <div style="font-size:9pt;color:#555">Berat</div>
          </td>
          <td style="width:33%;border:1px solid #ddd;padding:8px">
            <div style="font-size:20pt;font-weight:bold;color:#16a34a">${
              dataFiltered.filter((p) => p.status === "selesai").length
            }</div>
            <div style="font-size:9pt;color:#555">Selesai</div>
          </td>
        </tr>
      </table>

      <div class="table-responsive">
        <table class="table custom-table mb-0">
          <thead>
            <tr><th>#</th><th>Nama</th><th>Kelas</th><th>Pelanggaran</th><th>Poin</th><th>Tanggal</th><th>Status</th><th>Pengirim</th></tr>
          </thead>
          <tbody>
            ${
              dataFiltered.length > 0
                ? dataFiltered
                    .map(
                      (p, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${p.nama}</td>
                    <td>${p.kelas}</td>
                    <td>${p.jenis}</td>
                    <td>${p.poin}</td>
                    <td>${formatTanggal(p.tanggal)}</td>
                    <td><span class="badge-${p.status}">${kapital(
                        p.status
                      )}</span></td>
                    <td style="font-size:.75rem"><small>${p.pengirim || "–"}</small></td>
                  </tr>`
                    )
                    .join("")
                : `<tr><td colspan="8" class="text-center text-muted py-3">Tidak ada data dalam rentang ini</td></tr>`
            }
          </tbody>
        </table>
      </div>

      <div class="text-end mt-3 small text-muted">
        Dicetak oleh: ${penggunaAktif.nama} ·
        ${new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </div>

      <div class="d-flex gap-2 justify-content-end mt-3 pt-3 border-top" id="tombolUnduh">
        ${
          format === "excel"
            ? `<button class="btn btn-outline-success btn-sm" id="btnUnduhExcel">
               <i class="bi bi-file-excel me-1"></i>Unduh Excel
             </button>`
            : `<button class="btn btn-danger btn-sm" id="btnUnduhPDF">
               <i class="bi bi-file-pdf me-1"></i>Unduh PDF
             </button>`
        }
      </div>`;

      // Pasang event listener tombol unduh sesuai format
      if (format === "excel") {
        document
          .getElementById("btnUnduhExcel")
          ?.addEventListener("click", function () {
            eksporExcel(
              dataFiltered,
              judulLaporan,
              dari,
              sampai,
              penggunaAktif
            );
          });
      } else {
        document
          .getElementById("btnUnduhPDF")
          ?.addEventListener("click", function () {
            eksporPDF(dataFiltered, judulLaporan, dari, sampai, penggunaAktif);
          });
      }

      tampilkanToast(
        "Pratinjau berhasil dibuat. Klik tombol unduh untuk menyimpan."
      );
    });
}
