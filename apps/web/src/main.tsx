import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import "@/styles.css";

/**
 * Setelah deploy baru, tab yang masih terbuka memegang daftar chunk lama
 * yang sudah tidak ada di server (Netlify menjawabnya dengan index.html), jadi
 * membuka halaman lazy berikutnya gagal — tanpa ini layarnya putih kosong.
 * Muat ulang sekali untuk mengambil versi baru; kalau baru saja dicoba dan
 * masih gagal, biarkan ErrorBoundary menampilkan pesan.
 */
const CHUNK_RELOAD_KEY = "flipcard:chunk-reload-at";
window.addEventListener("vite:preloadError", () => {
  try {
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) return;
    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage diblokir — tetap coba muat ulang sekali ini.
  }
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter><App /></BrowserRouter>,
);
