import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { PrimaryCta } from "./cta";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import {
  AI_TOPUP_PACK,
  AI_TOPUP_PRICE_PER_DECK,
  formatIdr,
} from "@/lib/pricing";

/**
 * Harga, disebut terbuka.
 *
 * Dua kolom, bukan tabel bertingkat: yang gratis benar-benar bisa dipakai
 * (deck bawaan lengkap + {AI_GENERATION_LIMIT} deck AI), dan yang berbayar
 * cuma menambah jatah bikin deck. Menyembunyikan harga sampai orang mendaftar
 * cuma menunda kekecewaan yang sama.
 *
 * Selama `AI_TOPUP_PACK.available` masih false, paketnya ditandai "segera
 * hadir" dan area aksinya berubah menjadi penjelasan status — halaman tidak
 * boleh menawarkan tombol beli yang belum punya checkout atau mengulang CTA
 * paket Gratis.
 */
export function Pricing() {
  return (
    <section
      id="harga"
      className="bg-gradient-to-b from-rose-50 via-orange-50/60 to-white px-6 py-20"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Mulai gratis
          </h2>
          <p className="text-lg leading-relaxed text-neutral-600">
            Deck bawaan gratis selamanya. Yang berbayar cuma jatah bikin deck
            AI.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Gratis */}
          <div className="flex min-w-0 flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-200 sm:p-8">
            <h3 className="font-semibold">Gratis</h3>
            <p className="mt-3 text-4xl font-bold tracking-tight">Rp 0</p>
            <p className="mt-1 text-sm text-neutral-500">
              Semua akun, tanpa kartu kredit
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <Item>
                <strong className="font-semibold">
                  {AI_GENERATION_LIMIT} deck AI
                </strong>{" "}
                buatanmu sendiri
              </Item>
              <Item>Semua deck bawaan</Item>
              <Item>Main sepuasnya, tanpa batas</Item>
            </ul>

            <div className="mt-8 pt-2">
              <Link
                to="/register"
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-neutral-300 bg-white px-6 text-base font-semibold text-neutral-800 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 active:translate-y-0"
              >
                Buat akun gratis
              </Link>
            </div>
          </div>

          {/* Top-up */}
          <div className="relative flex min-w-0 flex-col rounded-3xl bg-white p-6 shadow-xl shadow-pink-500/10 ring-2 ring-pink-300 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">
                Tambah {AI_TOPUP_PACK.generations} deck AI
              </h3>
              {!AI_TOPUP_PACK.available && (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-pink-700 ring-1 ring-pink-200">
                  Segera hadir
                </span>
              )}
            </div>

            <p className="mt-3 text-4xl font-bold tracking-tight">
              Rp {formatIdr(AI_TOPUP_PACK.priceIdr)}
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              ±Rp {formatIdr(AI_TOPUP_PRICE_PER_DECK)} per deck · sekali bayar
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <Item>
                <strong className="font-semibold">
                  {AI_TOPUP_PACK.generations} deck AI
                </strong>{" "}
                tambahan
              </Item>
              <Item>Bukan langganan, tidak hangus</Item>
              <Item>Gagal dibuat = tidak terpotong</Item>
            </ul>

            <div className="mt-8 pt-2">
              {AI_TOPUP_PACK.available ? (
                <PrimaryCta href="/store" className="h-11 w-full">
                  Beli paket
                </PrimaryCta>
              ) : (
                <div
                  role="status"
                  className="rounded-xl border border-dashed border-pink-300 bg-white/80 px-4 py-3 text-center shadow-sm"
                >
                  <p className="text-sm font-semibold text-neutral-800">
                    Pembelian belum dibuka
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <Check className="mt-0.5 size-4 shrink-0 text-pink-600" />
      <span className="leading-relaxed text-neutral-600">{children}</span>
    </li>
  );
}
