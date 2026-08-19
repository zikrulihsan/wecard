import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionPicker } from "./section-picker";

export const dynamic = "force-dynamic";

// Tautan kembali langsung tampil. Nama deck dan daftar level baru diketahui
// setelah query, jadi cuma dua bagian itu yang punya kerangka. `params` sengaja
// diteruskan sebagai promise supaya halaman ini tidak ikut menunggu.
export default function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <Link
        href="/home"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="size-4" />
        Kembali
      </Link>

      <Suspense fallback={<DeckBodySkeleton />}>
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
  const [{ data: category }, { data: sections }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, description, is_free")
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

  if (!category) {
    notFound();
  }

  const sectionData =
    sections?.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      icon: s.icon,
      cardCount: s.cards?.length ?? 0,
    })) ?? [];

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
        )}
      </header>

      <SectionPicker
        deckId={category.id}
        deckName={category.name}
        sections={sectionData}
      />
    </>
  );
}

function DeckBodySkeleton() {
  return (
    <>
      <header className="mb-6 space-y-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-5 w-full max-w-sm" />
      </header>
      <Skeleton className="h-5 w-24 mb-3" />
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
        ))}
      </div>
      <div className="pt-8">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </>
  );
}
