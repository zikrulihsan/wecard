import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { deckThemeVars, resolveDeckTheme } from "@/lib/deck-theme";
import { BackLink } from "@/components/nav/back-link";
import { CardLoader } from "@/components/ui/card-loader";
import { LoadError } from "@/components/ui/load-error";
import { SectionPicker } from "@/components/app/section-picker";
import NotFound from "@/pages/not-found";
import type { DeckTheme } from "@flipcard/types";
import { useT } from "@/lib/i18n";

type Deck = {
  id: string;
  name: string;
  description: string | null;
  theme: DeckTheme;
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
      supabase.from("categories").select("id, name, description, theme").eq("id", deckId).eq("is_active", true).single(),
      supabase.from("sections").select("id, slug, name, icon, sort_order, cards:cards(id, card_type, difficulty)").eq("category_id", deckId).order("sort_order", { ascending: true }),
    ]).then(([category, sections]) => {
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
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href="/home" />
      {status === "loading" ? <CardLoader label={t.play.loading} /> :
        status === "error" ? <LoadError title={t.play.errorTitle} description={t.play.errorDescription} onRetry={() => { setState({ status: "loading", forId: deckId }); setRetry((value) => value + 1); }} /> :
        state.deck && <div style={deckThemeVars(state.deck.theme)}>
          <header className="mb-6"><h1 className="text-3xl font-bold">{state.deck.name}</h1>{state.deck.description && <p className="text-muted-foreground mt-2">{state.deck.description}</p>}</header>
          <SectionPicker deckId={state.deck.id} deckName={state.deck.name} deckTheme={state.deck.theme} sections={state.deck.sections} />
        </div>}
    </div>
  );
}
