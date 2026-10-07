import {
  ANSWER_CARD_TYPES,
  CARD_TYPES,
  type AnswerCardType,
  type CardDetails,
  type CardDifficulty,
  type CardLevel,
  type CardType,
  type ListeningQuestion,
} from "@flipcard/types";

/**
 * Satu tempat untuk semua yang khas per format kartu: emoji, cara membaca
 * `details` dari database, dan apakah kartunya punya sisi jawaban. Label dan
 * petunjuknya ada di kamus i18n (`formats`), karena ikut bahasa aplikasi.
 */

export const CARD_FORMAT_EMOJI: Record<CardType, string> = {
  talk: "💬",
  action: "🎯",
  special: "✨",
  quiz: "🧠",
  multiple_choice: "🔤",
  true_false: "⚖️",
  clue: "🔍",
  ordering: "🔢",
  listening: "👂",
};

export function isCardType(value: unknown): value is CardType {
  return (CARD_TYPES as readonly unknown[]).includes(value);
}

export function hasAnswerSide(type: CardType): type is AnswerCardType {
  return (ANSWER_CARD_TYPES as readonly CardType[]).includes(type);
}

/** Format yang benar/salahnya bisa dinilai aplikasi dari pilihan pemain. */
export function isAutoGraded(type: CardType) {
  return type === "multiple_choice" || type === "true_false";
}

export function toCardLevel(value: unknown): CardLevel | null {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
    ? (value as CardLevel)
    : null;
}

/** Warna sampul kartu masih dipetakan dari difficulty; level ikut dipetakan. */
export function difficultyForLevel(level: CardLevel): CardDifficulty {
  return level <= 2 ? "easy" : level === 3 ? "medium" : "hard";
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function textList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const list = value.map(text).filter((item): item is string => !!item);
  return list.length > 0 ? list : undefined;
}

function questionList(value: unknown): ListeningQuestion[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const list = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const { question, answer } = item as Record<string, unknown>;
      const q = text(question);
      const a = text(answer);
      return q && a ? { question: q, answer: a } : null;
    })
    .filter((item): item is ListeningQuestion => !!item);
  return list.length > 0 ? list : undefined;
}

/**
 * Rapikan `details` mentah (dari DB atau hasil AI) untuk satu format. Hasilnya
 * null kalau isinya tidak cukup untuk memainkan kartu itu — misal pilihan
 * ganda tanpa pilihan — supaya pemanggil bisa membuang kartunya.
 */
export function parseCardDetails(
  type: CardType,
  raw: unknown
): CardDetails | null {
  if (!hasAnswerSide(type)) return null;
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const explanation = text(source.explanation);
  const withExplanation = (details: CardDetails): CardDetails =>
    explanation ? { ...details, explanation } : details;

  switch (type) {
    case "quiz": {
      const answer = text(source.answer);
      return answer ? withExplanation({ answer }) : null;
    }
    case "multiple_choice": {
      const options = textList(source.options)?.slice(0, 6);
      const correctIndex = source.correctIndex;
      if (
        !options ||
        options.length < 2 ||
        typeof correctIndex !== "number" ||
        !Number.isInteger(correctIndex) ||
        correctIndex < 0 ||
        correctIndex >= options.length
      ) {
        return null;
      }
      return withExplanation({ options, correctIndex });
    }
    case "true_false":
      return typeof source.isTrue === "boolean"
        ? withExplanation({ isTrue: source.isTrue })
        : null;
    case "clue": {
      const clues = textList(source.clues)?.slice(0, 5);
      const answer = text(source.answer);
      return clues && answer ? withExplanation({ clues, answer }) : null;
    }
    case "ordering": {
      const items = textList(source.items)?.slice(0, 8);
      return items && items.length >= 2 ? withExplanation({ items }) : null;
    }
    case "listening": {
      const questions = questionList(source.questions)?.slice(0, 5);
      return questions ? withExplanation({ questions }) : null;
    }
  }
}

export const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];
