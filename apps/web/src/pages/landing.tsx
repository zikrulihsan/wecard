import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { Faq } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { SampleCards } from "@/components/landing/sample-cards";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { useT } from "@/lib/i18n";

/**
 * Halaman marketing.
 *
 * Urutannya mengikuti pertanyaan yang muncul di kepala pengunjung: ini apa
 * (Hero) → kartunya seperti apa? (SampleCards) → kalau deck bawaannya nggak
 * pas? (HowItWorks) → berapa harganya (Pricing) → tapi bagaimana kalau… (Faq)
 * → ya sudah, coba (CTA).
 *
 * Latar tiap bagian sengaja berganti (terang, gelap, hangat, putih, pink) dan
 * judulnya dibuat pendek — halaman ini dibaca sambil lalu di HP.
 *
 * Semua bagiannya statis dan tanpa state, jadi rute ini tetap dirender saat
 * build — halaman pertama yang dilihat orang tidak boleh menunggu server.
 */
export default function LandingPage() {
  const t = useT();
  return (
    <main className="flex-1">
      <Hero />
      <SampleCards />
      <HowItWorks />
      <Pricing />
      <Faq />

      <section className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 px-6 py-20 text-white">
        <div className="absolute -right-16 -top-16 size-72 rotate-12 rounded-[2.5rem] bg-white/10" />
        <div className="absolute -bottom-20 -left-10 size-64 -rotate-12 rounded-[2.5rem] bg-white/10" />
        <div className="relative mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            {t.landing.finalCta.title}
          </h2>
          <p className="text-lg text-pink-50">
            {t.landing.finalCta.body(AI_GENERATION_LIMIT)}
          </p>
          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <Link
              to="/coba"
              className={buttonVariants({
                size: "lg",
                variant: "secondary",
                className: "h-12 rounded-full px-8 text-base",
              })}
            >
              {t.landing.finalCta.tryButton}
            </Link>
            <Link
              to="/register"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/60 px-8 text-base font-semibold text-white transition hover:bg-white/10"
            >
              {t.landing.finalCta.button}
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-neutral-500">
        {t.landing.footer(new Date().getFullYear())}
      </footer>
    </main>
  );
}
