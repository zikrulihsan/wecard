import { Link, useSearchParams } from "react-router-dom";
import { Check, Lock, Play, RotateCcw } from "lucide-react";
import { DECK_MODES, type DeckMode } from "@flipcard/types";
import { BackLink } from "@/components/nav/back-link";
import { buttonVariants } from "@/components/ui/button";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { DECK_MODE_META, isDeckMode } from "@/lib/deck-mode";
import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import { CREDITS_ON_SALE, CREDIT_PACKS, formatIdr } from "@/lib/pricing";
import { useSignedIn } from "@/lib/supabase/use-signed-in";
import { trialDecks, type TrialDeck } from "@/lib/trial/decks";
import { useI18n, useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { TRIAL_FREE_CARDS, freeCardCount, useTrialProgress } from "@/lib/trial/progress";
import { cn } from "@/lib/utils";

// Jenis deck sama di semua bahasa (slug & mode-nya identik), jadi cukup
// dihitung dari salah satunya.
const MODES = DECK_MODES.filter((mode) => trialDecks("id").some((deck) => deck.mode === mode));

/**
 * Pintu masuk "Coba gratis". Semua deck coba bisa dibuka tanpa akun, tapi
 * hanya {TRIAL_FREE_CARDS} kartu pertamanya; kartu sesudahnya terkunci di
 * dalam sesi dan membawa ke login. Deck dipisah per jenis (tab), sama seperti
 * beranda pemain yang sudah masuk.
 *
 * Bagian bawah menunjukkan tangganya terang-terangan: coba → akun gratis →
 * top-up, supaya tamu tahu apa yang didapat di tiap langkah.
 */
export default function TryPage() {
  const { t, language } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const signedIn = useSignedIn();
  const { seen } = useTrialProgress();

  const requested = searchParams.get("jenis");
  const activeMode: DeckMode =
    isDeckMode(requested) && MODES.includes(requested) ? requested : MODES[0];
  const decks = trialDecks(language).filter((deck) => deck.mode === activeMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="mx-auto max-w-screen-sm px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <BackLink href={signedIn ? "/home" : "/"}>{t.trial.backHome}</BackLink>
          <LanguageSwitcher />
        </div>

        <header className="mb-5 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {signedIn ? t.trial.titleSignedIn : t.trial.titleGuest}
          </h1>
          <p className="text-neutral-600">
            {signedIn ? (
              t.trial.introSignedIn
            ) : (
              <>
                {t.trial.introLead}{" "}
                <strong className="font-semibold text-neutral-800">
                  {t.trial.introStrong(TRIAL_FREE_CARDS)}
                </strong>{" "}
                {t.trial.introRest}
              </>
            )}
          </p>
        </header>

        <div
          role="tablist"
          aria-label={t.trial.modeTabs}
          className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
        >
          {MODES.map((mode) => {
            const selected = mode === activeMode;
            const meta = DECK_MODE_META[mode];
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setSearchParams({ jenis: mode }, { replace: true })}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors",
                  selected
                    ? "border-pink-600 bg-pink-600 font-medium text-white shadow-sm"
                    : "border-pink-100 bg-white/80 text-neutral-700 hover:bg-white"
                )}
              >
                <span aria-hidden>{meta.emoji}</span>
                {t.modes[mode].label}
              </button>
            );
          })}
        </div>
        <p className="mb-4 text-sm text-neutral-500">{t.modes[activeMode].hint}</p>

        <ul className="space-y-3" role="tabpanel">
          {decks.map((deck) => (
            <li key={deck.slug}>
              <TrialDeckTile deck={deck} seen={seen[deck.slug] ?? 0} guest={signedIn === false} />
            </li>
          ))}
        </ul>

        {signedIn !== true && <UpgradeLadder />}
        {signedIn === true && (
          <div className="mt-8 text-center">
            <Link to="/create" className={buttonVariants({ size: "lg", className: "rounded-full" })}>
              {t.trial.makeWithAi}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function TrialDeckTile({ deck, seen, guest }: { deck: TrialDeck; seen: number; guest: boolean }) {
  const t = useT();
  const free = freeCardCount(deck.cards.length);
  const lockedCount = deck.cards.length - free;
  const played = Math.min(seen, free);
  const usedUp = guest && played >= free && lockedCount > 0;

  return (
    <Link
      to={`/coba/${deck.slug}`}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2",
        DECK_THEME_STYLES[deck.theme].card
      )}
    >
      <span className="text-3xl" aria-hidden>{deck.emoji}</span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block font-semibold">{deck.name}</span>
        <span className="block text-sm leading-snug text-white/85">{deck.description}</span>
        {guest && lockedCount > 0 ? (
          <span className="flex items-center gap-2 pt-0.5 text-xs text-white/80">
            <FreeMeter used={played} free={free} />
            <span>
              {usedUp ? t.trial.freeUsedUp : t.trial.freeCount(free)}
              {" · "}
              <Lock className="inline size-3 -translate-y-px" aria-hidden /> {t.trial.lockedMore(lockedCount)}
            </span>
          </span>
        ) : (
          <span className="block text-xs text-white/70">{t.common.cards(deck.cards.length)}</span>
        )}
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
        {played > 0 ? (
          <RotateCcw className="size-4" aria-label={t.trial.playAgain} />
        ) : (
          <Play className="size-4" aria-label={t.trial.play} />
        )}
      </span>
    </Link>
  );
}

function FreeMeter({ used, free }: { used: number; free: number }) {
  const t = useT();
  return (
    <span className="flex w-14 shrink-0 gap-0.5" aria-label={t.trial.freeMeter(used, free)}>
      {Array.from({ length: free }, (_, index) => (
        <span
          key={index}
          className={cn("h-1.5 flex-1 rounded-full", index < used ? "bg-white" : "bg-white/35")}
        />
      ))}
    </span>
  );
}

/** Tiga langkah dari coba sampai beli, dengan langkah sekarang ditandai. */
function UpgradeLadder() {
  const t = useT().trial;
  const pack = CREDIT_PACKS[0];
  const price = formatIdr(pack.priceIdr);
  const steps = [
    {
      title: t.ladderTryTitle,
      tag: t.ladderTryTag,
      points: t.ladderTryPoints(TRIAL_FREE_CARDS),
    },
    {
      title: t.ladderFreeTitle,
      tag: t.ladderFreeTag,
      points: t.ladderFreePoints(AI_GENERATION_LIMIT),
    },
    {
      title: t.ladderTopupTitle,
      tag: CREDITS_ON_SALE ? t.ladderPrice(price) : t.ladderTopupSoon,
      points: t.ladderTopupPoints(pack.credits, price),
    },
  ];

  return (
    <section className="mt-10 space-y-4" aria-labelledby="ladder-title">
      <h2 id="ladder-title" className="text-lg font-semibold">
        {t.ladderTitle}
      </h2>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              "rounded-2xl border bg-white/80 p-4",
              index === 1 ? "border-pink-300 shadow-sm" : "border-pink-100"
            )}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="font-semibold">
                <span className="mr-2 text-neutral-400">{index + 1}</span>
                {step.title}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  index === 0 ? "bg-neutral-100 text-neutral-600" : "bg-pink-100 text-pink-700"
                )}
              >
                {step.tag}
              </span>
            </div>
            <ul className="space-y-1 text-sm text-neutral-600">
              {step.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-pink-500" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            {index === 1 && (
              <div className="mt-3 flex gap-2">
                <Link
                  to="/register"
                  className={buttonVariants({
                    className: "flex-1 rounded-full bg-pink-600 text-white [a]:hover:bg-pink-700",
                  })}
                >
                  {t.createAccount}
                </Link>
                <Link
                  to="/login"
                  className={buttonVariants({ variant: "outline", className: "flex-1 rounded-full border-pink-200 bg-white" })}
                >
                  {t.signIn}
                </Link>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
