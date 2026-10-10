import { CHEAPEST_PER_CREDIT, CREDIT_PACKS } from "@/lib/credits";

export { CHEAPEST_PER_CREDIT, CREDIT_PACKS };

/**
 * Apakah halaman marketing (landing, /coba) boleh menyebut paket kredit
 * "bisa dibeli". Pembelian sebenarnya dijaga server — `/api/credits/checkout`
 * menolak selama `MIDTRANS_SERVER_KEY` belum diset — tapi halaman publik
 * tidak bisa menanyakan itu tanpa login, jadi statusnya ditanam saat build
 * lewat `VITE_CREDITS_ON_SALE=true`. Ubah bersamaan dengan memasang kunci
 * Midtrans, lalu redeploy.
 */
export const CREDITS_ON_SALE = import.meta.env.VITE_CREDITS_ON_SALE === "true";

/** "12.000" — tanpa "Rp", supaya penempatannya bebas di teks. */
export function formatIdr(value: number): string {
  return value.toLocaleString("id-ID");
}
