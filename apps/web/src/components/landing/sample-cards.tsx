import { LandingCardDemo } from "@/components/cards/landing-card-demo";
import { SampleCardCarousel } from "./sample-card-carousel";
import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import { cn } from "@/lib/utils";
import type { DeckTheme } from "@flipcard/types";
import { useT } from "@/lib/i18n";

/**
 * Tiga keluarga format kartu (teksnya di kamus i18n, `landing.samples.groups`),
 * masing-masing dipasangkan dengan pilar yang dijanjikan hero (seru-seruan,
 * bermain, belajar). Tiap ubin memakai gradien tema deck-nya sendiri supaya
 * bagian ini terbaca sebagai kartu, bukan daftar fitur — dan supaya tidak sama
 * rata dengan bagian lain yang berlatar putih. Urutannya sama dengan kamus.
 */
const GROUP_THEMES: DeckTheme[] = ["pink", "indigo", "sky"];

/**
 * Bukti isi. Halaman boleh menjanjikan apa saja soal "kartu yang pas", tapi
 * orang baru percaya setelah membaca kartunya sendiri — jadi kartu asli
 * ditampilkan di sini, bukan diringkas jadi klaim.
 */
export function SampleCards() {
  const samples = useT().landing.samples;
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
            {samples.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {samples.title}
          </h2>
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {samples.groups.map((group, index) => (
            <li
              key={group.title}
              className={cn(
                "flex flex-col rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg",
                DECK_THEME_STYLES[GROUP_THEMES[index]].card
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-4xl leading-none" aria-hidden>
                  {group.emoji}
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                  {group.pillar}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-bold">{group.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/85">
                {group.description}
              </p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {group.formats.map((format) => (
                  <li
                    key={format}
                    className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium ring-1 ring-white/25"
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
          className="mt-16 grid scroll-mt-8 items-center gap-10 rounded-[2rem] bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 px-6 py-10 md:scroll-mt-16 md:grid-cols-[0.8fr_1fr] md:px-12 md:py-12"
        >
          <div className="space-y-3 text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
              {samples.tryEyebrow}
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {samples.tryTitle}
            </h3>
            <p className="leading-relaxed text-neutral-600">
              {samples.tryBody}
            </p>
          </div>

          <LandingCardDemo />
        </div>

        <h3 className="mt-16 text-sm font-semibold uppercase tracking-widest text-neutral-500">
          {samples.moreTitle}
        </h3>

        <SampleCardCarousel />
      </div>
    </section>
  );
}
