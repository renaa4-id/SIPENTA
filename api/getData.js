// api/getData.js
// Vercel Serverless Function — Ambil data dari JSONBin
// API Key disimpan aman di Environment Variable Vercel, tidak terlihat di browser

export default async function handler(req, res) {
  // Tangani CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Hanya izinkan metode GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  const BIN_ID = process.env.JSONBIN_BIN_ID;
  const API_KEY = process.env.JSONBIN_API_KEY;

  if (!BIN_ID || !API_KEY) {
    return res.status(500).json({ error: "Konfigurasi server belum lengkap" });
  }

  try {
    const response = await fetch(
      `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
      {
        method: "GET",
        headers: {
          "X-Master-Key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return res
        .status(response.status)
        .json({ error: err.message || "Gagal mengambil data" });
    }

    const data = await response.json();

    // Kembalikan hanya bagian record-nya
    return res.status(200).json(data.record);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Terjadi kesalahan server: " + error.message });
  }
}
