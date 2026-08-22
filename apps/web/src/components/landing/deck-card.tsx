import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import type { DeckTheme } from "@flipcard/types";
import { cn } from "@/lib/utils";

/**
 * Kartu contoh untuk halaman marketing — bentuknya sengaja mengikuti kartu
 * asli di layar main: gradien tema deck, label jenis kartu di atas, isi
 * kartu di tengah.
 *
 * Ini satu-satunya cara pengunjung melihat wujud produknya sebelum daftar.
 * Kartu berlabel nama deck bawaan dikutip apa adanya dari `seed.sql`, bukan
 * teks karangan yang lebih bagus dari aslinya; kartu berlabel "Bikinan AI"
 * adalah contoh keluaran fitur generate.
 */
export function DeckCard({
  theme,
  kind,
  deck,
  children,
  className,
}: {
  theme: DeckTheme;
  /** "Talk" atau "Action" — ditulis apa adanya seperti di dalam aplikasi. */
  kind: string;
  /** Nama deck asal kartu ini. */
  deck: string;
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
        <span className="normal-case tracking-normal">{deck}</span>
      </div>
      <p className="text-base font-semibold leading-snug text-balance sm:text-lg">
        {children}
      </p>
    </div>
  );
}
