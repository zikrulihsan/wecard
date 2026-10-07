import { LandingCardDemo } from "@/components/cards/landing-card-demo";
import { SampleCardCarousel } from "./sample-card-carousel";
import { useT } from "@/lib/i18n";

// Tiga keluarga format kartu (teksnya di kamus i18n, `landing.samples.groups`),
// masing-masing dipasangkan dengan pilar yang dijanjikan hero (seru-seruan,
// bermain, belajar). Urutannya sama dengan cara orang biasanya mengenal
// FlipCard: datang untuk ngobrol, lalu tahu bisa dipakai belajar.

/**
 * Bukti isi. Halaman boleh menjanjikan apa saja soal "kartu yang pas", tapi
 * orang baru percaya setelah membaca kartunya sendiri — jadi kartu asli
 * ditampilkan di sini, bukan diringkas jadi klaim.
 */
export function SampleCards() {
  const samples = useT().landing.samples;
  return (
    <section className="bg-neutral-50 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {samples.title}
          </h2>
          <p className="text-lg leading-relaxed text-neutral-600">
            {samples.body}
          </p>
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {samples.groups.map((group) => (
            <li
              key={group.title}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  {group.emoji}
                </span>
                <h3 className="font-semibold">{group.title}</h3>
                <span className="ml-auto rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-700">
                  {group.pillar}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {group.description}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {group.formats.map((format) => (
                  <li
                    key={format}
                    className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700"
                  >
                    {format}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div
          id="coba-kartu"
          className="mt-12 grid scroll-mt-8 items-center gap-10 rounded-[2rem] border border-pink-100 bg-white px-6 py-10 shadow-sm md:scroll-mt-16 md:grid-cols-[0.8fr_1fr] md:px-12 md:py-12"
        >
          <div className="space-y-4 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
              {samples.tryEyebrow}
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {samples.tryTitle}
            </h3>
            <p className="leading-relaxed text-neutral-600">
              {samples.tryBody}
            </p>
            <p className="text-sm text-neutral-500">
              {samples.tryHint}
            </p>
          </div>

          <LandingCardDemo />
        </div>

        <h3 className="mt-16 text-center text-xl font-semibold text-neutral-900">
          {samples.moreTitle}
        </h3>

        <SampleCardCarousel />

        <p className="mt-8 text-center text-sm text-neutral-500">
          {samples.footnote}
        </p>
      </div>
    </section>
  );
}
