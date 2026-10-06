import { DECK_MODES, type DeckMode } from "@flipcard/types";

/**
 * Jenis deck: cara memainkannya, terpisah dari topiknya. Dipakai beranda
 * (tab per jenis) dan form generate (langkah pertama).
 */
export const DECK_MODE_META: Record<
  DeckMode,
  { emoji: string; label: string; hint: string }
> = {
  ngobrol: {
    emoji: "💬",
    label: "Ngobrol",
    hint: "Pertanyaan yang dijawab dengan cerita.",
  },
  tantangan: {
    emoji: "🎯",
    label: "Tantangan",
    hint: "Tantangan yang langsung dikerjakan bareng.",
  },
  kuis: {
    emoji: "🧠",
    label: "Kuis",
    hint: "Uji pengetahuan, jawabannya di balik kartu.",
  },
  mendengar: {
    emoji: "👂",
    label: "Mendengar",
    hint: "Satu membacakan, yang lain menjawab.",
  },
};

export const DEFAULT_DECK_MODE: DeckMode = "ngobrol";

export function isDeckMode(value: unknown): value is DeckMode {
  return typeof value === "string" && (DECK_MODES as readonly string[]).includes(value);
}

/**
 * Deck dari sebelum kolom `mode` ada, atau nilai yang tidak dikenal, dibaca
 * sebagai deck ngobrol.
 */
export function resolveDeckMode(value: unknown): DeckMode {
  return isDeckMode(value) ? value : DEFAULT_DECK_MODE;
}
