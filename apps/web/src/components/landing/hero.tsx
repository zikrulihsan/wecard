import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { PrimaryCta } from "./cta";
import { HeroCardStack } from "./hero-card-stack";

/**
 * Layar pertama. Tugasnya cuma tiga: menyebut apa ini, menunjukkan wujud
 * kartunya, dan menawarkan jalan masuk yang gratis.
 *
 * Janjinya satu: waktu luang bareng orang lain jadi nggak krik-krik. Ngobrol,
 * kuis, dan latihan mendengar cuma cara menepatinya — makanya pilar "bermain,
 * belajar, seru-seruan bareng" yang dijual, bukan daftar fiturnya.
 *
 * Tumpukan kartunya bukan hiasan — tanpa itu halaman ini cuma teks, dan
 * pengunjung tidak punya bayangan apa yang mereka dapat. Tiga kartunya
 * sengaja mewakili tiga cara main: ngobrol, latihan mendengar, dan kuis.
 * Dua dikutip apa adanya dari deck bawaan; yang berlabel "Bikinan AI" contoh
 * keluaran fitur generate.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-10 pb-14 md:pt-20 md:pb-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50" />
      <div className="absolute -top-10 right-0 -z-10 size-72 rounded-full bg-pink-200 opacity-40 blur-3xl" />
      <div className="absolute bottom-0 -left-10 -z-10 size-72 rounded-full bg-rose-200 opacity-40 blur-3xl" />

      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1.15fr_1fr] md:gap-10">
        <div className="space-y-5 text-center md:space-y-6 md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-1.5 text-sm backdrop-blur">
            <Sparkles className="size-3.5 text-pink-600" />
            <span className="text-neutral-700">
              Bermain · Belajar · Seru-seruan bareng
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Waktu Luang Bareng,{" "}
            {/* U+2011 (non-breaking hyphen) di "Krik‑Krik" — hyphen biasa
                jadi titik putus yang sah buat perata baris, dan itu bikin
                kata ini pernah kepotong "Krik-" / "Krik" di layar sempit. */}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Nggak Krik‑Krik Lagi
            </span>
          </h1>

          <p className="text-base leading-relaxed text-neutral-600 sm:text-lg">
            Ambil satu kartu: ngobrol, adu kuis, atau latihan mendengar. Nggak
            nemu yang pas?{" "}
            <strong className="font-semibold text-neutral-800">
              Bikin sendiri pakai AI
            </strong>
            .
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <PrimaryCta href="/coba">Coba gratis — tanpa daftar</PrimaryCta>
            <Link
              to="/login"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "h-12 rounded-full px-8 text-base",
              })}
            >
              Sudah punya akun
            </Link>
          </div>

          <p className="text-sm text-neutral-500">
            Daftar gratis dapat {AI_GENERATION_LIMIT} deck AI
          </p>
        </div>

        <HeroCardStack />
      </div>
    </section>
  );
}
