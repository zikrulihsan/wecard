import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { reportError, supabaseError } from "@/lib/observability";
import { deckThemeVars, resolveDeckTheme } from "@/lib/deck-theme";
import { BackLink } from "@/components/nav/back-link";
import { CardLoader } from "@/components/ui/card-loader";
import { LoadError } from "@/components/ui/load-error";
import { SectionPicker } from "./section-picker";

export const dynamic = "force-dynamic";

// Tautan kembali langsung tampil. Nama deck dan daftar level baru diketahui
// setelah query, jadi cuma bagian itu yang punya penanda memuat — bentuknya
// sama persis dengan loading.tsx rute ini. `params` sengaja diteruskan sebagai
// promise supaya halaman ini tidak ikut menunggu.
export default function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href="/home" />

      <Suspense fallback={<CardLoader label="Membuka deck" />}>
        <DeckBody params={params} />
      </Suspense>
    </div>
  );
}

async function DeckBody({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const supabase = await createClient();

  // sections difilter pakai deckId juga, jadi tidak perlu nunggu category.
  const [categoryResult, sectionResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, description, is_free, theme")
      .eq("id", deckId)
      .eq("is_active", true)
      .single(),
    supabase
      .from("sections")
      .select(
        `
      id,
      slug,
      name,
      icon,
      sort_order,
      cards:cards(id, card_type, difficulty)
    `
      )
      .eq("category_id", deckId)
      .order("sort_order", { ascending: true }),
  ]);

  // `.single()` menandai "tidak ada barisnya" dengan kode PGRST116. Kode lain
  // — termasuk jaringan putus — berarti decknya mungkin ada tapi tidak
  // terjangkau, dan menampilkan halaman 404 untuk itu adalah kebohongan yang
  // membuat pemilik deck mengira decknya terhapus.
  if (categoryResult.error && categoryResult.error.code !== "PGRST116") {
    reportError("play.deck.gagal-diambil", {
      deckId,
      ...supabaseError(categoryResult.error),
    });
    return (
      <LoadError
        title="Deck belum bisa dibuka"
        description="Sambungan ke server bermasalah. Deck-nya tidak ke mana-mana — coba lagi sebentar."
      />
    );
  }

  const category = categoryResult.data;

  if (!category) {
    notFound();
  }

  if (sectionResult.error) {
    reportError("play.sections.gagal-diambil", {
      deckId,
      ...supabaseError(sectionResult.error),
    });
    return (
      <LoadError
        title="Isi deck belum bisa dimuat"
        description="Nama decknya terbaca, tapi daftar levelnya gagal diambil. Coba lagi sebentar."
      />
    );
  }

  const sectionData =
    sectionResult.data?.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      icon: s.icon,
      cardCount: s.cards?.length ?? 0,
    })) ?? [];

  const theme = resolveDeckTheme(category.theme);

  return (
    // Warna deck dipasang di pembungkus, jadi kontrol di dalamnya (checkbox,
    // cincin fokus, tombol mulai) ikut warnanya tanpa di-override satu-satu.
    <div style={deckThemeVars(theme)}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
        )}
      </header>

      <SectionPicker
        deckId={category.id}
        deckName={category.name}
        deckTheme={theme}
        sections={sectionData}
      />
    </div>
  );
}
