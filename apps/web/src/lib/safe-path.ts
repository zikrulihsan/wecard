/**
 * Pembersih parameter `redirect` yang datang dari URL.
 *
 * Nilai itu berakhir di dua tempat yang sama-sama bisa membawa pengguna keluar
 * domain: `NextResponse.redirect()` di route `/callback`, dan `router.push()`
 * di halaman login. Keduanya menerima URL absolut, jadi parameter mentah dari
 * query berarti siapa pun bisa membuat tautan yang berangkat dari domain
 * FlipCard tapi mendarat di situs orang lain — persis bentuk yang dipakai
 * untuk phishing halaman login.
 *
 * Yang legal cuma path relatif di dalam aplikasi ini. Middleware sendiri hanya
 * pernah mengisi parameter itu dengan `pathname` (lihat lib/supabase/middleware),
 * jadi pembatasan ini tidak menghilangkan satu pun alur yang sah.
 */

/** Tujuan default kalau parameter tidak ada atau tidak lolos pemeriksaan. */
export const DEFAULT_REDIRECT = "/home";

export function safePath(
  value: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT
): string {
  if (!value) return fallback;

  // Browser membuang tab, newline, dan carriage return dari URL sebelum
  // menguraikannya, jadi "/\n/evil.com" berubah jadi "//evil.com" —
  // protocol-relative, dan lolos kalau pemeriksaan di bawah dijalankan pada
  // teks aslinya. Buang dulu semua karakter kontrol.
  const cleaned = Array.from(value)
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code > 0x1f && code !== 0x7f;
    })
    .join("");

  // Harus path absolut di origin ini. "//evil.com" adalah URL
  // protocol-relative, bukan path — dan sebagian browser memperlakukan
  // backslash seperti garis miring, sehingga "/\evil.com" ikut berbahaya.
  if (!cleaned.startsWith("/")) return fallback;
  if (cleaned.startsWith("//")) return fallback;
  if (cleaned.includes("\\")) return fallback;

  return cleaned;
}
