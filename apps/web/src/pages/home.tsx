import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { History, Lock, Play, Search, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deckThemeStyle } from "@/lib/deck-theme";
import { DECK_MODE_META, resolveDeckMode } from "@/lib/deck-mode";
import { useRecentDeckIds } from "@/lib/recent-decks";
import { useGameStore } from "@/stores/game-store";
import { Badge } from "@/components/ui/badge";
import { CardLoader } from "@/components/ui/card-loader";
import { Input } from "@/components/ui/input";
import { LoadError } from "@/components/ui/load-error";
import { cn } from "@/lib/utils";
import { DECK_MODES, type DeckMode } from "@flipcard/types";
import { AiDeckCta } from "@/components/app/ai-deck-cta";
import { HomeHeader } from "@/components/app/home-header";
import { LOCALES, useI18n, useT } from "@/lib/i18n";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_free: boolean;
  price_idr: number | null;
  is_ai_generated: boolean;
  theme: string | null;
  mode: string | null;
};

type Deck = Omit<CategoryRow, "mode"> & { mode: DeckMode; isUnlocked: boolean };

type Filter = "all" | "free" | "mine" | "locked";

const FILTERS: { value: Filter; label: "filterAll" | "filterFree" | "filterMine" | "filterLocked"; matches: (deck: Deck) => boolean }[] = [
  { value: "all", label: "filterAll", matches: () => true },
  { value: "free", label: "filterFree", matches: (deck) => deck.is_free },
  { value: "mine", label: "filterMine", matches: (deck) => deck.is_ai_generated },
  { value: "locked", label: "filterLocked", matches: (deck) => !deck.isUnlocked },
];

export default function HomePage() {
  const { t, language } = useI18n();
  const locale = LOCALES[language];
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState<{
    loading: boolean;
    error: boolean;
    categories: CategoryRow[];
    unlockedIds: Set<string>;
  }>({ loading: true, error: false, categories: [], unlockedIds: new Set() });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [modeTab, setModeTab] = useState<DeckMode | "all">("all");

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    Promise.all([
      supabase.from("categories")
        .select("id, slug, name, description, is_free, price_idr, is_ai_generated, theme, mode")
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
      mode: resolveDeckMode(category.mode),
      isUnlocked: category.is_free || state.unlockedIds.has(category.id),
    })),
    [state.categories, state.unlockedIds],
  );

  const recentIds = useRecentDeckIds();
  const recentDecks = recentIds
    .map((id) => decks.find((deck) => deck.id === id))
    .filter((deck): deck is Deck => Boolean(deck?.isUnlocked));

  // Tab jenis hanya untuk jenis yang punya deck; kalau semua deck satu jenis,
  // tab-nya tidak perlu ada.
  const modes = DECK_MODES.filter((mode) => decks.some((deck) => deck.mode === mode));
  const activeMode = modeTab !== "all" && modes.includes(modeTab) ? modeTab : "all";
  const inMode = activeMode === "all" ? decks : decks.filter((deck) => deck.mode === activeMode);

  // Chip filter hanya muncul kalau ada deck yang cocok, supaya tidak ada
  // pilihan yang pasti berujung kosong.
  const filters = FILTERS.filter((item) => item.value === "all" || inMode.some(item.matches));
  const activeFilter = filters.find((item) => item.value === filter) ?? FILTERS[0];
  const needle = query.trim().toLocaleLowerCase(locale);
  const results = inMode.filter((deck) => activeFilter.matches(deck) && (
    !needle ||
    deck.name.toLocaleLowerCase(locale).includes(needle) ||
    (deck.description ?? "").toLocaleLowerCase(locale).includes(needle)
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
          <SectionTitle icon={History}>{t.home.recent}</SectionTitle>
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {recentDecks.map((deck) => <RecentDeckTile key={deck.id} deck={deck} />)}
          </div>
        </section>
      )}
      <AiDeckCta />
      {state.loading ? <CardLoader label={t.home.loading} /> :
        state.error ? <LoadError title={t.home.errorTitle} description={t.home.errorDescription} onRetry={() => { setState((previous) => ({ ...previous, loading: true })); setRetry((value) => value + 1); }} /> :
        decks.length === 0 ? <EmptyState /> : (
          <section>
            <h2 className="text-lg font-semibold mb-3">{t.home.browse}</h2>
            {modes.length > 1 && (
              <div role="tablist" aria-label={t.home.modeTabs} className="-mx-4 mb-3 flex gap-1 overflow-x-auto border-b border-neutral-200 px-4 [scrollbar-width:none]">
                {(["all", ...modes] as const).map((value) => {
                  const selected = activeMode === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setModeTab(value)}
                      className={cn(
                        "-mb-px shrink-0 border-b-2 px-2.5 py-2 text-sm transition-colors",
                        selected ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {value === "all" ? t.home.all : t.modes[value].label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="relative mb-3">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.home.search}
                aria-label={t.home.searchLabel}
                className="h-10 rounded-xl pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label={t.home.clearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted">
                  <X className="size-4" />
                </button>
              )}
            </div>
            {filters.length > 1 && (
              <div role="group" aria-label={t.home.filterGroup} className="mb-5 flex flex-wrap gap-2">
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
                    {t.home[item.label]}
                  </button>
                ))}
              </div>
            )}
            {results.length === 0 ? (
              <NoResults query={query.trim()} onClear={() => { setQuery(""); setFilter("all"); setModeTab("all"); }} />
            ) : browsing ? (
              <div className="space-y-8">
                {mine.length > 0 && <div>
                  <SectionTitle icon={Sparkles}>{t.home.yourDecks}</SectionTitle>
                  <DeckGrid decks={mine} showMode={activeMode === "all"} />
                </div>}
                {curated.length > 0 && <div>
                  {mine.length > 0 && <SectionTitle>{t.home.collection}</SectionTitle>}
                  <DeckGrid decks={curated} showMode={activeMode === "all"} />
                </div>}
              </div>
            ) : (
              <DeckGrid decks={results} showMode={activeMode === "all"} />
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
  const t = useT();
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
        <p className="text-xs font-medium uppercase tracking-wide text-white/75">{t.home.continue}</p>
        <p className="truncate font-semibold">{deckName}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${percent}%` }} />
          </div>
          <span className="shrink-0 text-xs text-white/85">{t.home.continueProgress(currentIndex, cards.length)}</span>
        </div>
      </div>
    </Link>
  );
}

function RecentDeckTile({ deck }: { deck: Deck }) {
  const t = useT();
  return (
    <Link
      to={`/play/${deck.id}`}
      aria-label={t.home.play(deck.name)}
      className={cn(
        "flex h-24 w-36 shrink-0 snap-start flex-col justify-end rounded-2xl bg-gradient-to-br p-3 text-white shadow-md transition-shadow hover:shadow-lg",
        deckThemeStyle(deck.theme).card,
      )}
    >
      <p className="line-clamp-2 text-sm font-semibold leading-snug">{deck.name}</p>
    </Link>
  );
}

function DeckGrid({ decks, showMode }: { decks: Deck[]; showMode: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {decks.map((deck) => <DeckTile key={deck.id} deck={deck} showMode={showMode} />)}
    </div>
  );
}

function DeckTile({ deck, showMode }: { deck: Deck; showMode: boolean }) {
  const { t, language } = useI18n();
  const badge = "bg-white/20 text-white border-0";
  return (
    <Link
      to={deck.isUnlocked ? `/play/${deck.id}` : "/store"}
      aria-label={deck.isUnlocked ? t.home.play(deck.name) : t.home.buy(deck.name)}
      className={cn(
        "relative flex min-h-40 flex-col rounded-2xl bg-gradient-to-br p-4 text-white shadow-md transition-shadow hover:shadow-xl",
        deckThemeStyle(deck.theme).card,
      )}
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {deck.is_ai_generated && <Badge variant="secondary" className={cn(badge, "gap-1")}><Sparkles className="size-3" />AI</Badge>}
        {deck.is_free ? <Badge variant="secondary" className={badge}>{t.home.free}</Badge> :
          deck.isUnlocked ? <Badge variant="secondary" className={badge}>{t.home.unlocked}</Badge> :
          <Badge variant="secondary" className={cn(badge, "gap-1")}><Lock className="size-3" />{t.home.locked}</Badge>}
      </div>
      {showMode && <p className="text-[11px] font-medium uppercase tracking-wide text-white/75">{DECK_MODE_META[deck.mode].emoji} {t.modes[deck.mode].label}</p>}
      <h4 className="text-base font-bold leading-snug">{deck.name}</h4>
      {deck.description && <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-white/85">{deck.description}</p>}
      {!deck.isUnlocked && deck.price_idr && <p className="mt-auto pt-3 text-sm font-medium">Rp {deck.price_idr.toLocaleString(LOCALES[language])}</p>}
    </Link>
  );
}

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  const t = useT();
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 py-10 px-6 text-center space-y-3">
      <p className="text-muted-foreground">
        {query ? t.home.noMatch(query) : t.home.noneInFilter}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <button type="button" onClick={onClear} className="underline">{t.home.showAll}</button>
        <Link to="/create" className="underline">{t.home.makeWithAi}</Link>
      </div>
    </div>
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
