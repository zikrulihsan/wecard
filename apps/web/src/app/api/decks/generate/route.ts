import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

/**
 * Angka ini dikirim ke `claim_ai_generation()`; Postgres yang benar-benar
 * menegakkannya, di dalam satu transaksi berkunci. Kuota tidak lagi dihitung
 * di sini karena tabel `ai_generations` tertutup untuk penulisan dari klien —
 * lihat migration 00004.
 */
const RATE_LIMIT_PER_HOUR = 5;

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
  if (!(await getAiAccess())) {
    return NextResponse.json(
      { error: "Fitur bikin deck AI belum terbuka untuk akunmu." },
      { status: 403 }
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

  // Provider di-resolve lebih dulu supaya nama & model bisa ikut tercatat di
  // baris log saat slot diambil, sebelum satu token pun keluar.
  let provider;
  try {
    provider = resolveProvider();
  } catch (error) {
    console.error("[generate-deck] provider", error);
    return NextResponse.json(
      { error: "Layanan AI belum dikonfigurasi." },
      { status: 500 }
    );
  }

  // Ambil satu slot kuota. Fungsi ini menghitung dan menyisipkan baris log
  // dalam satu transaksi berkunci, jadi request paralel tidak bisa saling
  // membalap — dan karena klien tidak punya hak tulis ke tabelnya, jejak
  // kuota tidak bisa dihapus untuk mereset hitungan.
  const { data: generationId, error: claimError } = await supabase.rpc(
    "claim_ai_generation",
    {
      p_input: input,
      p_provider: provider.name,
      p_model: provider.model,
      p_limit: RATE_LIMIT_PER_HOUR,
    }
  );

  if (claimError) {
    if (claimError.message.includes("rate_limited")) {
      return NextResponse.json(
        {
          error: `Batas generate tercapai (${RATE_LIMIT_PER_HOUR} deck per jam). Coba lagi nanti.`,
        },
        { status: 429 }
      );
    }
    if (claimError.message.includes("ai_not_enabled")) {
      return NextResponse.json(
        { error: "Fitur bikin deck AI belum terbuka untuk akunmu." },
        { status: 403 }
      );
    }

    console.error("[generate-deck] claim", claimError);
    return NextResponse.json(
      { error: "Gagal memulai generate. Coba lagi sebentar." },
      { status: 500 }
    );
  }

  /** Tutup baris log yang sudah diambil, apa pun hasilnya. */
  const finish = (
    status: "success" | "error",
    fields: {
      categoryId?: string;
      inputTokens?: number;
      outputTokens?: number;
      errorMessage?: string;
    } = {}
  ) =>
    supabase.rpc("finish_ai_generation", {
      p_id: generationId,
      p_status: status,
      p_category_id: fields.categoryId ?? null,
      p_input_tokens: fields.inputTokens ?? null,
      p_output_tokens: fields.outputTokens ?? null,
      p_error_message: fields.errorMessage ?? null,
    });

  let result;
  try {
    result = await generateDeck(input, provider);
  } catch (error) {
    const message =
      error instanceof GenerationRefused || error instanceof GenerationFailed
        ? error.message
        : "Gagal menghubungi layanan AI. Coba lagi sebentar.";

    await finish("error", { errorMessage: message });

    console.error("[generate-deck]", error);
    return NextResponse.json(
      { error: message },
      { status: error instanceof GenerationRefused ? 422 : 502 }
    );
  }

  const { deck, usage } = result;

  const saveFailed = async (step: string, error: unknown) => {
    await finish("error", { errorMessage: `gagal menyimpan (${step})` });
    return saveFailedResponse(step, error);
  };

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .insert({
      slug: buildSlug(deck.name),
      name: deck.name,
      description: deck.description,
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

  await finish("success", {
    categoryId: category.id,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
  });

  return NextResponse.json({
    categoryId: category.id,
    name: deck.name,
    sectionCount: deck.sections.length,
    cardCount: cardRows.length,
  });
}

/**
 * Detail error Postgres dimunculkan di luar production supaya masalah skema
 * (migration belum jalan, RLS menolak) langsung kelihatan, bukan tertutup
 * pesan generik.
 */
function saveFailedResponse(step: string, error: unknown) {
  console.error(`[generate-deck] insert ${step}`, error);

  const detail = error as { code?: string; message?: string } | null;
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
                ? "Jalankan packages/supabase/migrations/00002_ai_decks.sql di SQL Editor Supabase."
                : detail?.code === "42501"
                  ? "Insert ditolak RLS — pastikan policy di migration 00002 sudah terpasang."
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
