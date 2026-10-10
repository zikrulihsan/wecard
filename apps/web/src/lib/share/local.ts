/**
 * Yang diingat perangkat untuk pemain lewat link main: nama terakhir (supaya
 * tidak diketik ulang tiap main) dan link asal sebelum daftar (untuk metrik
 * pemain → pembuat). Penyimpanan yang diblokir (mode privat) tidak apa-apa —
 * keduanya opsional.
 */

const NAME_KEY = "flipcard:player-name";
const REFERRAL_KEY = "flipcard:share-referral";
// Pendaftaran yang terjadi lebih dari seminggu sesudah main tidak lagi
// dihitung berasal dari link itu.
const REFERRAL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const PLAYER_NAME_MAX = 40;

export function readPlayerName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function savePlayerName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // abaikan
  }
}

export function rememberReferral(token: string) {
  try {
    localStorage.setItem(REFERRAL_KEY, JSON.stringify({ token, at: Date.now() }));
  } catch {
    // abaikan
  }
}

/** Token link asal yang belum diklaim, lalu dihapus dari perangkat. */
export function takeReferral(): string | null {
  try {
    const raw = localStorage.getItem(REFERRAL_KEY);
    if (!raw) return null;
    localStorage.removeItem(REFERRAL_KEY);
    const value = JSON.parse(raw) as { token?: unknown; at?: unknown };
    if (typeof value.token !== "string" || typeof value.at !== "number") return null;
    return Date.now() - value.at < REFERRAL_TTL_MS ? value.token : null;
  } catch {
    return null;
  }
}
