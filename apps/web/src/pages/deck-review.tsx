import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import type { CardDetails } from "@flipcard/types";
import { BackLink } from "@/components/nav/back-link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardLoader } from "@/components/ui/card-loader";
import { LoadError } from "@/components/ui/load-error";
import { fetchAiAccessDetails, invalidateAiAccess } from "@/lib/ai/access-client";
import type { AiAccess } from "@/lib/ai/access";
import { CARD_FORMAT_EMOJI, OPTION_LETTERS, isCardType, parseCardDetails } from "@/lib/cards/formats";
import { FREE_CARD_SWAPS, FREE_REGENERATIONS } from "@/lib/credits";
import { deckThemeStyle, resolveDeckTheme } from "@/lib/deck-theme";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";
import type { Messages } from "@/lib/i18n/messages/id";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";

type ReviewCard = {
  id: string;
  content_text: string;
  card_type: string;
  details: unknown;
  level: number | null;
  sort_order: number;
};

type ReviewSection = { id: string; name: string; icon: string | null; cards: ReviewCard[] };

type ReviewDeck = {
  id: string;
  name: string;
  description: string | null;
  theme: string | null;
  status: string;
  revisionRegens: number;
  revisionSwaps: number;
  sections: ReviewSection[];
};

type LoadState = { status: "loading" | "error" | "not-found" | "ready"; forId?: string; deck?: ReviewDeck };

/**
 * Draf hasil generate (dan revisi deck AI yang sudah tersimpan). Di sini
 * pemain melihat semua kartunya, generate ulang seluruh deck atau ganti kartu
 * satu per satu — gratis sampai batas per deck — lalu menyimpan draf dengan
 * 1 kredit. Kredit baru terpotong di tombol simpan (`save_deck`).
 */
export default function DeckReviewPage() {
  const t = useT();
  const navigate = useNavigate();
  const { deckId = "" } = useParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [retry, setRetry] = useState(0);
  const [access, setAccess] = useState<AiAccess | null>(null);
  const [busy, setBusy] = useState<null | "regenerate" | "save" | "discard" | { swap: string }>(null);
  const [message, setMessage] = useState<{ text: string; buy?: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    Promise.all([
      supabase.auth.getSession(),
      supabase.from("categories").select("*").eq("id", deckId).maybeSingle(),
      supabase.from("sections")
        .select("id, name, icon, sort_order, cards:cards(id, content_text, card_type, details, level, sort_order)")
        .eq("category_id", deckId)
        .order("sort_order", { ascending: true }),
    ]).then(([session, category, sections]) => {
      if (!active) return;
      if (category.error || sections.error) {
        console.error("[review] gagal membaca deck", category.error || sections.error);
        setState({ status: "error", forId: deckId });
        return;
      }
      const row = category.data;
      if (!row || !row.is_ai_generated || row.created_by !== session.data.session?.user.id) {
        setState({ status: "not-found", forId: deckId });
        return;
      }
      setState({
        status: "ready",
        forId: deckId,
        deck: {
          id: row.id,
          name: row.name,
          description: row.description,
          theme: row.theme,
          status: row.status ?? "saved",
          revisionRegens: row.revision_regens ?? 0,
          revisionSwaps: row.revision_swaps ?? 0,
          sections: (sections.data ?? []).map((section) => ({
            id: section.id,
            name: section.name,
            icon: section.icon,
            cards: [...(section.cards ?? [])].sort((a, b) => a.sort_order - b.sort_order),
          })),
        },
      });
    }).catch((error) => {
      console.error("[review] gagal memuat", error);
      if (active) setState({ status: "error", forId: deckId });
    });
    fetchAiAccessDetails().then((value) => { if (active) setAccess(value); }).catch(() => {});
    return () => { active = false; };
  }, [deckId, retry]);

  const status = state.forId === deckId ? state.status : "loading";
  if (status === "not-found") return <NotFound />;

  const deck = state.deck;
  const isDraft = deck?.status === "draft";
  const unlimited = access?.unlimited === true;
  const balance = access?.balance ?? 0;
  const regensLeft = deck ? Math.max(FREE_REGENERATIONS - deck.revisionRegens, 0) : 0;
  const swapsLeft = deck ? Math.max(FREE_CARD_SWAPS - deck.revisionSwaps, 0) : 0;

  /** Revisi lewat batas memakai kredit — tanya dulu, atau tolak kalau saldo kosong. */
  function confirmCharge(freeLeft: number): boolean {
    if (freeLeft > 0 || unlimited) return true;
    if (balance < 1) {
      setMessage({ text: t.create.errors.no_credits, buy: true });
      return false;
    }
    return confirm(t.review.chargeConfirm);
  }

  async function revise(body: { kind: "regenerate" } | { kind: "swap"; cardId: string }) {
    const { data: { session } } = await createClient().auth.getSession();
    if (!session) throw new Error("Belum login");
    const response = await fetch("/api/decks/revise", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ categoryId: deckId, ...body }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const code = data.code as keyof Messages["create"]["errors"] | undefined;
      const known = code && code in t.create.errors ? t.create.errors[code] : undefined;
      setMessage({ text: typeof known === "string" ? known : data.error ?? t.review.reviseFailed, buy: code === "no_credits" });
      return null;
    }
    invalidateAiAccess();
    fetchAiAccessDetails().then(setAccess).catch(() => {});
    return data as {
      card?: ReviewCard;
      revision: { regensUsed: number; swapsUsed: number } | null;
    };
  }

  async function onRegenerate() {
    if (!deck || busy) return;
    if (!confirmCharge(regensLeft)) return;
    if (regensLeft > 0 && !confirm(t.review.regenerateConfirm)) return;
    setBusy("regenerate");
    setMessage(null);
    try {
      const result = await revise({ kind: "regenerate" });
      if (result) setRetry((value) => value + 1);
    } catch {
      setMessage({ text: t.create.form.connectionError });
    } finally {
      setBusy(null);
    }
  }

  async function onSwap(cardId: string) {
    if (!deck || busy) return;
    if (!confirmCharge(swapsLeft)) return;
    setBusy({ swap: cardId });
    setMessage(null);
    try {
      const result = await revise({ kind: "swap", cardId });
      if (result?.card) {
        const card = result.card;
        setState((previous) => previous.deck ? {
          ...previous,
          deck: {
            ...previous.deck,
            revisionRegens: result.revision?.regensUsed ?? previous.deck.revisionRegens,
            revisionSwaps: result.revision?.swapsUsed ?? previous.deck.revisionSwaps + 1,
            sections: previous.deck.sections.map((section) => ({
              ...section,
              cards: section.cards.map((item) => item.id === card.id ? card : item),
            })),
          },
        } : previous);
      }
    } catch {
      setMessage({ text: t.create.form.connectionError });
    } finally {
      setBusy(null);
    }
  }

  async function onSave() {
    if (!deck || busy) return;
    setBusy("save");
    setMessage(null);
    const { data, error } = await createClient().rpc("save_deck", { p_category: deck.id });
    setBusy(null);
    const result = data as { ok?: boolean; code?: string } | null;
    if (error || !result?.ok) {
      if (error) console.error("[review] gagal menyimpan", error);
      setMessage(result?.code === "no_credits"
        ? { text: t.review.noCredits, buy: true }
        : { text: t.review.saveFailed });
      return;
    }
    invalidateAiAccess();
    navigate(`/play/${deck.id}`);
  }

  async function onDiscard() {
    if (!deck || busy || !confirm(t.review.discardConfirm)) return;
    setBusy("discard");
    const { error } = await createClient().from("categories").delete().eq("id", deck.id);
    setBusy(null);
    if (error) {
      console.error("[review] gagal membuang draf", error);
      setMessage({ text: t.review.saveFailed });
      return;
    }
    invalidateAiAccess();
    navigate("/create");
  }

  // Nomor urut kartu di seluruh deck, untuk label tombol ganti.
  const cardNumbers = new Map(
    (deck?.sections ?? []).flatMap((section) => section.cards).map((card, index) => [card.id, index + 1]),
  );

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href={isDraft || !deck ? "/home" : `/play/${deck.id}`} />
      {status === "loading" ? <CardLoader label={t.review.loading} /> :
        status === "error" || !deck ? (
          <LoadError title={t.review.errorTitle} onRetry={() => { setState({ status: "loading", forId: deckId }); setRetry((value) => value + 1); }} />
        ) : (
          <>
            <header className="mb-5 space-y-2">
              {isDraft && <Badge variant="secondary">{t.review.draftBadge}</Badge>}
              <p className="text-sm font-medium text-muted-foreground">{isDraft ? t.review.titleDraft : t.review.titleSaved}</p>
              <h1 className={cn("bg-gradient-to-br bg-clip-text text-3xl font-bold text-transparent", deckThemeStyle(resolveDeckTheme(deck.theme)).card)}>
                {deck.name}
              </h1>
              {deck.description && <p className="text-muted-foreground">{deck.description}</p>}
              <p className="text-sm leading-relaxed text-muted-foreground">{isDraft ? t.review.introDraft : t.review.introSaved}</p>
            </header>

            <Card className="mb-6 space-y-3 p-4">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>{t.review.freeRegens(regensLeft, FREE_REGENERATIONS)}</span>
                <span>{t.review.freeSwaps(swapsLeft, FREE_CARD_SWAPS)}</span>
              </div>
              {(regensLeft === 0 || swapsLeft === 0) && !unlimited && (
                <p className="text-xs text-muted-foreground">{t.review.overLimit}</p>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                disabled={busy !== null}
                onClick={onRegenerate}
              >
                {busy === "regenerate" ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {busy === "regenerate" ? t.review.regenerating : t.review.regenerate}
              </Button>
            </Card>

            <div className={cn("space-y-6", busy === "regenerate" && "pointer-events-none opacity-50")}>
              {deck.sections.map((section) => (
                <section key={section.id}>
                  <h2 className="mb-2 flex items-center gap-2 font-semibold">
                    <span className="text-xl">{section.icon}</span>
                    {section.name}
                  </h2>
                  <ol className="space-y-2">
                    {section.cards.map((card) => {
                      const number = cardNumbers.get(card.id) ?? 0;
                      const swapping = typeof busy === "object" && busy?.swap === card.id;
                      const answer = answerPreview(card, t);
                      return (
                        <li key={card.id} className={cn("flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3", swapping && "opacity-60")}>
                          <span aria-hidden className="pt-0.5 text-lg">{isCardType(card.card_type) ? CARD_FORMAT_EMOJI[card.card_type] : "🃏"}</span>
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm leading-relaxed">{card.content_text}</p>
                            {answer && <p className="text-xs text-muted-foreground"><span className="font-medium">{t.review.answer}:</span> {answer}</p>}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="shrink-0 rounded-full"
                            disabled={busy !== null}
                            aria-label={t.review.swapLabel(number)}
                            onClick={() => onSwap(card.id)}
                          >
                            {swapping ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                            {swapping ? t.review.swapping : t.review.swap}
                          </Button>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>

            {/* Menempel di atas bottom nav, seperti tombol mulai di halaman deck. */}
            <div
              className="sticky z-10 -mx-4 mt-6 space-y-2 bg-gradient-to-t from-background from-70% to-transparent px-4 pt-6 pb-3"
              style={{ bottom: "var(--bottom-nav-h)" }}
            >
              {message && (
                <div role="alert" className="space-y-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <p>{message.text}</p>
                  {message.buy && <Link to="/store" className="font-semibold underline">{t.review.buy}</Link>}
                </div>
              )}
              {isDraft ? (
                <>
                  <Button type="button" size="lg" className="w-full rounded-full shadow-lg" disabled={busy !== null} onClick={onSave}>
                    {busy === "save" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    {busy === "save" ? t.review.saving : unlimited ? t.review.saveUnlimited : t.review.save}
                  </Button>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{access && !unlimited ? t.review.balance(balance) : ""}</span>
                    <button type="button" disabled={busy !== null} onClick={onDiscard} className="flex items-center gap-1 text-muted-foreground hover:text-destructive disabled:opacity-50">
                      <Trash2 className="size-3.5" />
                      {t.review.discard}
                    </button>
                  </div>
                </>
              ) : (
                <Link to={`/play/${deck.id}`} className={buttonVariants({ size: "lg", className: "w-full rounded-full shadow-lg" })}>
                  {t.review.backToDeck}
                </Link>
              )}
            </div>
          </>
        )}
    </div>
  );
}

/** Ringkasan jawaban kartu kuis, supaya pembuat bisa memeriksa kebenarannya. */
function answerPreview(card: ReviewCard, t: Messages): string | null {
  if (!isCardType(card.card_type)) return null;
  const details: CardDetails | null = parseCardDetails(card.card_type, card.details);
  if (!details) return null;
  switch (card.card_type) {
    case "quiz":
    case "clue":
      return details.answer ?? null;
    case "multiple_choice":
      return details.options && details.correctIndex !== undefined
        ? `${OPTION_LETTERS[details.correctIndex]}. ${details.options[details.correctIndex]}`
        : null;
    case "true_false":
      return details.isTrue === undefined ? null : details.isTrue ? t.card.fact : t.card.myth;
    case "ordering":
      return details.items?.join(" → ") ?? null;
    case "listening":
      return details.questions?.map((q) => q.answer).join(" · ") ?? null;
    default:
      return null;
  }
}
