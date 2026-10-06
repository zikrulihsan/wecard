// Auto-generated types will go here via `supabase gen types typescript`
// For now, define manually based on our schema

/**
 * Format kartu. talk/action/special adalah kartu obrolan tanpa jawaban;
 * sisanya kartu kuis & latihan yang punya sisi jawaban (lihat CardDetails).
 */
export const CARD_TYPES = [
  "talk",
  "action",
  "special",
  "quiz",
  "multiple_choice",
  "true_false",
  "clue",
  "ordering",
  "listening",
] as const;

export type CardType = (typeof CARD_TYPES)[number];

/** Format yang punya jawaban di balik kartu. */
export const ANSWER_CARD_TYPES = [
  "quiz",
  "multiple_choice",
  "true_false",
  "clue",
  "ordering",
  "listening",
] as const satisfies readonly CardType[];

export type AnswerCardType = (typeof ANSWER_CARD_TYPES)[number];

/** Tingkat kesulitan berbintang untuk kartu kuis & mendengar. */
export type CardLevel = 1 | 2 | 3 | 4 | 5;

export interface ListeningQuestion {
  question: string;
  answer: string;
}

/**
 * Isi khas per format, disimpan di kolom `cards.details` (JSONB). Semua field
 * opsional karena tiap format hanya memakai sebagian:
 *
 * - quiz:            answer
 * - multiple_choice: options, correctIndex
 * - true_false:      isTrue
 * - clue:            clues, answer
 * - ordering:        items (dalam urutan yang BENAR; diacak saat ditampilkan)
 * - listening:       questions (content kartu = teks yang dibacakan)
 *
 * `explanation` boleh ada di format apa pun dan tampil di sisi jawaban.
 * Data dari DB selalu dirapikan lewat parseCardDetails() sebelum dipakai.
 */
export interface CardDetails {
  answer?: string;
  explanation?: string;
  options?: string[];
  correctIndex?: number;
  isTrue?: boolean;
  clues?: string[];
  items?: string[];
  questions?: ListeningQuestion[];
}
export type CardDifficulty = "easy" | "medium" | "hard";
export type SpecialCardKind = "free_pass" | "switch" | "double";
export type PurchaseStatus = "pending" | "completed" | "refunded";

/**
 * Tema warna deck. Nilainya disimpan di kolom `categories.theme`; kelas
 * Tailwind untuk tiap tema ada di apps/web/src/lib/deck-theme.ts. Nilai yang
 * tidak dikenal (misal deck lama atau hasil AI yang meleset) jatuh ke tema
 * bawaan, jadi kolomnya sengaja tidak dikunci CHECK di database.
 */
export const DECK_THEMES = [
  "pink",
  "amber",
  "emerald",
  "sky",
  "indigo",
  "violet",
  "teal",
  "slate",
] as const;

export type DeckTheme = (typeof DECK_THEMES)[number];

/**
 * Jenis deck — cara memainkannya, terpisah dari topiknya. Disimpan di kolom
 * `categories.mode`. Label dan emoji tiap jenis ada di
 * apps/web/src/lib/deck-mode.ts.
 *
 *   ngobrol    pertanyaan untuk dijawab dengan cerita (boleh diselipi tantangan)
 *   tantangan  semua kartu tantangan yang langsung dikerjakan
 *   kuis       kuis pengetahuan dengan jawaban di balik kartu
 *   mendengar  teks dibacakan, lalu pendengar menjawab pertanyaannya
 */
export const DECK_MODES = ["ngobrol", "tantangan", "kuis", "mendengar"] as const;

export type DeckMode = (typeof DECK_MODES)[number];

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  theme: DeckTheme;
  mode: DeckMode;
  is_free: boolean;
  price_idr: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Section {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  icon: string | null;
}

export interface Card {
  id: string;
  section_id: string;
  card_type: CardType;
  difficulty: CardDifficulty;
  content_text: string;
  special_kind: SpecialCardKind | null;
  details: CardDetails | null;
  level: CardLevel | null;
  is_free_preview: boolean;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  category_id: string;
  payment_method: string | null;
  payment_ref: string | null;
  amount_idr: number;
  status: PurchaseStatus;
  purchased_at: string;
}

export interface GameSession {
  id: string;
  user_id: string | null;
  category_id: string;
  cards_total: number;
  cards_viewed: number;
  sections_played: string[];
  started_at: string;
  ended_at: string | null;
  completed: boolean;
}
