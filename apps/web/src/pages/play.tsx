import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PencilLine } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { readCache, writeCache } from "@/lib/cache";
import { deckThemeVars, resolveDeckTheme } from "@/lib/deck-theme";
import { BackLink } from "@/components/nav/back-link";
import { CardLoader } from "@/components/ui/card-loader";
import { LoadError } from "@/components/ui/load-error";
import { SectionPicker } from "@/components/app/section-picker";
import { DeckSharePanel } from "@/components/share/deck-share-panel";
import { AddCardForm } from "@/components/premium/add-card-form";
import { GiftDeckPanel } from "@/components/premium/gift-deck-panel";
import { PersonalizePanel, PremiumLockedBanner } from "@/components/premium/premium-banner";
import { fetchPremiumCatalog } from "@/lib/premium";
import NotFound from "@/pages/not-found";
import type { DeckLanguage, DeckTheme } from "@flipcard/types";
import { resolveDeckLanguage } from "@/lib/deck-language";
import { useT } from "@/lib/i18n";

type Deck = {
  id: string;
  name: string;
  description: string | null;
  theme: DeckTheme;
  language: DeckLanguage;
  /** Deck custom milik pemain yang sedang masuk — boleh dibagikan lewat link. */
  isOwn: boolean;
  /** Deck AI yang bisa direvisi pemiliknya di /create/:id. */
  isAi: boolean;
  /** Draf belum disimpan: dimainkan setelah disimpan di halaman review. */
  isDraft: boolean;
  /** Versi pribadi deck premium — tidak boleh dibagikan atau dihadiahkan. */
  isPremiumCopy: boolean;
  /** Volume seri premium (kurasi berbayar), dengan status kepemilikannya. */
  premium: { seriesSlug: string; owned: boolean; cardTotal: number; previewCount: number } | null;
  sections: { id: string; slug: string; name: string; icon: string | null; cardCount: number }[];
};

type State = { status: "loading" | "error" | "not-found" | "ready"; forId?: string; deck?: Deck };

/** Deck yang sudah dibuka di tab ini: balik lagi tampil seketika, lalu disegarkan. */
const deckCacheKey = (deckId: string) => `deck:${deckId}`;

export default function PlayPage() {
  const t = useT();
  const { deckId } = useParams();
  const [state, setState] = useState<State>({ status: "loading" });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!deckId) return;
    let active = true;
    const supabase = createClient();
    Promise.all([
      // `*` supaya deck tetap bisa dibuka meski migration `language` belum jalan.
      supabase.from("categories").select("*").eq("id", deckId).eq("is_active", true).single(),
      supabase.from("sections").select("id, slug, name, icon, sort_order, cards:cards(id, card_type, difficulty)").eq("category_id", deckId).order("sort_order", { ascending: true }),
      supabase.auth.getSession(),
      // Katalog premium hanya untuk deck berbayar; gagal dibaca = dianggap
      // deck biasa (RLS kartu tetap menjaga isi yang terkunci).
      fetchPremiumCatalog().catch(() => []),
    ]).then(([category, sections, session, catalog]) => {
      if (!active) return;
      if (category.error?.code === "PGRST116") { setState({ status: "not-found", forId: deckId }); return; }
      if (category.error || sections.error) {
        console.error("[play] gagal membaca deck", category.error || sections.error);
        setState(fallbackState(deckId));
        return;
      }
      if (!category.data) { setState({ status: "not-found", forId: deckId }); return; }
      const deck: Deck = {
        id: category.data.id,
        name: category.data.name,
        description: category.data.description,
        theme: resolveDeckTheme(category.data.theme),
        language: resolveDeckLanguage(category.data.language),
        isOwn: Boolean(category.data.created_by) && category.data.created_by === session.data.session?.user.id,
        isAi: category.data.is_ai_generated === true,
        isDraft: category.data.status === "draft",
        isPremiumCopy: category.data.premium_copy === true,
        premium: (() => {
          for (const series of catalog) {
            const volume = series.volumes.find((item) => item.id === category.data.id);
            if (volume) return { seriesSlug: series.slug, owned: volume.owned, cardTotal: volume.cardTotal, previewCount: volume.previewCount };
          }
          return null;
        })(),
        sections: (sections.data ?? []).map((section) => ({
          id: section.id, slug: section.slug, name: section.name,
          icon: section.icon, cardCount: section.cards?.length ?? 0,
        })),
      };
      // Draf tidak disimpan: setelah disimpan di halaman review, versi
      // drafnya akan salah mengarahkan balik ke /create.
      if (!deck.isDraft) writeCache(deckCacheKey(deckId), deck);
      setState({ status: "ready", forId: deckId, deck });
    }).catch((error) => {
      if (active) { console.error("[play] gagal memuat", error); setState(fallbackState(deckId)); }
    });
    return () => { active = false; };
  }, [deckId, retry]);

  if (!deckId) return <NotFound />;
  const cached = readCache<Deck>(deckCacheKey(deckId));
  const current: State = state.forId === deckId ? state
    : cached ? { status: "ready", forId: deckId, deck: cached }
    : { status: "loading" };
  const status = current.status;
  if (status === "not-found") return <NotFound />;
  if (status === "ready" && current.deck?.isDraft) return <Navigate to={`/create/${current.deck.id}`} replace />;
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href="/home" />
      {status === "loading" ? <CardLoader label={t.play.loading} /> :
        status === "error" ? <LoadError title={t.play.errorTitle} description={t.play.errorDescription} onRetry={() => { setState({ status: "loading", forId: deckId }); setRetry((value) => value + 1); }} /> :
        current.deck && <div style={deckThemeVars(current.deck.theme)}>
          <header className="mb-6"><h1 className="text-3xl font-bold">{current.deck.name}</h1>{current.deck.description && <p className="text-muted-foreground mt-2">{current.deck.description}</p>}
            {current.deck.isOwn && current.deck.isAi && <Link to={`/create/${current.deck.id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><PencilLine className="size-4" />{t.play.editDeck}</Link>}
          </header>
          {current.deck.premium && !current.deck.premium.owned && (
            <PremiumLockedBanner previewCount={current.deck.premium.previewCount} cardTotal={current.deck.premium.cardTotal} seriesSlug={current.deck.premium.seriesSlug} />
          )}
          {current.deck.premium?.owned && <PersonalizePanel categoryId={current.deck.id} />}
          {current.deck.isOwn && !current.deck.isPremiumCopy && <DeckSharePanel deckId={current.deck.id} deckName={current.deck.name} />}
          {current.deck.isOwn && !current.deck.isAi && (
            <AddCardForm sections={current.deck.sections} onAdded={() => setRetry((value) => value + 1)} />
          )}
          {current.deck.isOwn && !current.deck.isPremiumCopy && <GiftDeckPanel deckId={current.deck.id} deckName={current.deck.name} />}
          <SectionPicker deckId={current.deck.id} deckName={current.deck.name} deckTheme={current.deck.theme} deckLanguage={current.deck.language} sections={current.deck.sections} />
        </div>}
    </div>
  );
}

/** Gagal menyegarkan: tetap tampilkan versi tersimpan kalau ada. */
function fallbackState(deckId: string): State {
  const cached = readCache<Deck>(deckCacheKey(deckId));
  return cached ? { status: "ready", forId: deckId, deck: cached } : { status: "error", forId: deckId };
}
