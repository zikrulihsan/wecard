import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SectionPicker } from "./section-picker";

export const dynamic = "force-dynamic";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, slug, name, description, is_free")
    .eq("id", deckId)
    .eq("is_active", true)
    .single();

  if (!category) {
    notFound();
  }

  const { data: sections } = await supabase
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
    .eq("category_id", category.id)
    .order("sort_order", { ascending: true });

  const sectionData =
    sections?.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      icon: s.icon,
      cardCount: s.cards?.length ?? 0,
    })) ?? [];

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <Link
        href="/home"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="size-4" />
        Kembali
      </Link>

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
    </div>
  );
}
