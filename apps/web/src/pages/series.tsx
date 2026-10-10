import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { m } from "framer-motion";
import { Check, Gift, Lock, Play } from "lucide-react";
import { LocalPlay } from "@/components/game/local-play";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardLoader } from "@/components/ui/card-loader";
import { LoadError } from "@/components/ui/load-error";
import { toGameCards } from "@/lib/cards/to-game-cards";
import { startCheckout, type CheckoutProduct } from "@/lib/checkout";
import { deckThemeStyle, deckThemeVars } from "@/lib/deck-theme";
import { formatIdr } from "@/lib/pricing";
import { fetchPremiumCatalog, shortVolumeName, type PremiumSeries, type PremiumVolume } from "@/lib/premium";
import { createClient } from "@/lib/supabase/client";
import { useSignedIn } from "@/lib/supabase/use-signed-in";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import NotFound from "@/pages/not-found";
import type { GameCard } from "@flipcard/types";

type State = { status: "loading" | "error" | "ready"; series?: PremiumSeries | null };

/**
 * Halaman publik seri premium — bisa dibuka tanpa akun dan dibagikan ke grup.
 * Isinya daftar volume, preview gratis tiap volume (kartu `is_free_preview`,
 * dibatasi RLS), dan tombol beli volume / seri / hadiah.
 */
export default function SeriesPage() {
  const t = useT();
  const navigate = useNavigate();
  const { slug = "" } = useParams();
  const signedIn = useSignedIn();
  const [state, setState] = useState<State>({ status: "loading" });
  const [retry, setRetry] = useState(0);
  const [preview, setPreview] = useState<{ volume: PremiumVolume; cards: GameCard[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPremiumCatalog()
      .then((catalog) => { if (active) setState({ status: "ready", series: catalog.find((s) => s.slug === slug) ?? null }); })
      .catch((cause) => {
        console.error("[seri] gagal memuat katalog", cause);
        if (active) setState({ status: "error" });
      });
    return () => { active = false; };
    // signedIn ikut dependensi: status "sudah dimiliki" berubah setelah masuk.
  }, [slug, retry, signedIn]);

  if (state.status === "ready" && !state.series) return <NotFound />;

  async function openPreview(volume: PremiumVolume) {
    setBusy(`preview:${volume.id}`);
    const { data, error: fetchError } = await createClient()
      .from("cards")
      .select("id, content_text, card_type, difficulty, special_kind, details, level, sort_order, section:sections!inner(name, slug, sort_order, category_id)")
      .eq("section.category_id", volume.id)
      .eq("is_free_preview", true);
    setBusy(null);
    if (fetchError || !data) {
      console.error("[seri] gagal mengambil kartu preview", fetchError);
      setError(t.premium.buyError);
      return;
    }
    const rows = data
      .map((row) => {
        const section = Array.isArray(row.section) ? row.section[0] : row.section;
        return { ...row, section_name: section?.name ?? "", section_slug: section?.slug ?? "", sectionOrder: section?.sort_order ?? 0 };
      })
      .sort((a, b) => a.sectionOrder - b.sectionOrder || a.sort_order - b.sort_order);
    setPreview({ volume, cards: toGameCards(rows) });
  }

  async function buy(product: CheckoutProduct) {
    if (!signedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/seri/${slug}`)}`);
      return;
    }
    const key = "categoryId" in product ? product.categoryId : "seriesId" in product ? product.seriesId : "";
    setBusy(`${product.product}:${key}:${"gift" in product && product.gift ? "gift" : "self"}`);
    setError(null);
    const result = await startCheckout(product);
    if (result.error) {
      setBusy(null);
      setError(result.error === "already_owned" ? t.premium.alreadyOwned
        : result.error === "payments_unavailable" ? t.premium.paymentsSoon
        : t.premium.buyError);
    }
  }

  if (preview && state.series) {
    const series = state.series;
    const { volume, cards } = preview;
    return (
      <LocalPlay
        theme={volume.theme}
        language={series.language}
        cards={cards}
        badge={t.premium.previewBadge}
        onExit={() => setPreview(null)}
        renderDone={() => (
          <div style={deckThemeVars(volume.theme)} className={cn("flex min-h-dvh items-center justify-center bg-gradient-to-br px-6", deckThemeStyle(volume.theme).finish)}>
            <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-5 text-center">
              <div className="text-7xl">✨</div>
              <h1 className="text-3xl font-bold">{t.premium.previewDoneTitle}</h1>
              <p className="leading-relaxed text-muted-foreground">{t.premium.previewDoneBody(volume.cardTotal - volume.previewCount)}</p>
              <Button size="lg" className="w-full rounded-full" onClick={() => setPreview(null)}>{t.premium.backToSeries}</Button>
            </m.div>
          </div>
        )}
      />
    );
  }

  const series = state.series;
  const theme = series ? deckThemeStyle(series.theme) : null;

  return (
    <div className="relative min-h-dvh bg-gradient-to-br from-sky-50 via-indigo-50 to-violet-50 px-4 py-8">
      <LanguageSwitcher className="absolute top-4 right-4" />
      <div className="mx-auto max-w-screen-sm space-y-6">
        <Link to={signedIn ? "/home" : "/"} className="text-sm text-muted-foreground hover:underline">FlipCard</Link>
        {state.status === "loading" ? <CardLoader label={t.premium.loading} /> :
          state.status === "error" || !series || !theme ? (
            <LoadError title={t.premium.notFoundTitle} onRetry={() => { setState({ status: "loading" }); setRetry((v) => v + 1); }} />
          ) : (
            <>
              <header className={cn("space-y-3 rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl", theme.card)}>
                <p className="text-xs font-semibold uppercase tracking-widest text-white/80">{t.premium.eyebrow} · {series.language.toUpperCase()}</p>
                <h1 className="text-3xl font-bold leading-tight">{series.name}</h1>
                {series.description && <p className="leading-relaxed text-white/90">{series.description}</p>}
              </header>

              {series.owned ? (
                <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  <Check className="size-4" />{t.premium.seriesOwned}
                </p>
              ) : (
                <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-muted-foreground">{t.premium.seriesIncludes}</p>
                  <div className="flex gap-2">
                    <Button size="lg" className="flex-1 rounded-full" disabled={busy !== null} onClick={() => buy({ product: "series", seriesId: series.id })}>
                      {signedIn ? t.premium.buySeries(formatIdr(series.priceIdr)) : t.premium.signInToBuy}
                    </Button>
                    {signedIn && (
                      <Button size="lg" variant="outline" className="rounded-full" disabled={busy !== null} aria-label={t.premium.gift} onClick={() => buy({ product: "series", seriesId: series.id, gift: true })}>
                        <Gift className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

              <section className="space-y-3">
                <h2 className="font-semibold">{t.premium.volumes}</h2>
                {series.volumes.map((volume) => (
                  <article key={volume.id} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white", deckThemeStyle(volume.theme).card)}>
                        {volume.volume}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold leading-snug">{shortVolumeName(series, volume)}</h3>
                        {volume.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{volume.description}</p>}
                        <p className="mt-1 text-xs text-muted-foreground">{t.premium.volumeCards(volume.cardTotal, volume.previewCount)}</p>
                      </div>
                      {volume.owned ? <Check aria-label={t.premium.owned} className="size-5 text-emerald-600" /> : <Lock aria-hidden className="size-4 text-neutral-400" />}
                    </div>
                    {volume.owned ? (
                      <Link to={`/play/${volume.id}`} className={buttonVariants({ size: "lg", className: "w-full rounded-full" })}>
                        <Play className="size-4" />{t.premium.play}
                      </Link>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="flex-1 rounded-full" disabled={busy !== null || volume.previewCount === 0} onClick={() => openPreview(volume)}>
                          {t.premium.tryFree(volume.previewCount)}
                        </Button>
                        <Button className="flex-1 rounded-full" disabled={busy !== null} onClick={() => buy({ product: "volume", categoryId: volume.id })}>
                          {signedIn ? t.premium.buyVolume(formatIdr(volume.priceIdr)) : t.premium.signInToBuy}
                        </Button>
                        {signedIn && (
                          <Button variant="ghost" size="icon" className="rounded-full" disabled={busy !== null} aria-label={t.premium.gift} onClick={() => buy({ product: "volume", categoryId: volume.id, gift: true })}>
                            <Gift className="size-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </section>
            </>
          )}
      </div>
    </div>
  );
}
