import type { SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedCard, NormalizedDeck } from "../src/lib/ai/generate-deck";

/** Baris `cards` untuk satu kartu hasil AI. */
export function cardRow(card: NormalizedCard, sectionId: string, sortOrder: number) {
  return {
    section_id: sectionId,
    card_type: card.cardType,
    difficulty: card.difficulty,
    content_text: card.content,
    special_kind: card.specialKind,
    details: card.details,
    level: card.level,
    // Deck AI milik sendiri — semua kartu terbuka untuk pembuatnya.
    is_free_preview: true,
    sort_order: sortOrder,
    is_ai_generated: true,
  };
}

/**
 * Tulis section dan kartu sebuah deck ke kategori yang sudah ada. Dipakai
 * generate (draf baru) dan generate ulang (isi lama sudah dihapus).
 */
export async function insertDeckContent(
  supabase: SupabaseClient,
  categoryId: string,
  deck: NormalizedDeck,
  /** Pembeda slug section — wajib saat isi lama masih ada (generate ulang). */
  slugSuffix = "",
): Promise<{ step: "sections" | "cards"; error: unknown } | { step: null; cardCount: number }> {
  const { data: sections, error: sectionError } = await supabase
    .from("sections")
    .insert(
      deck.sections.map((section, index) => ({
        category_id: categoryId,
        slug: `${slugify(section.name) || "section"}-${index + 1}${slugSuffix}`,
        name: section.name,
        description: section.description,
        icon: section.icon,
        sort_order: index + 1,
      }))
    )
    .select("id, sort_order");

  if (sectionError || !sections) return { step: "sections", error: sectionError };

  const sectionIdByOrder = new Map(sections.map((s) => [s.sort_order, s.id]));
  const cardRows = deck.sections.flatMap((section, sectionIndex) => {
    const sectionId = sectionIdByOrder.get(sectionIndex + 1);
    if (!sectionId) return [];
    return section.cards.map((card, cardIndex) => cardRow(card, sectionId, cardIndex + 1));
  });

  const { error: cardError } = await supabase.from("cards").insert(cardRows);
  if (cardError) return { step: "cards", error: cardError };
  return { step: null, cardCount: cardRows.length };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function buildSlug(name: string) {
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${slugify(name) || "deck"}-${suffix}`;
}
