import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import type { DeckTheme } from "@flipcard/types";
import { cn } from "@/lib/utils";

/**
 * Kartu contoh untuk halaman marketing — bentuknya sengaja mengikuti kartu
 * asli di layar main: gradien tema deck, label jenis kartu di atas, isi
 * kartu di tengah.
 *
 * Ini satu-satunya cara pengunjung melihat wujud produknya sebelum daftar.
 * Kartu berlabel nama deck bawaan dikutip apa adanya dari file seed atau deck
 * coba (`lib/trial/decks.ts`), bukan teks karangan yang lebih bagus dari
 * aslinya; kartu berlabel "Bikinan AI" adalah contoh keluaran fitur generate.
 *
 * Kartu kuis & mendengar menampilkan bintang level dan penanda bahwa
 * jawabannya ada di balik kartu — dua hal yang membedakannya dari kartu
 * obrolan sekilas pandang.
 */
export function DeckCard({
  theme,
  kind,
  deck,
  level,
  answer,
  children,
  className,
}: {
  theme: DeckTheme;
  /** Label format kartu, ditulis apa adanya seperti di dalam aplikasi. */
  kind: string;
  /** Nama deck asal kartu ini. */
  deck: string;
  /** Bintang 1–5 untuk kartu kuis & mendengar. */
  level?: number;
  /** Tampilkan penanda "jawaban di balik kartu". */
  answer?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-3xl bg-gradient-to-br p-5 text-white shadow-xl",
        DECK_THEME_STYLES[theme].card,
        className
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/75">
        <span>{kind}</span>
        <span aria-hidden>·</span>
        <span className="truncate normal-case tracking-normal">{deck}</span>
        {level ? (
          <span
            className="ml-auto shrink-0 tracking-tight text-white"
            aria-label={`Level ${level} dari 5`}
          >
            {"★".repeat(level)}
            <span className="text-white/35">{"★".repeat(5 - level)}</span>
          </span>
        ) : null}
      </div>
      <p className="text-base font-semibold leading-snug text-balance sm:text-lg">
        {children}
      </p>
      {answer ? (
        <p className="text-[11px] font-medium text-white/80">
          ↻ Jawabannya di balik kartu
        </p>
      ) : null}
    </div>
  );
}
