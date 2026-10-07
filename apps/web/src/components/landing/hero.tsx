import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
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
  const hero = useT().landing.hero;
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-14 md:pt-20 md:pb-24">
      <LanguageSwitcher className="absolute top-4 right-4 z-10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50" />
      <div className="absolute -top-10 right-0 -z-10 size-72 rounded-full bg-pink-200 opacity-40 blur-3xl" />
      <div className="absolute bottom-0 -left-10 -z-10 size-72 rounded-full bg-rose-200 opacity-40 blur-3xl" />

      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[1.15fr_1fr] md:gap-10">
        <div className="space-y-5 text-center md:space-y-6 md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-1.5 text-sm backdrop-blur">
            <Sparkles className="size-3.5 text-pink-600" />
            <span className="text-neutral-700">{hero.pillars}</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            {hero.titleLead}{" "}
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              {hero.titleAccent}
            </span>
          </h1>

          <p className="text-base leading-relaxed text-neutral-600 sm:text-lg">
            {hero.bodyLead}{" "}
            <strong className="font-semibold text-neutral-800">
              {hero.bodyStrong}
            </strong>
            {hero.bodyEnd}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <PrimaryCta href="/coba">{hero.tryFree}</PrimaryCta>
            <Link
              to="/login"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "h-12 rounded-full px-8 text-base",
              })}
            >
              {hero.haveAccount}
            </Link>
          </div>

          <p className="text-sm text-neutral-500">
            {hero.footnote(AI_GENERATION_LIMIT)}
          </p>
        </div>

        <HeroCardStack />
      </div>
    </section>
  );
}
