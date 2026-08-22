import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LandingCardDemo } from "@/components/cards/landing-card-demo";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 -z-10" />
        <div className="absolute top-20 right-10 size-72 bg-pink-200 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute bottom-20 left-10 size-72 bg-rose-200 rounded-full blur-3xl opacity-40 -z-10" />

        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1fr_22rem] lg:gap-20">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-pink-200 text-sm">
              <span className="text-pink-600">✨</span>
              <span className="text-neutral-700">Ruang Kita untuk Berdua</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-neutral-900">
              Kartu untuk{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                Ngobrol Lebih Dalam
              </span>
            </h1>

            <p className="text-lg text-neutral-600 leading-relaxed">
              50 kartu pertanyaan & tantangan seru untuk pasangan. Dari warm up
              sampai deep talk — mainkan berdua dan rasakan hubungan yang makin
              hangat.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/register"
                className={buttonVariants({ size: "lg", className: "rounded-full px-8" })}
              >
                Mulai Main Gratis
              </Link>
              <Link
                href="/login"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                  className: "rounded-full px-8",
                })}
              >
                Sudah Punya Akun
              </Link>
            </div>
          </div>

          <LandingCardDemo />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Apa yang ada di dalamnya?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="💬"
              title="Talk Cards"
              description="Pertanyaan dari yang ringan sampai yang bikin kamu mikir dan terbuka"
            />
            <FeatureCard
              icon="🎯"
              title="Action Cards"
              description="Tantangan kecil yang bikin momen berdua jadi lebih hidup"
            />
            <FeatureCard
              icon="🔥"
              title="5 Level"
              description="Warm Up, Appreciation, Deep Talk, Intimate, Future & Dreams"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Siap untuk malam obrolan yang berbeda?
          </h2>
          <p className="text-pink-50 text-lg">
            Gratis untuk kategori Pasangan. Main dari HP berdua, satu kartu satu
            waktu.
          </p>
          <Link
            href="/register"
            className={buttonVariants({
              size: "lg",
              variant: "secondary",
              className: "rounded-full px-8",
            })}
          >
            Buat Akun Sekarang
          </Link>
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} WeCard. Made with love.
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl border border-neutral-200 hover:border-pink-200 hover:shadow-lg transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
