/**
 * Aturan kredit. 1 kredit = 1 deck jadi: generate menghasilkan draf, dan
 * kreditnya baru terpotong saat draf disimpan (sekaligus mulai dimainkan).
 *
 * Kembarannya di sisi database ada di migration 00010 — `signup_credits()`,
 * `free_regenerations()`, `free_card_swaps()`. Kalau angkanya diubah, ubah
 * keduanya.
 */

/** Kredit gratis untuk akun baru. */
export const SIGNUP_CREDITS = 2;

/** Revisi gratis per deck sebelum 1 kredit membuka jatah revisi baru. */
export const FREE_REGENERATIONS = 3;
export const FREE_CARD_SWAPS = 5;

/**
 * Batas draf baru per 24 jam per akun. Draf belum memotong kredit, jadi
 * tanpa batas ini orang bisa generate terus lalu membuang drafnya.
 */
export const DAILY_DRAFT_LIMIT = 5;

export type CreditPack = {
  id: string;
  credits: number;
  priceIdr: number;
};

/** Paket kredit yang dijual. Harga diperiksa ulang di server saat checkout. */
export const CREDIT_PACKS: CreditPack[] = [
  { id: "kredit-5", credits: 5, priceIdr: 15000 },
  { id: "kredit-10", credits: 10, priceIdr: 25000 },
];

export function findCreditPack(id: unknown): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => pack.id === id);
}

/** Paket termurah per kredit, untuk menyebut "mulai Rp X per deck". */
export const CHEAPEST_PER_CREDIT = Math.min(
  ...CREDIT_PACKS.map((pack) => Math.round(pack.priceIdr / pack.credits)),
);
