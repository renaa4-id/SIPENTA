// Tampilkan kartu tata tertib
function tampilkanTataTertib() {
  const elDaftar = document.getElementById("tataTertibList");
  if (!elDaftar) return;

  elDaftar.innerHTML = TATA_TERTIB.map(
    (kategori) => `
    <div class="col-md-6 col-xl-4">
      <article class="rule-card h-100">

        <!-- Header kartu: ikon + nama kategori -->
        <div class="rule-card-header">
          <div class="rule-icon" style="background:${kategori.bg}; color:${
      kategori.warna
    }">
            <i class="bi ${kategori.icon}"></i>
          </div>
          <div>
            <strong style="font-size:.86rem">${kategori.kategori}</strong>
            <div style="font-size:.7rem; color:var(--txt-muted)">${
              kategori.aturan.length
            } aturan</div>
          </div>
        </div>

        <!-- Daftar aturan di dalam kategori -->
        <div class="rule-card-body">
          ${kategori.aturan
            .map(
              (aturan) => `
            <div class="rule-item">
              <span class="rule-poin poin-${aturan.level}">${aturan.poin}P</span>
              <span>${aturan.deskripsi}</span>
            </div>`
            )
            .join("")}
        </div>

      </article>
    </div>`
  ).join("");
}
