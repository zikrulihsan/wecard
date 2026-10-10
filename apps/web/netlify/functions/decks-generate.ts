import type { Config } from "@netlify/functions";
import { authenticatedClient } from "../auth";
import { buildSlug, insertDeckContent } from "../deck-content";
import { DAILY_DRAFT_LIMIT } from "../../src/lib/credits";
import { reportError, supabaseError } from "../../src/lib/observability";
import { getAiAccess } from "../../src/lib/ai/access";
import { generateDeckInputSchema, modeForCardMix } from "../../src/lib/ai/deck-schema";
import {
  GenerationFailed,
  GenerationRefused,
  generateDeck,
  resolveProvider,
} from "../../src/lib/ai/generate-deck";

export const config: Config = { path: "/api/decks/generate" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Metode tidak diizinkan", code: "method_not_allowed" }, { status: 405 });
  }
  const auth = await authenticatedClient(request);
  if (!auth) return Response.json({ error: "Belum login", code: "unauthenticated" }, { status: 401 });
  const { supabase, user } = auth;

  // Dicek sedini mungkin: generateDeck() di bawah memanggil LLM dan itu
  // berbiaya, sementara RLS baru menolak jauh setelahnya di tahap insert.
  const access = await getAiAccess(supabase, user.id);

  if (!access.enabled) {
    return Response.json(
      { error: "Fitur bikin deck AI sedang tidak aktif untuk akunmu.", code: "ai_disabled" },
      { status: 403 }
    );
  }

  // Satu draf terbuka per akun: simpan atau buang dulu yang lama.
  if (access.openDraftId) {
    return Response.json(
      { error: "Masih ada draf yang belum disimpan.", code: "draft_open", draftId: access.openDraftId },
      { status: 409 }
    );
  }

  // Draf belum memotong kredit, tapi tetap butuh saldo — supaya generate
  // tidak bisa dipakai tanpa pernah membayar. RLS (has_ai_access()) menutup
  // jalur yang sama di tahap insert.
  if (!access.unlimited && access.balance < 1) {
    return Response.json(
      { error: "Kreditmu habis. Beli paket kredit untuk bikin deck lagi.", code: "no_credits" },
      { status: 402 }
    );
  }

  if (!access.unlimited) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("ai_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "deck")
      .eq("status", "success")
      .gte("created_at", since);
    if (countError) {
      reportError("generate.batas-harian-tidak-terbaca", { userId: user.id, ...supabaseError(countError) });
    } else if ((count ?? 0) >= DAILY_DRAFT_LIMIT) {
      return Response.json(
        { error: `Batas ${DAILY_DRAFT_LIMIT} draf per hari tercapai. Coba lagi besok.`, code: "daily_limit", limit: DAILY_DRAFT_LIMIT },
        { status: 429 }
      );
    }
  }

  const body = await request.json().catch(() => null);
  const parsed = generateDeckInputSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Input tidak valid", code: "invalid_input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;

  let result;
  try {
    result = await generateDeck(input);
  } catch (error) {
    const known =
      error instanceof GenerationRefused || error instanceof GenerationFailed;
    const message = known
      ? error.message
      : "Gagal menghubungi layanan AI. Coba lagi sebentar.";
    const code = known ? error.code : "unreachable";

    // Provider bisa gagal di-resolve (key hilang) — jangan bikin log gagal juga.
    let provider = "unknown";
    let model = "unknown";
    try {
      const resolved = resolveProvider();
      provider = resolved.name;
      model = resolved.model;
    } catch {
      // biarkan "unknown"
    }

    const { error: logError } = await supabase
      .from("ai_generations")
      .insert({
        user_id: user.id,
        input,
        provider,
        model,
        status: "error",
        error_message: message,
        kind: "deck",
      });

    if (logError) {
      reportError("generate.log-gagal-tidak-tersimpan", {
        userId: user.id,
        provider,
        model,
        ...supabaseError(logError),
      });
    }

    reportError("generate.gagal", {
      userId: user.id,
      provider,
      model,
      message,
      cause: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { error: message, code },
      { status: error instanceof GenerationRefused ? 422 : 502 }
    );
  }

  const { deck, usage, provider, model } = result;

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .insert({
      slug: buildSlug(deck.name),
      name: deck.name,
      description: deck.description,
      theme: deck.theme,
      mode: modeForCardMix(input.cardMix),
      language: input.language,
      is_free: true,
      price_idr: null,
      sort_order: 100,
      is_active: true,
      created_by: user.id,
      is_ai_generated: true,
      // Draf: kreditnya baru terpotong saat disimpan (save_deck).
      status: "draft",
    })
    .select("id")
    .single();

  if (categoryError || !category) {
    return saveFailed("category", categoryError);
  }

  const content = await insertDeckContent(supabase, category.id, deck);
  if (content.step) {
    await supabase.from("categories").delete().eq("id", category.id);
    return saveFailed(content.step, content.error);
  }

  // Catatan generate: sumber input untuk generate ulang & ganti kartu, dan
  // bahan metrik biaya AI per deck. Gagal dicatat tidak membatalkan draf.
  const { error: recordError } = await supabase.from("ai_generations").insert({
    user_id: user.id,
    category_id: category.id,
    input,
    provider,
    model,
    input_tokens: usage.inputTokens,
    output_tokens: usage.outputTokens,
    status: "success",
    kind: "deck",
  });

  if (recordError) {
    reportError("generate.log-tidak-tersimpan", {
      userId: user.id,
      categoryId: category.id,
      provider,
      model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      ...supabaseError(recordError),
    });
  }

  return Response.json({
    categoryId: category.id,
    name: deck.name,
    theme: deck.theme,
    sectionCount: deck.sections.length,
    cardCount: content.cardCount,
  });
}

/**
 * Detail error Postgres dimunculkan di luar production supaya masalah skema
 * (migration belum jalan, RLS menolak) langsung kelihatan, bukan tertutup
 * pesan generik.
 */
function saveFailed(step: string, error: unknown) {
  const detail = error as { code?: string; message?: string } | null;

  reportError("generate.simpan-gagal", {
    step,
    code: detail?.code,
    message: detail?.message,
  });

  const isProduction = process.env.NODE_ENV === "production";

  return Response.json(
    {
      error: "Deck berhasil dibuat tapi gagal disimpan.",
      code: "save_failed",
      ...(isProduction
        ? {}
        : {
            step,
            detail: detail?.message,
            code: detail?.code,
            hint:
              detail?.code === "42703" ||
              detail?.code === "22P02" ||
              detail?.code === "PGRST205"
                ? "Ada migration yang belum jalan. Jalankan packages/supabase/migrations/00002_ai_decks.sql, 00004_deck_theme.sql, 00006_card_formats.sql, 00007_deck_mode.sql, 00008_deck_language.sql, dan 00010_credits.sql di SQL Editor Supabase."
                : detail?.code === "42501"
                  ? "Insert ditolak RLS — pastikan policy di migration 00002 sudah terpasang, dan cek saldo kredit: has_ai_access() ikut menolak kalau saldo 0 (migration 00010)."
                  : undefined,
          }),
    },
    { status: 500 }
  );
}
