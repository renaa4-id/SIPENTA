// Muat dan tampilkan data profil pengguna
async function initProfil(penggunaAktif, idElemenNama) {
  if (!idElemenNama)
    idElemenNama = [
      "navName",
      "dropdownName",
      "mobileUserName",
      "desktopSidebarName",
    ];

  // Ambil data akun dari JSONBin (bukan localStorage)
  const semuaAkun = await ambilAkun();
  const akun = semuaAkun.find((a) => a.username === penggunaAktif.userId);

  if (akun) {
    // Isi form edit dengan data akun
    const elNama = document.getElementById("editNama");
    const elEmail = document.getElementById("editEmail");
    if (elNama) elNama.value = akun.nama || "";
    if (elEmail) elEmail.value = akun.email || "";

    // Tampilkan di kartu profil
    const elProfilNama = document.getElementById("profilNama");
    const elProfilEmail = document.getElementById("profilEmail");
    const elProfilUsername = document.getElementById("profilUsername");
    if (elProfilNama)
      elProfilNama.textContent = akun.nama || penggunaAktif.nama;
    if (elProfilEmail) elProfilEmail.textContent = akun.email || "–";
    if (elProfilUsername) elProfilUsername.textContent = akun.username;
  } else {
    // Fallback: pakai data sesi
    const elNama = document.getElementById("editNama");
    const elEmail = document.getElementById("editEmail");
    if (elNama) elNama.value = penggunaAktif.nama || "";
    if (elEmail) elEmail.value = penggunaAktif.email || "";

    // Tampilkan juga di kartu profil menggunakan data sesi
    const elProfilNama = document.getElementById("profilNama");
    const elProfilEmail = document.getElementById("profilEmail");
    const elProfilUsername = document.getElementById("profilUsername");
    if (elProfilNama) elProfilNama.textContent = penggunaAktif.nama || "–";
    if (elProfilEmail) elProfilEmail.textContent = penggunaAktif.email || "–";
    if (elProfilUsername)
      elProfilUsername.textContent = penggunaAktif.userId || "–";
  }

  // Tombol simpan profil
  document
    .getElementById("btnSimpanProfil")
    ?.addEventListener("click", async function () {
      const namaBaru = document.getElementById("editNama")?.value.trim();
      const emailBaru = document.getElementById("editEmail")?.value.trim();
      const passBaru = document.getElementById("editNewPwd")?.value;
      const konfirm = document.getElementById("editNewPwd2")?.value;

      // Validasi
      if (!namaBaru) {
        tampilkanToast("Nama tidak boleh kosong!", "warning");
        return;
      }
      if (passBaru) {
        if (passBaru.length < 6) {
          tampilkanToast("Kata sandi baru minimal 6 karakter!", "warning");
          return;
        }
        if (passBaru !== konfirm) {
          tampilkanToast("Konfirmasi kata sandi tidak cocok!", "warning");
          return;
        }
      }

      try {
        tampilkanLoading("Menyimpan profil...");

        // Ambil daftar akun terbaru dari JSONBin
        const daftarAkun = await ambilAkun();
        const idxAkun = daftarAkun.findIndex(
          (a) => a.username === penggunaAktif.userId
        );

        if (idxAkun !== -1) {
          daftarAkun[idxAkun].nama = namaBaru;
          daftarAkun[idxAkun].email = emailBaru;

          // Hash password baru sebelum simpan
          if (passBaru) {
            daftarAkun[idxAkun].password = await hashPassword(passBaru);
          }

          // Simpan ke JSONBin
          await simpanAkun(daftarAkun);
        }

        sembunyikanLoading();

        // Update sesi aktif di localStorage (hanya nama & email, bukan password)
        penggunaAktif.nama = namaBaru;
        penggunaAktif.email = emailBaru;
        localStorage.setItem("sipenta_user", JSON.stringify(penggunaAktif));

        // Update nama di semua elemen navbar
        idElemenNama.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.textContent = namaBaru;
        });

        // Update avatar (inisial nama)
        [
          "navAvatar",
          "mobileAvatar",
          "desktopSidebarAvatar",
          "profilAvatar",
        ].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.textContent = inisial(namaBaru);
        });

        // Update kartu profil
        const elProfilNama = document.getElementById("profilNama");
        const elProfilEmail = document.getElementById("profilEmail");
        if (elProfilNama) elProfilNama.textContent = namaBaru;
        if (elProfilEmail) elProfilEmail.textContent = emailBaru || "–";

        // Kosongkan field password
        const elPass1 = document.getElementById("editNewPwd");
        const elPass2 = document.getElementById("editNewPwd2");
        if (elPass1) elPass1.value = "";
        if (elPass2) elPass2.value = "";

        tampilkanToast("Profil berhasil disimpan!");
      } catch (err) {
        sembunyikanLoading();
        console.error("simpan profil error:", err);
        tampilkanToast("Gagal menyimpan profil, coba lagi.", "danger");
      }
    });

  // Tombol simpan pengaturan sekolah
  document
    .getElementById("btnSimpanSekolah")
    ?.addEventListener("click", function () {
      tampilkanToast("Pengaturan sekolah disimpan!");
    });
}
