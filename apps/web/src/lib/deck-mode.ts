import { DECK_MODES, type DeckMode } from "@flipcard/types";

/**
 * Jenis deck: cara memainkannya, terpisah dari topiknya. Dipakai beranda
 * (tab per jenis) dan form generate (langkah pertama). Label dan petunjuknya
 * ada di kamus i18n (`modes`), karena ikut bahasa aplikasi.
 */
export const DECK_MODE_META: Record<DeckMode, { emoji: string }> = {
  ngobrol: { emoji: "💬" },
  tantangan: { emoji: "🎯" },
  kuis: { emoji: "🧠" },
  mendengar: { emoji: "👂" },
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
