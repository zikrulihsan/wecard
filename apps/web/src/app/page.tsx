import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Faq } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { SampleCards } from "@/components/landing/sample-cards";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";

/**
 * Halaman marketing.
 *
 * Urutannya mengikuti pertanyaan yang muncul di kepala pengunjung: ini apa
 * (Hero) → kenapa aku butuh dan bagaimana caranya (HowItWorks) → kartunya
 * beneran bagus? (SampleCards) → berapa harganya (Pricing) → tapi bagaimana
 * kalau… (Faq) → ya sudah, coba (CTA).
 *
 * Semua bagiannya statis dan tanpa state, jadi rute ini tetap dirender saat
 * build — halaman pertama yang dilihat orang tidak boleh menunggu server.
 */
export default function LandingPage() {
  return (
    <main className="flex-1">
      <Hero />
      <HowItWorks />
      <SampleCards />
      <Pricing />
      <Faq />

      <section className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-20 text-white">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ngumpul berikutnya, jangan krik-krik lagi
          </h2>
          <p className="text-lg text-pink-50">
            Daftar, pilih deck bawaannya, atau langsung bikin sendiri —{" "}
            {AI_GENERATION_LIMIT} deck AI pertamamu gratis.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className={buttonVariants({
                size: "lg",
                variant: "secondary",
                className: "h-12 rounded-full px-8 text-base",
              })}
            >
              Bikin akun gratis
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} FlipCard. Made with love.
      </footer>
    </main>
  );
}
