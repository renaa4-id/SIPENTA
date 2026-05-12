// Label peran pengirim
function labelPeran(peran) {
  const map = {
    admin: "Administrator",
    guru: "Guru / Wali Kelas",
    bp: "Guru BK / BP",
    sp2tk: "SP2TK",
  };
  return map[peran] || peran || "–";
}

// Teks sanksi berdasarkan level pelanggaran
function getSanksi(level) {
  switch (level) {
    case "ringan":
      return "Teguran lisan";
    case "sedang":
      return "Peringatan tertulis & panggilan orang tua";
    case "berat":
      return "Skorsing / dikeluarkan dari sekolah";
    default:
      return "-";
  }
}

// Update angka statistik
function updateStatPelanggaran() {
  const jumlahBerat = dataPelanggaran.filter(
    (p) => p.kategori === "berat"
  ).length;
  const jumlahSedang = dataPelanggaran.filter(
    (p) => p.kategori === "sedang"
  ).length;
  const jumlahRingan = dataPelanggaran.filter(
    (p) => p.kategori === "ringan"
  ).length;

  const elBerat = document.getElementById("countBerat");
  const elSedang = document.getElementById("countSedang");
  const elRingan = document.getElementById("countRingan");

  if (elBerat) elBerat.textContent = jumlahBerat;
  if (elSedang) elSedang.textContent = jumlahSedang;
  if (elRingan) elRingan.textContent = jumlahRingan;
}

// Ambil data yang sudah difilter sesuai pencarian
function ambilDataTerfilter() {
  const cari = (
    document.getElementById("searchPelanggaran")?.value || ""
  ).toLowerCase();
  const kategori = document.getElementById("filterKategori")?.value || "";
  const status = document.getElementById("filterStatus")?.value || "";

  return dataPelanggaran.filter((p) => {
    const cocoNama =
      !cari ||
      p.nama.toLowerCase().includes(cari) ||
      p.jenis.toLowerCase().includes(cari);
    const cocoKategori = !kategori || p.kategori === kategori;
    const cocoStatus = !status || p.status === status;
    return cocoNama && cocoKategori && cocoStatus;
  });
}

// Tampilkan data pelanggaran ke tabel
function tampilkanPelanggaran(data) {
  const elTabel = document.getElementById("pelanggaranTable");
  const elFoot = document.getElementById("pelanggaranFooter");
  if (!elTabel) return;

  if (data.length === 0) {
    elTabel.innerHTML = `
      <tr>
        <td colspan="10" class="text-center text-muted py-5">
          <i class="bi bi-inbox d-block fs-2 opacity-25 mb-2"></i>
          Belum ada data pelanggaran.<br>
          <small>Klik <strong>Tambah</strong> untuk menambahkan.</small>
        </td>
      </tr>`;
  } else {
    elTabel.innerHTML = data
      .map(
        (p, urutan) => `
      <tr>
        <td>${urutan + 1}</td>
        <td><strong>${p.nama}</strong></td>
        <td>${p.kelas}</td>
        <td>${p.jenis}</td>
        <td><span class="badge-${p.kategori}">${kapital(p.kategori)}</span></td>
        <td><strong>${p.poin}</strong></td>
        <td class="col-hide-sm">${formatTanggal(p.tanggal)}</td>
        <td><span class="badge-${p.status}">${kapital(p.status)}</span></td>
        <td class="col-hide-sm">
          ${p.pengirim ? `
            <div style="font-size:.78rem;font-weight:600">${p.pengirim}</div>
            <div style="font-size:.68rem;color:#6b7280">${labelPeran(p.peranPengirim)}</div>
          ` : '<span style="font-size:.75rem;color:#9ca3af">–</span>'}
        </td>
        <td>
          ${
            p.status !== "selesai"
              ? `
          <button class="btn btn-sm btn-outline-success me-1"
            onclick="ubahStatus(${p.id})" title="Ubah status">
            <i class="bi bi-check2"></i>
          </button>`
              : ""
          }
          <button class="btn btn-sm btn-outline-danger"
            onclick="hapusPelanggaran(${p.id})" title="Hapus">
            <i class="bi bi-trash-fill"></i>
          </button>
        </td>
      </tr>`
      )
      .join("");
  }

  if (elFoot) {
    elFoot.innerHTML = `
      <div class="p-2 px-3 text-muted" style="font-size:.75rem">
        Menampilkan <strong>${data.length}</strong> dari <strong>${dataPelanggaran.length}</strong> data
      </div>`;
  }
}

// Perbarui semua tampilan setelah ada perubahan data (async)
// Tidak perlu fetch ulang karena simpanPelanggaran() sudah update cache
async function refreshSemua() {
  tampilkanPelanggaran(dataPelanggaran);
  updateStatPelanggaran();
}

// Hapus satu data pelanggaran berdasarkan ID (async)
async function hapusPelanggaran(id) {
  if (!confirm("Hapus data pelanggaran ini?")) return;

  const index = dataPelanggaran.findIndex((p) => p.id === id);
  if (index === -1) return;

  const nama = dataPelanggaran[index].nama;
  dataPelanggaran.splice(index, 1);

  tampilkanLoading("Menghapus data...");
  await simpanPelanggaran(dataPelanggaran);
  await hitungUlangPoinSemua();

  const masihAda = dataPelanggaran.some(
    (p) => p.nama.toLowerCase() === nama.toLowerCase()
  );
  if (!masihAda) {
    dataSiswa = dataSiswa.filter(
      (s) => s.nama.toLowerCase() !== nama.toLowerCase()
    );
    await simpanSiswa(dataSiswa);
  }

  sembunyikanLoading();
  tampilkanPelanggaran(dataPelanggaran);
  updateStatPelanggaran();
  tampilkanToast("Data pelanggaran dihapus.", "danger");
}

// Ubah status pelanggaran antara "proses" dan "selesai" (async)
async function ubahStatus(id) {
  const p = dataPelanggaran.find((x) => x.id === id);
  if (!p) return;

  p.status = p.status === "proses" ? "selesai" : "proses";
  tampilkanLoading("Mengubah status...");
  await simpanPelanggaran(dataPelanggaran);
  sembunyikanLoading();
  tampilkanPelanggaran(ambilDataTerfilter());
  tampilkanToast(
    `Status diubah menjadi <strong>${kapital(p.status)}</strong>.`
  );
}

// Isi ulang dropdown jenis pelanggaran (dipanggil setiap modal dibuka)
function isiDropdownPelanggaran() {
  const elDropdown = document.getElementById("mJenisPelanggaran");
  if (!elDropdown) return;

  const semuaAturan = TATA_TERTIB.flatMap((kat) => kat.aturan);
  elDropdown.innerHTML =
    '<option value="" disabled selected>-- Pilih Pelanggaran --</option>' +
    semuaAturan
      .map(
        (aturan, i) =>
          `<option value="${i}" data-poin="${
            aturan.poin
          }" data-sanksi="${getSanksi(aturan.level)}">
        ${aturan.deskripsi} (${aturan.poin}P)
      </option>`
      )
      .join("");
}

// Siapkan modal tambah pelanggaran
function initModalTambah() {
  const elDropdown = document.getElementById("mJenisPelanggaran");
  if (!elDropdown) return;

  // Isi dropdown pertama kali
  isiDropdownPelanggaran();

  // Isi ulang dropdown setiap kali modal dibuka (karena form.reset() menghapus opsi)
  document
    .getElementById("modalTambahPelanggaran")
    ?.addEventListener("show.bs.modal", function () {
      isiDropdownPelanggaran();
      const elTanggal = document.getElementById("mTanggal");
      if (elTanggal) elTanggal.value = new Date().toISOString().split("T")[0];
      document.getElementById("mPoin").value = "";
      document.getElementById("mSanksi").value = "";
    });

  elDropdown.addEventListener("change", function () {
    const opsi = this.options[this.selectedIndex];
    document.getElementById("mPoin").value = opsi.dataset.poin || "";
    document.getElementById("mSanksi").value = opsi.dataset.sanksi || "";
  });

  const elTanggal = document.getElementById("mTanggal");
  if (elTanggal) elTanggal.value = new Date().toISOString().split("T")[0];

  // Tombol simpan (async)
  document
    .getElementById("btnSimpanPelanggaran")
    ?.addEventListener("click", async function () {
      const nama = document.getElementById("mNamaSiswa").value.trim();
      const kelas = document.getElementById("mKelas").value;
      const dropdown = document.getElementById("mJenisPelanggaran");
      const tanggal = document.getElementById("mTanggal").value;
      const keterangan = document.getElementById("mKeterangan").value.trim();

      let valid = true;
      [
        ["mNamaSiswa", nama],
        ["mKelas", kelas],
        ["mJenisPelanggaran", dropdown.value],
        ["mTanggal", tanggal],
      ].forEach(([id, nilai]) => {
        document.getElementById(id).classList.toggle("is-invalid", !nilai);
        if (!nilai) valid = false;
      });
      if (!valid) return;

      // Ambil nama & peran pengirim dari sesi login
      const sesi = JSON.parse(localStorage.getItem("sipenta_user") || "{}");
      const pengirim = sesi.nama || "User";
      const peranPengirim = sesi.peran || "";

      const opsiDipilih = dropdown.options[dropdown.selectedIndex];
      const poin = parseInt(opsiDipilih.dataset.poin, 10);
      const dataBaru = {
        id: Date.now(),
        nama,
        kelas,
        jenis: opsiDipilih.text.split(" (")[0],
        kategori: poin <= 15 ? "ringan" : poin <= 40 ? "sedang" : "berat",
        poin,
        tanggal,
        keterangan,
        status: "proses",
        pengirim,
        peranPengirim,
        tanggalTambah: new Date().toISOString().split("T")[0],
      };

      dataPelanggaran.unshift(dataBaru);

      tampilkanLoading("Menyimpan pelanggaran...");
      await simpanPelanggaran(dataPelanggaran);
      await updateDataSiswa(nama, kelas);
      sembunyikanLoading();

      bootstrap.Modal.getInstance(
        document.getElementById("modalTambahPelanggaran")
      ).hide();
      document.getElementById("formTambahPelanggaran").reset();
      if (elTanggal) elTanggal.value = new Date().toISOString().split("T")[0];

      tampilkanPelanggaran(dataPelanggaran);
      updateStatPelanggaran();
      tampilkanToast(
        `Pelanggaran <strong>${nama}</strong> berhasil disimpan! 🎉`
      );
      bukaSection("pelanggaran");
    });
}

// Aktifkan filter pencarian
function initFilterPelanggaran() {
  document
    .getElementById("searchPelanggaran")
    ?.addEventListener("input", () =>
      tampilkanPelanggaran(ambilDataTerfilter())
    );
  document
    .getElementById("filterKategori")
    ?.addEventListener("change", () =>
      tampilkanPelanggaran(ambilDataTerfilter())
    );
  document
    .getElementById("filterStatus")
    ?.addEventListener("change", () =>
      tampilkanPelanggaran(ambilDataTerfilter())
    );
}
