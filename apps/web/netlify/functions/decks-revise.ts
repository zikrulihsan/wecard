import type { Config } from "@netlify/functions";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { authenticatedClient } from "../auth";
import { insertDeckContent } from "../deck-content";
import { reportError, supabaseError } from "../../src/lib/observability";
import { getAiAccess } from "../../src/lib/ai/access";
import { generateDeckInputSchema } from "../../src/lib/ai/deck-schema";
import {
  GenerationFailed,
  GenerationRefused,
  generateDeck,
  generateReplacementCard,
  resolveProvider,
} from "../../src/lib/ai/generate-deck";
import { FREE_CARD_SWAPS, FREE_REGENERATIONS } from "../../src/lib/credits";
import { isCardType, toCardLevel } from "../../src/lib/cards/formats";

export const config: Config = { path: "/api/decks/revise" };

const bodySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("regenerate"), categoryId: z.string().uuid() }),
  z.object({ kind: z.literal("swap"), categoryId: z.string().uuid(), cardId: z.string().uuid() }),
]);

/**
 * Revisi deck AI milik sendiri, draf maupun yang sudah tersimpan:
 *
 *   regenerate  seluruh isi deck ditulis ulang dari input yang sama
 *   swap        satu kartu diganti kartu baru
 *
 * Jatah gratisnya per deck (FREE_REGENERATIONS / FREE_CARD_SWAPS). Jatah
 * baru dicatat SETELAH revisinya berhasil (`use_revision`), jadi revisi yang
 * gagal di tengah jalan tidak memakan jatah — sama seperti generate.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Metode tidak diizinkan", code: "method_not_allowed" }, { status: 405 });
  }
  const auth = await authenticatedClient(request);
  if (!auth) return Response.json({ error: "Belum login", code: "unauthenticated" }, { status: 401 });
  const { supabase, user } = auth;

  const parsedBody = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) {
    return Response.json({ error: "Input tidak valid", code: "invalid_input" }, { status: 400 });
  }
  const body = parsedBody.data;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, revision_regens, revision_swaps")
    .eq("id", body.categoryId)
    .eq("created_by", user.id)
    .eq("is_ai_generated", true)
    .maybeSingle();
  if (categoryError) {
    reportError("revise.deck-tidak-terbaca", { userId: user.id, ...supabaseError(categoryError) });
    return Response.json({ error: "Deck belum bisa dibaca.", code: "unreachable" }, { status: 502 });
  }
  if (!category) return Response.json({ error: "Deck tidak ditemukan.", code: "not_found" }, { status: 404 });

  // Sebelum LLM dipanggil: kalau jatah gratisnya habis, harus ada kredit.
  const access = await getAiAccess(supabase, user.id);
  if (!access.enabled) {
    return Response.json({ error: "Fitur AI sedang tidak aktif untuk akunmu.", code: "ai_disabled" }, { status: 403 });
  }
  const free = body.kind === "regenerate"
    ? category.revision_regens < FREE_REGENERATIONS
    : category.revision_swaps < FREE_CARD_SWAPS;
  if (!free && !access.unlimited && access.balance < 1) {
    return Response.json(
      { error: "Jatah revisi gratis habis dan kreditmu kosong.", code: "no_credits" },
      { status: 402 }
    );
  }

  // Input generate aslinya — revisi memakai pilihan yang sama.
  const { data: source } = await supabase
    .from("ai_generations")
    .select("input")
    .eq("category_id", category.id)
    .eq("status", "success")
    .eq("kind", "deck")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const input = generateDeckInputSchema.safeParse(source?.input);
  if (!input.success) {
    return Response.json(
      { error: "Deck ini dibuat sebelum fitur revisi ada, jadi belum bisa direvisi.", code: "no_source" },
      { status: 409 }
    );
  }

  try {
    if (body.kind === "regenerate") {
      const { deck, usage, provider, model } = await generateDeck(input.data);

      // Isi baru ditulis dulu, baru isi lama dihapus — kalau penulisan
      // gagal di tengah, deck-nya tidak sampai kosong.
      const { data: oldSections } = await supabase.from("sections").select("id").eq("category_id", category.id);
      const content = await insertDeckContent(supabase, category.id, deck, `-${crypto.randomUUID().slice(0, 6)}`);
      if (content.step) {
        reportError("revise.simpan-gagal", { userId: user.id, step: content.step, ...supabaseError(content.error as Parameters<typeof supabaseError>[0]) });
        return Response.json({ error: "Deck baru gagal disimpan. Deck lamamu aman.", code: "save_failed" }, { status: 500 });
      }
      const oldIds = (oldSections ?? []).map((section) => section.id);
      if (oldIds.length > 0) await supabase.from("sections").delete().in("id", oldIds);
      await supabase.from("categories")
        .update({ name: deck.name, description: deck.description, theme: deck.theme })
        .eq("id", category.id);

      await record(supabase, user.id, category.id, input.data, "regenerate", { provider, model, usage });
      const revision = await recordRevision(supabase, category.id, "regenerate");
      return Response.json({ kind: "regenerate", revision });
    }

    const { data: target } = await supabase
      .from("cards")
      .select("id, card_type, level, section:sections!inner(id, name, description, category_id)")
      .eq("id", body.cardId)
      .maybeSingle();
    const section = Array.isArray(target?.section) ? target.section[0] : target?.section;
    if (!target || !section || section.category_id !== category.id || !isCardType(target.card_type)) {
      return Response.json({ error: "Kartu tidak ditemukan.", code: "not_found" }, { status: 404 });
    }

    const { data: existingRows } = await supabase
      .from("cards")
      .select("content_text, section:sections!inner(category_id)")
      .eq("section.category_id", category.id);

    const { card, usage, provider, model } = await generateReplacementCard(input.data, {
      sectionName: section.name,
      sectionDescription: section.description,
      cardType: target.card_type,
      level: toCardLevel(target.level),
      existing: (existingRows ?? []).map((row) => row.content_text),
    });

    const { data: updated, error: updateError } = await supabase
      .from("cards")
      .update({
        content_text: card.content,
        card_type: card.cardType,
        difficulty: card.difficulty,
        special_kind: card.specialKind,
        details: card.details,
        level: card.level,
      })
      .eq("id", target.id)
      .select("id, content_text, card_type, difficulty, special_kind, details, level, sort_order")
      .single();
    if (updateError || !updated) {
      reportError("revise.kartu-gagal-disimpan", { userId: user.id, ...(updateError ? supabaseError(updateError) : {}) });
      return Response.json({ error: "Kartu baru gagal disimpan.", code: "save_failed" }, { status: 500 });
    }

    await record(supabase, user.id, category.id, input.data, "swap", { provider, model, usage });
    const revision = await recordRevision(supabase, category.id, "swap");
    return Response.json({ kind: "swap", card: updated, revision });
  } catch (error) {
    const known = error instanceof GenerationRefused || error instanceof GenerationFailed;
    const message = known ? error.message : "Gagal menghubungi layanan AI. Coba lagi sebentar.";
    const code = known ? error.code : "unreachable";
    let provider = "unknown";
    let model = "unknown";
    try {
      const resolved = resolveProvider();
      provider = resolved.name;
      model = resolved.model;
    } catch {
      // biarkan "unknown"
    }
    await supabase.from("ai_generations").insert({
      user_id: user.id, category_id: category.id, input: input.data, provider, model,
      status: "error", error_message: message, kind: body.kind,
    });
    reportError("revise.gagal", {
      userId: user.id, kind: body.kind, provider, model, message,
      cause: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: message, code }, { status: error instanceof GenerationRefused ? 422 : 502 });
  }
}

async function record(
  supabase: SupabaseClient,
  userId: string,
  categoryId: string,
  input: unknown,
  kind: "regenerate" | "swap",
  result: { provider: string; model: string; usage: { inputTokens: number; outputTokens: number } },
) {
  const { error } = await supabase.from("ai_generations").insert({
    user_id: userId,
    category_id: categoryId,
    input,
    provider: result.provider,
    model: result.model,
    input_tokens: result.usage.inputTokens,
    output_tokens: result.usage.outputTokens,
    status: "success",
    kind,
  });
  if (error) reportError("revise.log-tidak-tersimpan", { userId, categoryId, kind, ...supabaseError(error) });
}

type Revision = { charged: boolean; regensUsed: number; swapsUsed: number; balance: number };

async function recordRevision(
  supabase: SupabaseClient,
  categoryId: string,
  kind: "regenerate" | "swap",
): Promise<Revision | null> {
  const { data, error } = await supabase.rpc("use_revision", { p_category: categoryId, p_kind: kind });
  const result = data as { ok: boolean; charged?: boolean; regens_used?: number; swaps_used?: number; balance?: number } | null;
  if (error || !result?.ok) {
    // Revisinya sudah terjadi tapi jatahnya tidak tercatat (biasanya dua
    // permintaan bersamaan yang menghabiskan saldo terakhir). Hasilnya tetap
    // diberikan; kejadiannya dicatat supaya bisa dicocokkan.
    reportError("revise.jatah-tidak-tercatat", { categoryId, kind, result, ...(error ? supabaseError(error) : {}) });
    return null;
  }
  return {
    charged: result.charged === true,
    regensUsed: result.regens_used ?? 0,
    swapsUsed: result.swaps_used ?? 0,
    balance: result.balance ?? 0,
  };
}
