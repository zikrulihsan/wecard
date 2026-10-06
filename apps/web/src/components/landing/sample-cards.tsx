import { LandingCardDemo } from "@/components/cards/landing-card-demo";
import { SampleCardCarousel } from "./sample-card-carousel";
import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import { cn } from "@/lib/utils";
import type { DeckTheme } from "@flipcard/types";

/**
 * Tiga keluarga format kartu, masing-masing dipasangkan dengan pilar yang
 * dijanjikan hero (seru-seruan, bermain, belajar). Tiap ubin memakai gradien
 * tema deck-nya sendiri supaya bagian ini terbaca sebagai kartu, bukan daftar
 * fitur — dan supaya tidak sama rata dengan bagian lain yang berlatar putih.
 */
const FORMAT_GROUPS = [
  {
    emoji: "💬",
    pillar: "Seru-seruan",
    title: "Ngobrol",
    description: "Pertanyaan dan tantangan kecil. Nggak ada benar-salah.",
    formats: ["Talk", "Action"],
    theme: "pink",
  },
  {
    emoji: "🧠",
    pillar: "Bermain",
    title: "Kuis",
    description: "Jawab, balik kartunya, skor di akhir.",
    formats: ["Tanya jawab", "Pilihan ganda", "Mitos / fakta", "Tebak clue", "Urutkan"],
    theme: "indigo",
  },
  {
    emoji: "👂",
    pillar: "Belajar",
    title: "Mendengar",
    description: "HP membacakan, anak menjawab. Melatih fokus.",
    formats: ["Level ⭐ – ⭐⭐⭐⭐⭐"],
    theme: "sky",
  },
] as const satisfies readonly {
  emoji: string;
  pillar: string;
  title: string;
  description: string;
  formats: readonly string[];
  theme: DeckTheme;
}[];

/**
 * Bukti isi. Halaman boleh menjanjikan apa saja soal "kartu yang pas", tapi
 * orang baru percaya setelah membaca kartunya sendiri — jadi kartu asli
 * ditampilkan di sini, bukan diringkas jadi klaim.
 */
export function SampleCards() {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
            Tiga cara main
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Satu kartu, satu giliran.
          </h2>
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {FORMAT_GROUPS.map((group) => (
            <li
              key={group.title}
              className={cn(
                "flex flex-col rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg",
                DECK_THEME_STYLES[group.theme].card
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
              Coba langsung
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              Ketuk kartunya.
            </h3>
            <p className="leading-relaxed text-neutral-600">
              Ketuk untuk buka, balik lagi untuk lihat jawaban. Geser untuk
              kartu lainnya.
            </p>
          </div>

          <LandingCardDemo />
        </div>

        <h3 className="mt-16 text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Contoh kartu lainnya
        </h3>

        <SampleCardCarousel />
      </div>
    </section>
  );
}
