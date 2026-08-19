// Auto-generated types will go here via `supabase gen types typescript`
// For now, define manually based on our schema

export type CardType = "talk" | "action" | "special";
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

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  theme: DeckTheme;
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
