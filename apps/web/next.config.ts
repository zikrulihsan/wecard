import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Umur pakai Router Cache di browser, dalam detik.
     *
     * Default Next 16 untuk segmen dinamis adalah 0: halaman yang sudah pernah
     * dibuka tetap diminta ulang ke server setiap kali dikunjungi lagi, lengkap
     * dengan skeleton-nya. Seluruh halaman di grup (app) memakai force-dynamic,
     * jadi semuanya kena.
     *
     * Disamakan dengan `static` (300 detik) karena di dalam satu sesi halaman,
     * satu-satunya data yang benar-benar berubah adalah daftar deck setelah
     * generate AI — dan alur itu memanggil router.refresh(), yang sudah
     * dipastikan ikut membatalkan cache rute lain, bukan cuma rute yang sedang
     * dibuka. Jadi deck baru tetap langsung terlihat berapa pun angka di sini.
     *
     * Statusnya bukan "selamanya": lewat 300 detik, kunjungan berikutnya
     * mengambil data segar. Cache ini juga hanya hidup di memori satu sesi
     * halaman — muat ulang penuh selalu segar.
     */
    staleTimes: {
      dynamic: 300,
      static: 300,
    },
  },
};

export default nextConfig;
