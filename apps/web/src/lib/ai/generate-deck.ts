import type { DeckTheme } from "@flipcard/types";
import { isDeckTheme, themeForAudience } from "@/lib/deck-theme";
import type { GeneratedDeck, GenerateDeckInput } from "./deck-schema";
import { createAnthropicProvider } from "./providers/anthropic";
import { createGeminiProvider } from "./providers/gemini";
import {
  GenerationFailed,
  type DeckProvider,
  type ProviderName,
} from "./provider";

export {
  GenerationFailed,
  GenerationRefused,
  type ProviderName,
} from "./provider";

/**
 * Pilih provider: `AI_PROVIDER` menang kalau diisi, kalau tidak pakai key
 * mana pun yang tersedia — Gemini lebih dulu.
 */
export function resolveProvider(): DeckProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (explicit === "gemini") return createGeminiProvider();
  if (explicit === "anthropic") return createAnthropicProvider();
  if (explicit) {
    throw new Error(
      `AI_PROVIDER "${explicit}" tidak dikenal. Pakai "gemini" atau "anthropic".`
    );
  }

  if (process.env.GEMINI_API_KEY) return createGeminiProvider();
  if (process.env.ANTHROPIC_API_KEY) return createAnthropicProvider();

  throw new Error(
    "Tidak ada API key AI. Set GEMINI_API_KEY atau ANTHROPIC_API_KEY."
  );
}

/** Deck yang siap disimpan: tema sudah pasti terisi dan valid. */
export type NormalizedDeck = Omit<GeneratedDeck, "theme"> & {
  theme: DeckTheme;
};

export type GenerateResult = {
  deck: NormalizedDeck;
  provider: ProviderName;
  model: string;
  usage: { inputTokens: number; outputTokens: number };
};

export async function generateDeck(
  input: GenerateDeckInput
): Promise<GenerateResult> {
  const provider = resolveProvider();
  const { deck, usage } = await provider.generate(input);

  return {
    deck: normalizeDeck(deck, input),
    provider: provider.name,
    model: provider.model,
    usage,
  };
}

/**
 * Model bisa meleset satu-dua kartu dari jumlah yang diminta, bisa mengisi
 * specialKind di kartu non-special, dan bisa melewatkan tema warna. Rapikan
 * sebelum masuk DB.
 */
function normalizeDeck(
  deck: GeneratedDeck,
  input: GenerateDeckInput
): NormalizedDeck {
  const sections = deck.sections.slice(0, input.sectionCount).map((section) => ({
    ...section,
    cards: section.cards
      .slice(0, input.cardsPerSection)
      .filter((card) => card.content.trim().length > 0)
      .map((card) => ({
        ...card,
        content: card.content.trim(),
        specialKind: card.cardType === "special" ? card.specialKind : null,
      }))
      // Kartu special tanpa specialKind tidak bisa dipakai mesin permainan.
      .filter((card) => card.cardType !== "special" || card.specialKind),
  }));

  const usable = sections.filter((s) => s.cards.length > 0);

  if (usable.length === 0) {
    throw new GenerationFailed("Deck yang dihasilkan kosong. Coba lagi.");
  }

  return {
    ...deck,
    theme: isDeckTheme(deck.theme)
      ? deck.theme
      : themeForAudience(input.audience),
    sections: usable,
  };
}
