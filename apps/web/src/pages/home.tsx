import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deckThemeStyle } from "@/lib/deck-theme";
import { Badge } from "@/components/ui/badge";
import { CardLoader } from "@/components/ui/card-loader";
import { LoadError } from "@/components/ui/load-error";
import { cn } from "@/lib/utils";
import { AiDeckCta } from "@/components/app/ai-deck-cta";
import { HomeHeader } from "@/components/app/home-header";
import { useT } from "@/lib/i18n";

export default function HomePage() {
  const t = useT();
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{
    loading: boolean;
    error: boolean;
    categories: CategoryRow[];
    unlockedIds: Set<string>;
  }>({ loading: true, error: false, categories: [], unlockedIds: new Set() });

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    Promise.all([
      supabase.from("categories")
        .select("id, slug, name, description, is_free, price_idr, is_ai_generated, theme")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .order("sort_order", { ascending: true }),
      supabase.from("purchases").select("category_id").eq("status", "completed"),
    ]).then(([categoryResult, purchaseResult]) => {
      if (!active) return;
      if (categoryResult.error) {
        console.error("[home] gagal membaca categories", categoryResult.error);
        setState({ loading: false, error: true, categories: [], unlockedIds: new Set() });
        return;
      }
      if (purchaseResult.error) console.error("[home] gagal membaca purchases", purchaseResult.error);
      setState({
        loading: false,
        error: false,
        categories: categoryResult.data ?? [],
        unlockedIds: new Set(purchaseResult.data?.map((item) => item.category_id) ?? []),
      });
    }).catch((error) => {
      if (active) {
        console.error("[home] gagal memuat", error);
        setState({ loading: false, error: true, categories: [], unlockedIds: new Set() });
      }
    });
    return () => { active = false; };
  }, [retry]);

  const curated = state.categories.filter((category) => !category.is_ai_generated);
  const aiDecks = state.categories.filter((category) => category.is_ai_generated);

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <HomeHeader />
      <AiDeckCta />
      {state.loading ? <CardLoader label={t.home.loading} /> :
        state.error ? <LoadError title={t.home.errorTitle} description={t.home.errorDescription} onRetry={() => { setState((previous) => ({ ...previous, loading: true })); setRetry((value) => value + 1); }} /> :
        state.categories.length === 0 ? <EmptyState /> : (
          <div className="space-y-8">
            <DeckGrid categories={curated} unlockedIds={state.unlockedIds} />
            {aiDecks.length > 0 && <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5"><Sparkles className="size-4" />{t.home.yourDecks}</h2>
              <DeckGrid categories={aiDecks} unlockedIds={state.unlockedIds} />
            </section>}
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
  const t = useT();
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
            {t.home.free}
          </Badge>
        ) : isUnlocked ? (
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            {t.home.unlocked}
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-white/20 text-white border-0 gap-1">
            <Lock className="size-3" />
            {t.home.locked}
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
      <Link to={`/play/${id}`} className="block" aria-label={t.home.play(name)}>
        {content}
      </Link>
    );
  }

  return (
    <Link to="/store" className="block" aria-label={t.home.buy(name)}>
      {content}
    </Link>
  );
}

function EmptyState() {
  const t = useT();
  return (
    <div className="text-center py-16 text-muted-foreground space-y-3">
      <p>{t.home.empty}</p>
      <Link to="/create" className="inline-block underline">
        {t.home.emptyCta}
      </Link>
    </div>
  );
}
