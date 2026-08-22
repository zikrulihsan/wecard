/**
 * Satu-satunya tempat kegagalan sisi server dicatat.
 *
 * Dipusatkan bukan karena `console.error` kurang — tapi karena saat layanan
 * pemantauan (Sentry dan kawan-kawan) dipasang, yang perlu diubah cuma isi
 * berkas ini, bukan dua puluh pemanggilan yang tersebar. Sampai saat itu
 * keluarannya JSON satu baris, yang bisa dicari di log Netlify/Cloudflare
 * lewat `event` atau `userId`.
 *
 * Aturan pakainya satu: **setiap kegagalan yang membuat pengguna melihat
 * sesuatu yang salah harus lewat sini.** Kegagalan yang cuma dibuang
 * diam-diam adalah kegagalan yang tidak akan pernah Anda tahu — dan
 * pengguna yang menyangka produknya rusak tidak akan repot melapor.
 */

type Context = Record<string, unknown>;

/**
 * Host Supabase yang benar-benar dipakai build ini. Ditanam saat build, jadi
 * kalau env di hosting menunjuk project lain daripada yang dikira, nilai ini
 * yang membuktikannya. Aman dicatat: URL-nya publik.
 */
function supabaseHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
  } catch {
    return "(NEXT_PUBLIC_SUPABASE_URL tidak valid)";
  }
}

/**
 * Bentuk error PostgREST: kegagalan jaringan pun sampai ke sini sebagai objek
 * error biasa, bukan lemparan — lihat catatan di `supabaseError()`.
 */
type PostgrestLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

/**
 * Ubah error Supabase jadi bidang-bidang yang layak dicatat.
 *
 * Penting untuk diketahui saat membaca kodenya: klien Supabase **tidak
 * melempar** saat jaringan putus — ia mengembalikan `{ data: null, error }`
 * dengan pesan semacam "TypeError: Failed to fetch". Artinya query yang cuma
 * mengambil `data` akan melihat `null` dan menyangka datanya memang tidak
 * ada. Karena itu `error` harus selalu ikut diambil dan dilaporkan.
 */
export function supabaseError(error: PostgrestLikeError | null): Context {
  if (!error) return {};
  return {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  };
}

/**
 * Kegagalan yang berdampak ke pengguna. Selalu disertai konteks yang cukup
 * untuk menelusuri satu kejadian: siapa, di mana, dan apa kata sumbernya.
 */
export function reportError(event: string, context: Context = {}): void {
  console.error(
    JSON.stringify({
      level: "error",
      event,
      supabaseHost: supabaseHost(),
      at: new Date().toISOString(),
      ...context,
    })
  );
}

/** Keadaan janggal yang belum tentu salah, tapi tidak boleh lewat tanpa jejak. */
export function reportWarning(event: string, context: Context = {}): void {
  console.warn(
    JSON.stringify({
      level: "warn",
      event,
      supabaseHost: supabaseHost(),
      at: new Date().toISOString(),
      ...context,
    })
  );
}
