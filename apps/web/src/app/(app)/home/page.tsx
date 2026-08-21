import { Suspense } from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deckThemeStyle } from "@/lib/deck-theme";
import { Badge } from "@/components/ui/badge";
import { CardLoader } from "@/components/ui/card-loader";
import { cn } from "@/lib/utils";
import { AiDeckCta, AiDeckCtaPlaceholder } from "./ai-deck-cta";
import { HomeHeader } from "./header";

export const dynamic = "force-dynamic";

// Judul dan sub-judul tidak menunggu apa pun, jadi langsung dirender. Hanya
// daftar deck yang datanya dari Supabase yang dibungkus Suspense — penanda
// memuat cuma muncul di bagian yang memang sedang diambil.
//
// Fallback-nya sengaja sama persis dengan loading.tsx: kerangka rute yang
// ter-prefetch tampil lebih dulu, lalu digantikan render server halaman ini.
// Kalau bentuk keduanya berbeda, satu kali pindah halaman terlihat sebagai dua
// kali pergantian tampilan.
export default function HomePage() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <HomeHeader />

      {/* Punya Suspense sendiri: sisa jatah dibaca dari tabel lain, dan tidak
          ada alasan daftar deck menunggu hasilnya. */}
      <Suspense fallback={<AiDeckCtaPlaceholder />}>
        <AiDeckCta />
      </Suspense>

      <Suspense fallback={<CardLoader label="Mengambil daftar deck" />}>
        <DeckList />
      </Suspense>
    </div>
  );
}

async function DeckList() {
  const supabase = await createClient();

  // Dua query ini tidak saling bergantung — jalankan barengan.
  const [{ data: categories }, { data: purchases }] = await Promise.all([
    supabase
      .from("categories")
      .select(
        `
      id,
      slug,
      name,
      description,
      is_free,
      price_idr,
      is_ai_generated,
      theme
    `
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    // Check unlocked categories for the current user
    supabase.from("purchases").select("category_id").eq("status", "completed"),
  ]);

  if (!categories || categories.length === 0) {
    return <EmptyState />;
  }

  const unlockedIds = new Set(purchases?.map((p) => p.category_id) ?? []);

  // Deck bawaan (seed) tetap tampil apa adanya; deck AI ditaruh di grup sendiri.
  const curated = categories.filter((c) => !c.is_ai_generated);
  const aiDecks = categories.filter((c) => c.is_ai_generated);

  return (
    <div className="space-y-8">
      <DeckGrid categories={curated} unlockedIds={unlockedIds} />

      {aiDecks.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <Sparkles className="size-4" />
            Deck buatanmu
          </h2>
          <DeckGrid categories={aiDecks} unlockedIds={unlockedIds} />
        </section>
      )}
    </div>
  );
}

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_free: boolean;
  price_idr: number | null;
  is_ai_generated: boolean;
  theme: string | null;
};

function DeckGrid({
  categories,
  unlockedIds,
}: {
  categories: CategoryRow[];
  unlockedIds: Set<string>;
}) {
  return (
    <div className="grid gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          id={category.id}
          name={category.name}
          description={category.description}
          priceIdr={category.price_idr}
          isFree={category.is_free}
          isUnlocked={category.is_free || unlockedIds.has(category.id)}
          isAiGenerated={category.is_ai_generated}
          theme={category.theme}
        />
      ))}
    </div>
  );
}

function CategoryCard({
  id,
  name,
  description,
  priceIdr,
  isFree,
  isUnlocked,
  isAiGenerated,
  theme,
}: {
  id: string;
  name: string;
  description: string | null;
  priceIdr: number | null;
  isFree: boolean;
  isUnlocked: boolean;
  isAiGenerated: boolean;
  theme: string | null;
}) {
  const content = (
    <div
      className={cn(
        "relative p-6 rounded-2xl bg-gradient-to-br text-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden",
        deckThemeStyle(theme).card
      )}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        {isAiGenerated && (
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-0 gap-1"
          >
            <Sparkles className="size-3" />
            AI
          </Badge>
        )}
        {isFree ? (
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            Gratis
          </Badge>
        ) : isUnlocked ? (
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            Terbuka
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-white/20 text-white border-0 gap-1">
            <Lock className="size-3" />
            Terkunci
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{name}</h2>
        {description && (
          <p className="text-white/85 text-sm leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
        {!isUnlocked && priceIdr && (
          <p className="text-sm font-medium pt-2">
            Rp {priceIdr.toLocaleString("id-ID")}
          </p>
        )}
      </div>
    </div>
  );

  if (isUnlocked) {
    return (
      <Link href={`/play/${id}`} className="block" aria-label={`Mainkan ${name}`}>
        {content}
      </Link>
    );
  }

  return (
    <Link href="/store" className="block" aria-label={`Beli ${name}`}>
      {content}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-muted-foreground space-y-3">
      <p>Belum ada kategori yang tersedia.</p>
      <Link href="/create" className="inline-block underline">
        Bikin deck sendiri pakai AI
      </Link>
    </div>
  );
}
