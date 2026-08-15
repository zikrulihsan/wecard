import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
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
      sections:sections(id)
    `
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Check unlocked categories for the current user
  const { data: purchases } = await supabase
    .from("purchases")
    .select("category_id")
    .eq("status", "completed");

  const unlockedIds = new Set(purchases?.map((p) => p.category_id) ?? []);

  // Deck bawaan (seed) tetap tampil apa adanya; deck AI ditaruh di grup sendiri.
  const curated = categories?.filter((c) => !c.is_ai_generated) ?? [];
  const aiDecks = categories?.filter((c) => c.is_ai_generated) ?? [];

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Pilih Kategori</h1>
        <p className="text-muted-foreground mt-1">
          Mau main kartu apa hari ini?
        </p>
      </header>

      {!categories || categories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          <DeckGrid
            categories={curated}
            unlockedIds={unlockedIds}
          />

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
          slug={category.slug}
          name={category.name}
          description={category.description}
          priceIdr={category.price_idr}
          isFree={category.is_free}
          isUnlocked={category.is_free || unlockedIds.has(category.id)}
          isAiGenerated={category.is_ai_generated}
        />
      ))}
    </div>
  );
}

function CategoryCard({
  id,
  slug,
  name,
  description,
  priceIdr,
  isFree,
  isUnlocked,
  isAiGenerated,
}: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceIdr: number | null;
  isFree: boolean;
  isUnlocked: boolean;
  isAiGenerated: boolean;
}) {
  const content = (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
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
          <p className="text-pink-50 text-sm leading-relaxed line-clamp-2">
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
