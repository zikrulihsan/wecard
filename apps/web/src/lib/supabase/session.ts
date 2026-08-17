/**
 * Pembacaan sesi Supabase secara lokal — tanpa jaringan, tanpa supabase-js.
 *
 * Dipakai di middleware (Edge runtime) untuk keputusan routing. Sengaja tidak
 * mengimpor apa pun dari next/* atau @supabase/* supaya ringan dan bisa jalan
 * di runtime mana pun.
 *
 * PENTING soal keamanan: fungsi di file ini TIDAK memverifikasi tanda tangan
 * JWT. Hasilnya hanya boleh dipakai untuk keputusan tampilan/routing (mau
 * redirect ke /login atau tidak), bukan sebagai gerbang otorisasi. Gerbang
 * yang sebenarnya tetap Row Level Security di Postgres: setiap query membawa
 * JWT yang diverifikasi tanda tangannya di sisi server, jadi cookie palsu
 * hanya menghasilkan halaman kosong, bukan data orang lain.
 */

// Sama dengan konstanta di @supabase/ssr.
const BASE64_PREFIX = "base64-";

// @supabase/auth-js menganggap sesi perlu di-refresh saat sisa umur token
// kurang dari EXPIRY_MARGIN_MS (AUTO_REFRESH_TICK_THRESHOLD * TICK_DURATION
// = 3 * 30 dtk). Disamakan supaya jalur lambat kita persis memicu refresh
// milik library, tidak meleset jadi panggilan sia-sia.
export const EXPIRY_MARGIN_SECONDS = 90;

export interface AuthSnapshot {
  userId: string;
  email: string | null;
  /** Kedaluwarsa access token, detik epoch. */
  expiresAt: number;
  /** Token sudah lewat atau tinggal < 90 detik — perlu jalur refresh. */
  needsRefresh: boolean;
}

export type CookieReader = (name: string) => string | undefined;

/**
 * Nama cookie sesi, rumusnya sama dengan default storageKey supabase-js:
 * `sb-${hostname.split(".")[0]}-auth-token`.
 */
export function authCookieName(supabaseUrl: string): string {
  return `sb-${new URL(supabaseUrl).hostname.split(".")[0]}-auth-token`;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Gabungkan cookie yang dipecah jadi `<key>.0`, `<key>.1`, … oleh
 * @supabase/ssr saat sesi melebihi 3180 byte.
 */
function readChunkedCookie(
  getCookie: CookieReader,
  key: string
): string | null {
  const whole = getCookie(key);
  if (whole) return whole;

  const chunks: string[] = [];
  for (let i = 0; ; i++) {
    const chunk = getCookie(`${key}.${i}`);
    if (!chunk) break;
    chunks.push(chunk);
  }
  return chunks.length > 0 ? chunks.join("") : null;
}

function accessTokenFromCookie(raw: string): string | null {
  let decoded = raw;
  if (decoded.startsWith(BASE64_PREFIX)) {
    try {
      decoded = base64UrlDecode(decoded.slice(BASE64_PREFIX.length));
    } catch {
      return null;
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    return null;
  }

  // Format lama menyimpan sesi sebagai array [access_token, refresh_token, …].
  if (Array.isArray(parsed)) {
    return typeof parsed[0] === "string" ? parsed[0] : null;
  }
  if (parsed && typeof parsed === "object") {
    const token = (parsed as { access_token?: unknown }).access_token;
    return typeof token === "string" ? token : null;
  }
  return null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload: unknown = JSON.parse(base64UrlDecode(parts[1]));
    return payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Baca sesi dari cookie dan decode klaimnya secara lokal.
 * Mengembalikan null kalau tidak ada sesi atau cookienya tidak bisa dibaca.
 */
export function readAuthSnapshot(
  getCookie: CookieReader,
  supabaseUrl: string,
  now: number = Date.now()
): AuthSnapshot | null {
  const raw = readChunkedCookie(getCookie, authCookieName(supabaseUrl));
  if (!raw) return null;

  const accessToken = accessTokenFromCookie(raw);
  if (!accessToken) return null;

  const claims = decodeJwtPayload(accessToken);
  if (!claims) return null;

  const userId = typeof claims.sub === "string" ? claims.sub : null;
  if (!userId) return null;

  const expiresAt = typeof claims.exp === "number" ? claims.exp : 0;
  const secondsLeft = expiresAt - now / 1000;

  return {
    userId,
    email: typeof claims.email === "string" ? claims.email : null,
    expiresAt,
    needsRefresh: secondsLeft < EXPIRY_MARGIN_SECONDS,
  };
}
