import type { CardDifficulty, GameCard, SpecialCardKind } from "@flipcard/types";
import { hasAnswerSide, isCardType, parseCardDetails, toCardLevel } from "./formats";

/** Satu baris kartu dari database, apa pun jalur bacanya. */
export type CardRow = {
  id: string;
  content_text: string;
  card_type: unknown;
  difficulty: unknown;
  special_kind: unknown;
  details: unknown;
  level: unknown;
  section_name: string;
  section_slug: string;
};

/**
 * Baris kartu → kartu siap main. Format yang belum dikenal versi aplikasi
 * ini dilewati, begitu juga kartu kuis yang isinya tidak lengkap — keduanya
 * tidak bisa dimainkan.
 */
export function toGameCards(rows: CardRow[]): GameCard[] {
  return rows.flatMap((row) => {
    if (!isCardType(row.card_type)) return [];
    const cardType = row.card_type;
    const details = parseCardDetails(cardType, row.details);
    if (hasAnswerSide(cardType) && !details) return [];
    return [
      {
        id: row.id,
        content: row.content_text,
        cardType,
        difficulty: row.difficulty as CardDifficulty,
        specialKind: row.special_kind as SpecialCardKind | null,
        details,
        level: toCardLevel(row.level),
        sectionName: row.section_name,
        sectionSlug: row.section_slug,
      },
    ];
  });
}
