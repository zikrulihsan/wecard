/**
 * Origin publik aplikasi ini — dipakai untuk menyusun tautan yang dikirim
 * Supabase lewat email (konfirmasi pendaftaran, reset password).
 *
 * Tidak boleh mengandalkan `window.location.origin` saja: kalau pendaftaran
 * dilakukan dari `localhost` atau dari deploy preview, tautan di email ikut
 * menunjuk ke sana dan penerima mendarat di alamat yang tidak bisa dibuka.
 * `NEXT_PUBLIC_SITE_URL` mengunci origin yang benar per environment; origin
 * browser hanya jadi cadangan kalau variabel itu belum diisi.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (typeof window !== "undefined") return window.location.origin;

  return "";
}

/** URL absolut ke sebuah path di origin publik. `path` harus diawali "/". */
export function siteUrlFor(path: string): string {
  return `${siteUrl()}${path}`;
}
