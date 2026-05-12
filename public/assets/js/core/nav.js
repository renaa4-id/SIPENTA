(function initNav() {
  // Cek sesi login — kalau belum login langsung ke index
  const sesi = localStorage.getItem('sipenta_user');
  if (!sesi) { window.location.replace('../index.html'); return; }

  const pengguna = JSON.parse(sesi);
  const labelPeran = {
    admin : 'Administrator',
    guru  : 'Guru / Wali Kelas',
    bp    : 'Guru BK / BP',
    siswa : 'Siswa',
  }[pengguna.peran] || 'Pengguna';

  // Tampilkan nama di navbar
  ['navName','dropdownName','mobileUserName','desktopSidebarName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = pengguna.nama;
  });

  // Tampilkan inisial di avatar
  ['navAvatar','mobileAvatar','desktopSidebarAvatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = inisial(pengguna.nama);
  });

  // Tampilkan label peran
  ['dropdownRole','mobileUserRole','desktopSidebarRole'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = labelPeran;
  });
})();

// Fungsi logout — bisa dipanggil dari onclick di mana saja
function logout() {
  localStorage.removeItem('sipenta_user');
  sessionStorage.removeItem('sipenta_user');
  window.location.replace('../index.html');
}
