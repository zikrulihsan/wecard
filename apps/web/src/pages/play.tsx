import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PencilLine } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
        setState({ status: "error", forId: deckId });
        return;
      }
      if (!category.data) { setState({ status: "not-found", forId: deckId }); return; }
      setState({ status: "ready", forId: deckId, deck: {
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
      } });
    }).catch((error) => {
      if (active) { console.error("[play] gagal memuat", error); setState({ status: "error", forId: deckId }); }
    });
    return () => { active = false; };
  }, [deckId, retry]);

  if (!deckId) return <NotFound />;
  const status = state.forId === deckId ? state.status : "loading";
  if (status === "not-found") return <NotFound />;
  if (status === "ready" && state.deck?.isDraft) return <Navigate to={`/create/${state.deck.id}`} replace />;
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href="/home" />
      {status === "loading" ? <CardLoader label={t.play.loading} /> :
        status === "error" ? <LoadError title={t.play.errorTitle} description={t.play.errorDescription} onRetry={() => { setState({ status: "loading", forId: deckId }); setRetry((value) => value + 1); }} /> :
        state.deck && <div style={deckThemeVars(state.deck.theme)}>
          <header className="mb-6"><h1 className="text-3xl font-bold">{state.deck.name}</h1>{state.deck.description && <p className="text-muted-foreground mt-2">{state.deck.description}</p>}
            {state.deck.isOwn && state.deck.isAi && <Link to={`/create/${state.deck.id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><PencilLine className="size-4" />{t.play.editDeck}</Link>}
          </header>
          {state.deck.premium && !state.deck.premium.owned && (
            <PremiumLockedBanner previewCount={state.deck.premium.previewCount} cardTotal={state.deck.premium.cardTotal} seriesSlug={state.deck.premium.seriesSlug} />
          )}
          {state.deck.premium?.owned && <PersonalizePanel categoryId={state.deck.id} />}
          {state.deck.isOwn && !state.deck.isPremiumCopy && <DeckSharePanel deckId={state.deck.id} deckName={state.deck.name} />}
          {state.deck.isOwn && !state.deck.isAi && (
            <AddCardForm sections={state.deck.sections} onAdded={() => setRetry((value) => value + 1)} />
          )}
          {state.deck.isOwn && !state.deck.isPremiumCopy && <GiftDeckPanel deckId={state.deck.id} deckName={state.deck.name} />}
          <SectionPicker deckId={state.deck.id} deckName={state.deck.name} deckTheme={state.deck.theme} deckLanguage={state.deck.language} sections={state.deck.sections} />
        </div>}
    </div>
  );
}
