import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Umur pakai Router Cache di browser, dalam detik.
     *
     * Default Next 16 untuk segmen dinamis adalah 0, artinya halaman yang
     * sudah pernah dibuka tetap diminta ulang ke server setiap kali dikunjungi
     * lagi — skeleton muncul lagi padahal isinya sama. Seluruh halaman di grup
     * (app) memakai force-dynamic, jadi semuanya kena.
     *
     * Data di app ini jarang berubah dalam hitungan detik: daftar deck hanya
     * bertambah lewat generate AI, dan alur itu sudah memanggil router.refresh()
     * yang membatalkan cache ini, sehingga deck baru tetap langsung terlihat.
     *
     * Cache ini hanya hidup di memori satu sesi halaman; muat ulang penuh tetap
     * mengambil data segar.
     */
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

export default nextConfig;
