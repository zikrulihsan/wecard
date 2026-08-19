import type { CSSProperties } from "react";
import { DECK_THEMES, type DeckTheme } from "@flipcard/types";

export type DeckThemeStyle = {
  /** Dipakai di prompt generate supaya model bisa memilih tema yang pas. */
  mood: string;
  /**
   * Warna untuk variabel CSS `--primary`. Dipasang di elemen pembungkus lewat
   * `deckThemeVars()`, jadi semua tombol dan kontrol shadcn di dalamnya ikut
   * warna deck tanpa perlu di-override satu per satu. Kecerahannya dijaga di
   * sekitar L 0.55 supaya teks putih di atas tombol tetap terbaca.
   */
  primary: string;
  /** Gradien kartu deck di beranda dan tombol utama deck. */
  card: string;
  /** Latar layar main. */
  play: string;
  /** Latar layar selesai. */
  finish: string;
};

/**
 * Kelas Tailwind ditulis utuh (bukan disusun dari potongan string) karena
 * Tailwind memindai teks sumber — nama kelas hasil rangkaian runtime tidak
 * akan ikut ter-generate.
 */
export const DECK_THEME_STYLES: Record<DeckTheme, DeckThemeStyle> = {
  pink: {
    mood: "hangat dan romantis — pas untuk pasangan",
    primary: "oklch(0.55 0.2 340)",
    card: "from-pink-500 to-rose-500",
    play: "from-neutral-50 via-pink-50/40 to-rose-50/40",
    finish: "from-pink-50 via-rose-50 to-orange-50",
  },
  amber: {
    mood: "ceria dan santai — pas untuk sahabat atau deck yang kocak",
    primary: "oklch(0.56 0.14 55)",
    card: "from-amber-500 to-orange-500",
    play: "from-neutral-50 via-amber-50/40 to-orange-50/40",
    finish: "from-amber-50 via-orange-50 to-yellow-50",
  },
  emerald: {
    mood: "hangat dan membumi — pas untuk keluarga",
    primary: "oklch(0.55 0.12 165)",
    card: "from-emerald-500 to-teal-500",
    play: "from-neutral-50 via-emerald-50/40 to-teal-50/40",
    finish: "from-emerald-50 via-teal-50 to-lime-50",
  },
  sky: {
    mood: "ringan dan ramah anak",
    primary: "oklch(0.55 0.15 245)",
    card: "from-sky-500 to-blue-500",
    play: "from-neutral-50 via-sky-50/40 to-blue-50/40",
    finish: "from-sky-50 via-blue-50 to-cyan-50",
  },
  indigo: {
    mood: "tenang dan rapi — pas untuk rekan kerja atau tim",
    primary: "oklch(0.53 0.19 275)",
    card: "from-indigo-500 to-violet-500",
    play: "from-neutral-50 via-indigo-50/40 to-violet-50/40",
    finish: "from-indigo-50 via-violet-50 to-blue-50",
  },
  violet: {
    mood: "penasaran dan main-main — pas untuk kenalan baru",
    primary: "oklch(0.56 0.22 300)",
    card: "from-violet-500 to-fuchsia-500",
    play: "from-neutral-50 via-violet-50/40 to-fuchsia-50/40",
    finish: "from-violet-50 via-fuchsia-50 to-pink-50",
  },
  teal: {
    mood: "segar dan berenergi — pas untuk deck tantangan atau gerak badan",
    primary: "oklch(0.55 0.11 195)",
    card: "from-teal-500 to-cyan-500",
    play: "from-neutral-50 via-teal-50/40 to-cyan-50/40",
    finish: "from-teal-50 via-cyan-50 to-sky-50",
  },
  slate: {
    mood: "kalem dan netral — pas untuk deck reflektif atau serius",
    primary: "oklch(0.45 0.03 260)",
    card: "from-slate-600 to-neutral-700",
    play: "from-neutral-50 via-slate-100/40 to-neutral-100/40",
    finish: "from-slate-50 via-neutral-50 to-stone-50",
  },
};

export const DEFAULT_DECK_THEME: DeckTheme = "pink";

/** Tema bawaan tiap audiens, dipakai kalau model tidak memilih tema. */
const THEME_BY_AUDIENCE: Record<string, DeckTheme> = {
  pasangan: "pink",
  sahabat: "amber",
  keluarga: "emerald",
  "anak-orang-tua": "sky",
  "rekan-kerja": "indigo",
  "kenalan-baru": "violet",
  lainnya: "slate",
};

export function isDeckTheme(value: unknown): value is DeckTheme {
  return (
    typeof value === "string" && (DECK_THEMES as readonly string[]).includes(value)
  );
}

/**
 * Deck lama (sebelum kolom theme ada) dan nilai yang tidak dikenal tetap
 * tampil wajar, bukan tanpa warna.
 */
export function resolveDeckTheme(value: unknown): DeckTheme {
  return isDeckTheme(value) ? value : DEFAULT_DECK_THEME;
}

export function deckThemeStyle(value: unknown): DeckThemeStyle {
  return DECK_THEME_STYLES[resolveDeckTheme(value)];
}

export function themeForAudience(audience: string): DeckTheme {
  return THEME_BY_AUDIENCE[audience] ?? DEFAULT_DECK_THEME;
}

/**
 * Variabel CSS yang dipasang di elemen pembungkus layar bertema. Menimpa
 * `--primary` dari globals.css untuk subtree itu saja.
 */
export function deckThemeVars(value: unknown): CSSProperties {
  return {
    "--primary": deckThemeStyle(value).primary,
  } as CSSProperties;
}
