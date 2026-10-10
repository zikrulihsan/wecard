import type { DeckLanguage, DeckMode, DeckTheme, GameCard } from "@flipcard/types";
import { createClient } from "@/lib/supabase/client";
import { toGameCards, type CardRow } from "@/lib/cards/to-game-cards";
import { resolveDeckTheme } from "@/lib/deck-theme";
import { resolveDeckMode } from "@/lib/deck-mode";
import { resolveDeckLanguage } from "@/lib/deck-language";

/**
 * Link main (`/main/<token>`): deck custom yang dibagikan pemiliknya dan bisa
 * dimainkan siapa pun tanpa akun. Semua akses pemain lewat fungsi database
 * (migration 00009) yang memeriksa link masih menyala — kartu deck custom
 * tidak terbaca lewat RLS biasa oleh orang lain.
 */

export type SharedDeck = {
  id: string;
  name: string;
  description: string | null;
  theme: DeckTheme;
  mode: DeckMode;
  language: DeckLanguage;
  cards: GameCard[];
};

export type ScoreRow = { name: string; correct: number; total: number };

export type DeckShare = { token: string; enabled: boolean };

export function sharePath(token: string) {
  return `/main/${token}`;
}

export function shareUrl(token: string) {
  return `${window.location.origin}${sharePath(token)}`;
}

/** Deck di balik link, atau null kalau link tidak dikenal / sudah dimatikan. */
export async function fetchSharedDeck(token: string): Promise<SharedDeck | null> {
  const { data, error } = await createClient().rpc("get_shared_deck", { p_token: token });
  if (error) throw error;
  if (!data) return null;
  const raw = data as {
    id: string;
    name: string;
    description: string | null;
    theme: unknown;
    mode: unknown;
    language: unknown;
    cards: CardRow[];
  };
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    theme: resolveDeckTheme(raw.theme),
    mode: resolveDeckMode(raw.mode),
    language: resolveDeckLanguage(raw.language),
    cards: toGameCards(raw.cards ?? []),
  };
}

export async function recordSharedPlay(token: string, name: string, correct: number, total: number) {
  const { error } = await createClient().rpc("record_shared_play", {
    p_token: token,
    p_name: name,
    p_correct: correct,
    p_total: total,
  });
  if (error) throw error;
}

export async function fetchScoreboard(token: string): Promise<ScoreRow[]> {
  const { data, error } = await createClient().rpc("get_shared_scoreboard", { p_token: token });
  if (error) throw error;
  return ((data ?? []) as { player_name: string; correct: number; total: number }[]).map((row) => ({
    name: row.player_name,
    correct: row.correct,
    total: row.total,
  }));
}

// ---------------------------------------------------------------------------
// Sisi pemilik deck
// ---------------------------------------------------------------------------

export async function fetchDeckShare(categoryId: string): Promise<DeckShare | null> {
  const { data, error } = await createClient()
    .from("deck_shares")
    .select("token, enabled")
    .eq("category_id", categoryId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Nyalakan link (dibuat kalau belum ada) atau matikan. */
export async function setDeckShare(categoryId: string, enabled: boolean): Promise<DeckShare> {
  const supabase = createClient();
  const existing = await fetchDeckShare(categoryId);
  if (!existing) {
    const { data, error } = await supabase
      .from("deck_shares")
      .insert({ category_id: categoryId, enabled })
      .select("token, enabled")
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("deck_shares")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("category_id", categoryId)
    .select("token, enabled")
    .single();
  if (error) throw error;
  return data;
}

/** Berapa kali deck ini dimainkan lewat link (terbaca oleh pemiliknya saja). */
export async function countSharedPlays(categoryId: string): Promise<number> {
  const { count, error } = await createClient()
    .from("shared_plays")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);
  if (error) throw error;
  return count ?? 0;
}

/** Catat bahwa akun baru ini datang dari link main. Gagal = diabaikan. */
export async function claimShareReferral(token: string) {
  const { error } = await createClient().rpc("claim_share_referral", { p_token: token });
  if (error) throw error;
}
