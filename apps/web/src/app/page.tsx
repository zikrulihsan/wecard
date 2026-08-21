import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 -z-10" />
        <div className="absolute top-20 right-10 size-72 bg-pink-200 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute bottom-20 left-10 size-72 bg-rose-200 rounded-full blur-3xl opacity-40 -z-10" />

        <div className="max-w-2xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-pink-200 text-sm">
            <span className="text-pink-600">✨</span>
            <span className="text-neutral-700">Balik kartunya, ngobrolnya jalan</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-neutral-900">
            Kartu buat{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
              Ngobrol Bareng
            </span>
          </h1>

          <p className="text-lg text-neutral-600 leading-relaxed">
            Pertanyaan & tantangan buat ngobrol sama teman, keluarga,
            pasangan, atau anak. Satu HP, satu kartu satu giliran — obrolan
            yang biasanya nggak sempat kejadian, jadi kejadian.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
              description="Pertanyaan dari yang ringan sampai yang bikin mikir dan terbuka"
            />
            <FeatureCard
              icon="🎯"
              title="Action Cards"
              description="Tantangan kecil yang langsung dikerjakan — bisa dibikin tanpa pertanyaan sama sekali"
            />
            <FeatureCard
              icon="✨"
              title="Bikin Sendiri"
              description={`Racik deck sesuai situasimu — AI yang nulis kartunya, gratis ${AI_GENERATION_LIMIT} deck per akun`}
            />
          </div>
        </div>
      </section>

      {/* Bikin deck dengan AI — dijelaskan panjang di sini karena ini bagian
          yang paling tidak jelas dari luar: orang perlu tahu fiturnya gratis,
          berjatah, dan hasilnya deck privat, sebelum bikin akun. */}
      <section className="px-6 py-16 bg-gradient-to-b from-white to-pink-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-200 text-sm">
              <span className="text-pink-600">✨</span>
              <span className="text-neutral-700">
                Gratis {AI_GENERATION_LIMIT} deck per akun
              </span>
            </div>
            <h2 className="text-3xl font-bold">Bikin Deck dengan AI</h2>
            <p className="text-neutral-600 leading-relaxed max-w-xl mx-auto">
              Deck bawaan belum pas sama situasimu? Bikin sendiri. Isi
              konteksnya — mau dimainkan sama siapa, nuansanya, seberapa dalam
              boleh masuk — dan AI yang menuliskan kartunya satu per satu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <StepCard
              step="1"
              title="Isi konteksnya"
              description="Pasangan, sahabat, keluarga, anak, atau rekan kerja. Pilih nuansa dan kedalaman, tentukan jumlah section dan kartunya."
            />
            <StepCard
              step="2"
              title="AI nulis kartunya"
              description="Sekitar 20–40 detik. Hasilnya dicek ulang di server, jadi bentuk kartunya selalu benar dan siap dimainkan."
            />
            <StepCard
              step="3"
              title="Langsung main"
              description="Deck-nya masuk ke daftar deck-mu dan bisa dimainkan seperti deck bawaan — dari satu HP, satu kartu satu giliran."
            />
          </div>

          <div className="rounded-2xl border border-pink-200 bg-white p-6 md:p-8">
            <h3 className="font-semibold text-lg mb-4">
              Batasnya: {AI_GENERATION_LIMIT} deck per akun
            </h3>
            <ul className="space-y-3 text-sm text-neutral-600 leading-relaxed">
              <LimitItem>
                Tiap akun dapat <strong>{AI_GENERATION_LIMIT} kali generate</strong>,
                gratis. Jatah ini sekali seumur akun, bukan {AI_GENERATION_LIMIT}{" "}
                per hari — jadi pikirkan dulu konteksnya sebelum menekan tombol.
              </LimitItem>
              <LimitItem>
                Generate yang gagal <strong>tidak memotong jatah</strong>. Yang
                dihitung cuma deck yang benar-benar jadi.
              </LimitItem>
              <LimitItem>
                Sisa jatahmu selalu kelihatan — di halaman utama dan tepat di
                atas tombol generate.
              </LimitItem>
              <LimitItem>
                Deck hasil AI <strong>privat</strong>: cuma kelihatan di akunmu,
                tidak muncul di toko dan tidak dibagikan ke pemain lain.
              </LimitItem>
              <LimitItem>
                Jatah habis bukan berarti decknya hilang — yang sudah jadi tetap
                bisa dimainkan kapan saja.
              </LimitItem>
            </ul>

            <div className="mt-6">
              <Link
                href="/register"
                className={buttonVariants({
                  className: "rounded-full px-6",
                })}
              >
                Bikin akun & coba
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Siap buat obrolan yang beda?
          </h2>
          <p className="text-pink-50 text-lg">
            Deck Pasangan dan Anak & Orang Tua gratis. Main dari satu HP,
            satu kartu satu waktu.
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
        © {new Date().getFullYear()} FlipCard. Made with love.
      </footer>
    </main>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-neutral-200">
      <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white text-sm font-semibold mb-4">
        {step}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function LimitItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="text-pink-500 shrink-0">
        •
      </span>
      <span>{children}</span>
    </li>
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
