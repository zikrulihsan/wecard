/**
 * Paket top-up jatah generate deck AI.
 *
 * Dipakai di halaman marketing untuk menyebut harga. Checkout-nya belum ada
 * (lihat `available`) — selama masih `false`, halaman menandainya "segera
 * hadir" dan tetap mengarahkan orang ke pendaftaran gratis. Begitu pembayaran
 * jalan, ubah satu nilai ini dan tombolnya ikut berubah.
 */
export const AI_TOPUP_PACK = {
  generations: 3,
  priceIdr: 12000,
  available: false,
} as const;

/** Harga per deck, dibulatkan — dipakai untuk menunjukkan nilainya. */
export const AI_TOPUP_PRICE_PER_DECK =
  AI_TOPUP_PACK.priceIdr / AI_TOPUP_PACK.generations;

/** "12.000" — tanpa "Rp", supaya penempatannya bebas di teks. */
export function formatIdr(value: number): string {
  return value.toLocaleString("id-ID");
}
