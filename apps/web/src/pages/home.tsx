import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { History, Lock, Play, Search, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deckThemeStyle } from "@/lib/deck-theme";
import { useRecentDeckIds } from "@/lib/recent-decks";
import { useGameStore } from "@/stores/game-store";
import { Badge } from "@/components/ui/badge";
import { CardLoader } from "@/components/ui/card-loader";
import { Input } from "@/components/ui/input";
import { LoadError } from "@/components/ui/load-error";
import { cn } from "@/lib/utils";
import { AiDeckCta } from "@/components/app/ai-deck-cta";
import { HomeHeader } from "@/components/app/home-header";

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

type Deck = CategoryRow & { isUnlocked: boolean };

type Filter = "all" | "free" | "mine" | "locked";

const FILTERS: { value: Filter; label: string; matches: (deck: Deck) => boolean }[] = [
  { value: "all", label: "Semua", matches: () => true },
  { value: "free", label: "Gratis", matches: (deck) => deck.is_free },
  { value: "mine", label: "Buatanku", matches: (deck) => deck.is_ai_generated },
  { value: "locked", label: "Terkunci", matches: (deck) => !deck.isUnlocked },
];

export default function HomePage() {
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{
    loading: boolean;
    error: boolean;
    categories: CategoryRow[];
    unlockedIds: Set<string>;
  }>({ loading: true, error: false, categories: [], unlockedIds: new Set() });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

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

  const decks = useMemo<Deck[]>(
    () => state.categories.map((category) => ({
      ...category,
      isUnlocked: category.is_free || state.unlockedIds.has(category.id),
    })),
    [state.categories, state.unlockedIds],
  );

  const recentIds = useRecentDeckIds();
  const recentDecks = recentIds
    .map((id) => decks.find((deck) => deck.id === id))
    .filter((deck): deck is Deck => Boolean(deck?.isUnlocked));

  // Chip filter hanya muncul kalau ada deck yang cocok, supaya tidak ada
  // pilihan yang pasti berujung kosong.
  const filters = FILTERS.filter((item) => item.value === "all" || decks.some(item.matches));
  const activeFilter = filters.find((item) => item.value === filter) ?? FILTERS[0];
  const needle = query.trim().toLocaleLowerCase("id-ID");
  const results = decks.filter((deck) => activeFilter.matches(deck) && (
    !needle ||
    deck.name.toLocaleLowerCase("id-ID").includes(needle) ||
    (deck.description ?? "").toLocaleLowerCase("id-ID").includes(needle)
  ));
  const browsing = !needle && activeFilter.value === "all";
  const mine = results.filter((deck) => deck.is_ai_generated);
  const curated = results.filter((deck) => !deck.is_ai_generated);

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <HomeHeader />
      <ContinueSession />
      {recentDecks.length > 0 && !needle && (
        <section className="mb-8">
          <SectionTitle icon={History}>Terakhir dimainkan</SectionTitle>
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {recentDecks.map((deck) => <RecentDeckTile key={deck.id} deck={deck} />)}
          </div>
        </section>
      )}
      <AiDeckCta />
      {state.loading ? <CardLoader label="Mengambil daftar deck" /> :
        state.error ? <LoadError title="Daftar deck belum bisa dimuat" description="Sambungan ke server bermasalah, jadi deck-mu belum kelihatan. Deck-nya aman — coba lagi sebentar." onRetry={() => { setState((previous) => ({ ...previous, loading: true })); setRetry((value) => value + 1); }} /> :
        decks.length === 0 ? <EmptyState /> : (
          <section>
            <h2 className="text-lg font-semibold mb-3">Jelajahi deck</h2>
            <div className="relative mb-3">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari deck…"
                aria-label="Cari deck"
                className="h-10 rounded-xl pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted">
                  <X className="size-4" />
                </button>
              )}
            </div>
            {filters.length > 1 && (
              <div role="group" aria-label="Saring deck" className="mb-5 flex flex-wrap gap-2">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={activeFilter.value === item.value}
                    onClick={() => setFilter(item.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      activeFilter.value === item.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {results.length === 0 ? (
              <NoResults query={query.trim()} onClear={() => { setQuery(""); setFilter("all"); }} />
            ) : browsing ? (
              <div className="space-y-8">
                {mine.length > 0 && <div>
                  <SectionTitle icon={Sparkles}>Deck buatanmu</SectionTitle>
                  <DeckGrid decks={mine} />
                </div>}
                {curated.length > 0 && <div>
                  {mine.length > 0 && <SectionTitle>Koleksi FlipCard</SectionTitle>}
                  <DeckGrid decks={curated} />
                </div>}
              </div>
            ) : (
              <DeckGrid decks={results} />
            )}
          </section>
        )}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon?: typeof History; children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
      {Icon && <Icon className="size-4" />}
      {children}
    </h3>
  );
}

/**
 * Sesi yang belum selesai disimpan game store di localStorage. Kalau masih ada
 * kartu tersisa, tampilkan jalan pintas balik ke kartu terakhir.
 */
function ContinueSession() {
  const { isActive, deckId, deckName, deckTheme, cards, currentIndex } = useGameStore();
  if (!isActive || !deckId || cards.length === 0 || currentIndex >= cards.length) return null;
  const percent = Math.round((currentIndex / cards.length) * 100);
  return (
    <Link
      to={`/play/${deckId}/session`}
      className={cn(
        "mb-8 flex items-center gap-4 rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg transition-shadow hover:shadow-xl",
        deckThemeStyle(deckTheme).card,
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20">
        <Play className="size-5 fill-current" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-white/75">Lanjutkan main</p>
        <p className="truncate font-semibold">{deckName}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
          </div>
          <span className="shrink-0 text-xs text-white/85">{currentIndex}/{cards.length} kartu</span>
        </div>
      </div>
    </Link>
  );
}

function RecentDeckTile({ deck }: { deck: Deck }) {
  return (
    <Link
      to={`/play/${deck.id}`}
      aria-label={`Mainkan ${deck.name}`}
      className={cn(
        "flex h-24 w-36 shrink-0 snap-start flex-col justify-end rounded-2xl bg-gradient-to-br p-3 text-white shadow-md transition-shadow hover:shadow-lg",
        deckThemeStyle(deck.theme).card,
      )}
    >
      <p className="line-clamp-2 text-sm font-semibold leading-snug">{deck.name}</p>
    </Link>
  );
}

function DeckGrid({ decks }: { decks: Deck[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {decks.map((deck) => <DeckTile key={deck.id} deck={deck} />)}
    </div>
  );
}

function DeckTile({ deck }: { deck: Deck }) {
  const badge = "bg-white/20 text-white border-0";
  return (
    <Link
      to={deck.isUnlocked ? `/play/${deck.id}` : "/store"}
      aria-label={deck.isUnlocked ? `Mainkan ${deck.name}` : `Beli ${deck.name}`}
      className={cn(
        "relative flex min-h-40 flex-col rounded-2xl bg-gradient-to-br p-4 text-white shadow-md transition-shadow hover:shadow-xl",
        deckThemeStyle(deck.theme).card,
      )}
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {deck.is_ai_generated && <Badge variant="secondary" className={cn(badge, "gap-1")}><Sparkles className="size-3" />AI</Badge>}
        {deck.is_free ? <Badge variant="secondary" className={badge}>Gratis</Badge> :
          deck.isUnlocked ? <Badge variant="secondary" className={badge}>Terbuka</Badge> :
          <Badge variant="secondary" className={cn(badge, "gap-1")}><Lock className="size-3" />Terkunci</Badge>}
      </div>
      <h4 className="text-base font-bold leading-snug">{deck.name}</h4>
      {deck.description && <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-white/85">{deck.description}</p>}
      {!deck.isUnlocked && deck.price_idr && <p className="mt-auto pt-3 text-sm font-medium">Rp {deck.price_idr.toLocaleString("id-ID")}</p>}
    </Link>
  );
}

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 py-10 px-6 text-center space-y-3">
      <p className="text-muted-foreground">
        {query ? <>Belum ada deck yang cocok dengan “{query}”.</> : "Belum ada deck di pilihan ini."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={onClear} className="underline">Tampilkan semua deck</button>
        <Link to="/create" className="underline">Bikin sendiri pakai AI</Link>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-muted-foreground space-y-3">
      <p>Belum ada kategori yang tersedia.</p>
      <Link to="/create" className="inline-block underline">
        Bikin deck sendiri pakai AI
      </Link>
    </div>
  );
}
