import type { GameCard, OpinionStance } from "@flipcard/types";
import { shuffle } from "@/lib/game/shuffle";

/**
 * Undi sisi Agree/Disagree untuk kartu opinion di satu permainan. Undiannya
 * seimbang — separuh kartu Agree, separuh Disagree, urutannya acak — supaya
 * tidak ada yang kebagian sisi yang sama lima kali berturut-turut seperti
 * yang bisa terjadi dengan lempar koin per kartu.
 */
export function assignStances(cards: GameCard[]): GameCard[] {
  const count = cards.filter((card) => card.cardType === "opinion").length;
  if (count === 0) return cards;
  const half = Math.floor(count / 2);
  // Kartu ganjil terakhir ikut diundi, bukan selalu jatuh ke satu sisi.
  const pool: OpinionStance[] = shuffle([
    ...Array<OpinionStance>(half).fill("agree"),
    ...Array<OpinionStance>(half).fill("disagree"),
    ...(count % 2 ? [Math.random() < 0.5 ? "agree" : "disagree"] as OpinionStance[] : []),
  ]);
  let next = 0;
  return cards.map((card) =>
    card.cardType === "opinion" ? { ...card, stance: pool[next++] } : card
  );
}

/** Acak urutan kartu dan undi sisi kartu opinion — dipakai tiap mulai main. */
export function dealCards(cards: GameCard[]): GameCard[] {
  return assignStances(shuffle(cards));
}

/**
 * Sisi untuk kartu yang belum diundi (pratinjau, sesi lama yang tersimpan
 * sebelum undian ada). Diturunkan dari id supaya tetap sama tiap render.
 */
export function stanceOf(card: GameCard): OpinionStance {
  if (card.stance) return card.stance;
  let hash = 0;
  for (const char of card.id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return hash & 1 ? "disagree" : "agree";
}

/**
 * Label sisi dan frasa pembuka, mengikuti bahasa DECK (bukan bahasa
 * aplikasi): deck latihan bahasa Inggris tetap menampilkan "AGREE" dan
 * frasa Inggris walau aplikasinya berbahasa Indonesia.
 */
export const STANCE_COPY: Record<
  "id" | "en",
  Record<OpinionStance, { label: string; phrases: string[] }>
> = {
  en: {
    agree: {
      label: "AGREE",
      phrases: ["I strongly believe that…", "In my view, …, because…", "For example, …"],
    },
    disagree: {
      label: "DISAGREE",
      phrases: ["I don't think so, because…", "I see your point, but…", "On the other hand, …"],
    },
  },
  id: {
    agree: {
      label: "SETUJU",
      phrases: ["Aku setuju, karena…", "Menurutku…, contohnya…", "Coba bayangkan kalau…"],
    },
    disagree: {
      label: "TIDAK SETUJU",
      phrases: ["Aku kurang setuju, karena…", "Masuk akal sih, tapi…", "Di sisi lain, …"],
    },
  },
};
