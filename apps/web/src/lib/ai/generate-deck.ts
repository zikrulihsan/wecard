import type {
  CardDetails,
  CardDifficulty,
  CardLevel,
  CardType,
  DeckTheme,
  SpecialCardKind,
} from "@flipcard/types";
import {
  difficultyForLevel,
  hasAnswerSide,
  parseCardDetails,
  toCardLevel,
} from "@/lib/cards/formats";
import { isDeckTheme, themeForAudience } from "@/lib/deck-theme";
import {
  isKnowledgeMix,
  type GeneratedDeck,
  type GenerateDeckInput,
} from "./deck-schema";
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

/** Kartu yang siap disimpan: field khas kuis sudah dirapikan ke `details`. */
export type NormalizedCard = {
  content: string;
  cardType: CardType;
  difficulty: CardDifficulty;
  specialKind: SpecialCardKind | null;
  level: CardLevel | null;
  details: CardDetails | null;
};

/** Deck yang siap disimpan: tema sudah pasti terisi dan valid. */
export type NormalizedDeck = Omit<GeneratedDeck, "theme" | "sections"> & {
  theme: DeckTheme;
  sections: (Omit<GeneratedDeck["sections"][number], "cards"> & {
    cards: NormalizedCard[];
  })[];
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
export function normalizeDeck(
  deck: GeneratedDeck,
  input: GenerateDeckInput
): NormalizedDeck {
  const knowledge = isKnowledgeMix(input.cardMix);

  const sections = deck.sections.slice(0, input.sectionCount).map((section) => ({
    ...section,
    cards: section.cards
      .slice(0, input.cardsPerSection)
      .filter((card) => card.content.trim().length > 0)
      // Deck kuis hanya berisi kartu berjawaban, deck obrolan sebaliknya —
      // model kadang menyelipkan tipe yang tidak diminta.
      .filter((card) => hasAnswerSide(card.cardType) === knowledge)
      .flatMap((card): NormalizedCard[] => {
        const answerCard = hasAnswerSide(card.cardType);
        const details = parseCardDetails(card.cardType, card);
        // Kartu kuis yang isinya tidak lengkap (pilihan ganda tanpa pilihan,
        // dst.) tidak bisa dimainkan — buang.
        if (answerCard && !details) return [];
        const level = answerCard ? (toCardLevel(card.level) ?? 3) : null;
        return [
          {
            content: card.content.trim(),
            cardType: card.cardType,
            difficulty: level ? difficultyForLevel(level) : card.difficulty,
            specialKind: card.cardType === "special" ? card.specialKind : null,
            level,
            details,
          },
        ];
      })
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
