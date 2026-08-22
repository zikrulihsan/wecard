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
 * hadir" dan tombolnya mengarah ke pendaftaran gratis — halaman tidak boleh
 * menawarkan tombol beli yang tidak ada checkout-nya.
 */
export function Pricing() {
  return (
    <section id="harga" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Coba dulu, bayar kalau memang kepakai
          </h2>
          <p className="text-lg leading-relaxed text-neutral-600">
            Deck bawaan gratis selamanya. Yang berbayar cuma jatah bikin deck
            baru pakai AI — itu pun setelah {AI_GENERATION_LIMIT} deck
            gratismu habis.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Gratis */}
          <div className="flex min-w-0 flex-col rounded-2xl border border-neutral-200 p-6 sm:p-8">
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
              <Item>
                Deck Pasangan dan Anak &amp; Orang Tua, semua kartunya
              </Item>
              <Item>Main sepuasnya — jatah itu untuk bikin, bukan main</Item>
              <Item>Deck yang sudah jadi tetap milikmu</Item>
            </ul>

            <div className="mt-8 pt-2">
              <PrimaryCta href="/register" className="h-11 w-full">
                Mulai gratis
              </PrimaryCta>
            </div>
          </div>

          {/* Top-up */}
          <div className="relative flex min-w-0 flex-col rounded-2xl border-2 border-pink-300 bg-gradient-to-b from-pink-50/70 to-white p-6 sm:p-8">
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
              Sekitar Rp {formatIdr(AI_TOPUP_PRICE_PER_DECK)} per deck · bayar
              sekali, bukan langganan
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <Item>
                <strong className="font-semibold">
                  {AI_TOPUP_PACK.generations} deck AI
                </strong>{" "}
                baru, dipakai kapan pun
              </Item>
              <Item>Jatahnya tidak hangus — tidak ada masa berlaku</Item>
              <Item>Bisa top-up lagi kalau habis</Item>
              <Item>Deck yang gagal dibuat tidak memotong jatah</Item>
            </ul>

            <div className="mt-8 pt-2">
              {AI_TOPUP_PACK.available ? (
                <PrimaryCta href="/store" className="h-11 w-full">
                  Beli paket
                </PrimaryCta>
              ) : (
                <>
                  <PrimaryCta href="/register" className="h-11 w-full">
                    Pakai {AI_GENERATION_LIMIT} deck gratis dulu
                  </PrimaryCta>
                  <p className="mt-3 text-center text-xs text-neutral-500">
                    Pembelian paket belum dibuka. Sampai saat itu, semua akun
                    tetap dapat {AI_GENERATION_LIMIT} deck AI gratis.
                  </p>
                </>
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
