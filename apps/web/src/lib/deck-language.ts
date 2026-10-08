import { DECK_LANGUAGES, type DeckLanguage } from "@flipcard/types";

export const DEFAULT_DECK_LANGUAGE: DeckLanguage = "id";

/**
 * Deck dari sebelum kolom `language` ada, atau nilai yang tidak dikenal,
 * dibaca sebagai deck berbahasa Indonesia.
 */
export function resolveDeckLanguage(value: unknown): DeckLanguage {
  return typeof value === "string" &&
    (DECK_LANGUAGES as readonly string[]).includes(value)
    ? (value as DeckLanguage)
    : DEFAULT_DECK_LANGUAGE;
}
