import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportError, supabaseError } from "@/lib/observability";
import { getAiAccess } from "@/lib/ai/access";
import { generateDeckInputSchema } from "@/lib/ai/deck-schema";
import {
  GenerationFailed,
  GenerationRefused,
  generateDeck,
  resolveProvider,
} from "@/lib/ai/generate-deck";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  // Dicek sedini mungkin: generateDeck() di bawah memanggil LLM dan itu
  // berbiaya, sementara RLS baru menolak jauh setelahnya di tahap insert.
  const access = await getAiAccess();

  if (!access.enabled) {
    return NextResponse.json(
      { error: "Fitur bikin deck AI sedang tidak aktif untuk akunmu." },
      { status: 403 }
    );
  }

  // Jatah dihitung dari generate yang berhasil saja — lihat getAiAccess().
  // Dua permintaan yang benar-benar bersamaan bisa lolos berdua di sini;
  // yang ketiga tetap ditolak, dan RLS (has_ai_access()) menutup sisanya.
  if (access.remaining <= 0) {
    return NextResponse.json(
      {
        error: `Jatah bikin deck AI kamu sudah habis (${access.limit} deck). Deck yang sudah jadi tetap bisa dimainkan.`,
      },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = generateDeckInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Input tidak valid", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;

  let result;
  try {
    result = await generateDeck(input);
  } catch (error) {
    const message =
      error instanceof GenerationRefused || error instanceof GenerationFailed
        ? error.message
        : "Gagal menghubungi layanan AI. Coba lagi sebentar.";

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
    return NextResponse.json(
      { error: message },
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
      is_free: true,
      price_idr: null,
      sort_order: 100,
      is_active: true,
      created_by: user.id,
      is_ai_generated: true,
    })
    .select("id")
    .single();

  if (categoryError || !category) {
    return saveFailed("category", categoryError);
  }

  const { data: sections, error: sectionError } = await supabase
    .from("sections")
    .insert(
      deck.sections.map((section, index) => ({
        category_id: category.id,
        slug: `${slugify(section.name) || "section"}-${index + 1}`,
        name: section.name,
        description: section.description,
        icon: section.icon,
        sort_order: index + 1,
      }))
    )
    .select("id, sort_order");

  if (sectionError || !sections) {
    await supabase.from("categories").delete().eq("id", category.id);
    return saveFailed("sections", sectionError);
  }

  const sectionIdByOrder = new Map(sections.map((s) => [s.sort_order, s.id]));

  const cardRows = deck.sections.flatMap((section, sectionIndex) => {
    const sectionId = sectionIdByOrder.get(sectionIndex + 1);
    if (!sectionId) return [];
    return section.cards.map((card, cardIndex) => ({
      section_id: sectionId,
      card_type: card.cardType,
      difficulty: card.difficulty,
      content_text: card.content,
      special_kind: card.specialKind,
      // Deck AI milik sendiri — semua kartu terbuka untuk pembuatnya.
      is_free_preview: true,
      sort_order: cardIndex + 1,
      is_ai_generated: true,
    }));
  });

  const { error: cardError } = await supabase.from("cards").insert(cardRows);

  if (cardError) {
    await supabase.from("categories").delete().eq("id", category.id);
    return saveFailed("cards", cardError);
  }

  // Baris inilah yang memotong jatah — `ai_generations` berstatus success
  // adalah satu-satunya hitungan kuota (lihat getAiAccess dan has_ai_access()).
  // Kalau insert-nya gagal, pengguna dapat deck tanpa jatahnya berkurang;
  // begitu paket top-up dijual, itu kebocoran pendapatan yang tidak akan
  // terlihat di mana pun. Deck-nya tidak dibatalkan — pengguna sudah menunggu
  // dan hasilnya sudah benar — tapi kejadiannya harus terekam supaya bisa
  // dicocokkan belakangan.
  const { error: quotaError } = await supabase.from("ai_generations").insert({
    user_id: user.id,
    category_id: category.id,
    input,
    provider,
    model,
    input_tokens: usage.inputTokens,
    output_tokens: usage.outputTokens,
    status: "success",
  });

  if (quotaError) {
    reportError("generate.jatah-tidak-terpotong", {
      userId: user.id,
      categoryId: category.id,
      provider,
      model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      ...supabaseError(quotaError),
    });
  }

  return NextResponse.json({
    categoryId: category.id,
    name: deck.name,
    theme: deck.theme,
    sectionCount: deck.sections.length,
    cardCount: cardRows.length,
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

  return NextResponse.json(
    {
      error: "Deck berhasil dibuat tapi gagal disimpan.",
      ...(isProduction
        ? {}
        : {
            step,
            detail: detail?.message,
            code: detail?.code,
            hint:
              detail?.code === "42703" || detail?.code === "PGRST205"
                ? "Ada migration yang belum jalan. Jalankan packages/supabase/migrations/00002_ai_decks.sql dan 00004_deck_theme.sql di SQL Editor Supabase."
                : detail?.code === "42501"
                  ? "Insert ditolak RLS — pastikan policy di migration 00002 sudah terpasang, dan cek sisa jatah: has_ai_access() ikut menolak kalau kuota generate habis."
                  : undefined,
          }),
    },
    { status: 500 }
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function buildSlug(name: string) {
  const suffix = crypto.randomUUID().slice(0, 8);
  return `${slugify(name) || "deck"}-${suffix}`;
}
