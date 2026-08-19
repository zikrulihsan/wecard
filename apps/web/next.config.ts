import type { NextConfig } from "next";

/**
 * Host Supabase harus masuk `connect-src`, kalau tidak semua panggilan auth
 * dan query dari browser diblokir CSP. Nilainya ditanam saat build, sama
 * seperti env-nya sendiri.
 */
function supabaseOrigins(): string[] {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];
  try {
    const { origin, host } = new URL(raw);
    // Supabase Realtime memakai WebSocket ke host yang sama.
    return [origin, `wss://${host}`];
  } catch {
    return [];
  }
}

/**
 * `'unsafe-inline'` di script-src sengaja dipertahankan. Alternatifnya adalah
 * nonce per request, dan itu menuntut setiap halaman dirender dinamis —
 * landing, /login, dan /register saat ini statis, dan justru halaman-halaman
 * itu yang paling untung dari prerender. Selama tidak ada satu pun sink
 * berbahaya di aplikasi (tidak ada dangerouslySetInnerHTML, eval, atau
 * innerHTML), nilai utama CSP di sini ada pada `frame-ancestors`,
 * `form-action`, `base-uri`, dan `connect-src` — dan keempatnya tetap ketat.
 */
function contentSecurityPolicy(): string {
  const connect = ["'self'", ...supabaseOrigins()].join(" ");

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connect}`,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

const isProduction = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  // Cadangan untuk browser lama yang belum mengenal frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Hanya di production: di localhost, HSTS akan memaksa https untuk semua
  // proyek lain di host yang sama dan itu menyusahkan saat pengembangan.
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // Tidak ada gunanya mengumumkan framework yang dipakai.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

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
