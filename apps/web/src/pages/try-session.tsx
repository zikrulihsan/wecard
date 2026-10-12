import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, m, type Variants } from "framer-motion";
import { ChevronDown, ChevronLeft, X } from "lucide-react";
import { DECK_MODES } from "@flipcard/types";
import { CardDisplay } from "@/components/cards/card-display";
import { GameProgressBar } from "@/components/game/progress-bar";
import { QuizScore } from "@/components/game/quiz-score";
import { ShareActions } from "@/components/share/share-actions";
import { TrialLock } from "@/components/trial/trial-lock";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardLoader } from "@/components/ui/card-loader";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { hasAnswerSide } from "@/lib/cards/formats";
import { DECK_MODE_META, isDeckMode } from "@/lib/deck-mode";
import { deckThemeStyle, deckThemeVars } from "@/lib/deck-theme";
import { useSignedIn } from "@/lib/supabase/use-signed-in";
import { findTrialDeck, trialDecks, type TrialDeck } from "@/lib/trial/decks";
import { freeCardCount, useTrialProgress } from "@/lib/trial/progress";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import NotFound from "@/pages/not-found";

// direction: 1 = maju, -1 = mundur — sama seperti layar main yang asli.
const cardVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, scale: 0.96, x: direction * 56 }),
  center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.22, ease: "easeOut" } },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.96,
    x: direction * -300,
    transition: { duration: 0.2, ease: "easeIn" },
  }),
};

/**
 * Halaman coba = layar main. `/coba` langsung membuka kartu pertama deck
 * bawaan (deck pertama, atau deck pertama dari `?jenis=`), dan deck lain
 * dipilih lewat dropdown di atas kartu, jadi tidak ada langkah memilih dulu.
 * Sengaja tidak memakai `useGameStore`: store itu dipersist dan dipakai sesi
 * pemain yang sudah login, jadi sesi coba cukup hidup di state lokal dan
 * hilang saat halaman ditutup.
 *
 * Tamu memainkan beberapa kartu pertama, lalu bertemu kartu terkunci. Pemain
 * yang sudah masuk memainkan deck sampai habis; `?kartu=N` membuka deck
 * langsung di kartu ke-N, dipakai saat kembali dari login supaya tidak
 * mengulang dari awal.
 */
export default function TrySessionPage() {
  const { deckSlug } = useParams();
  const [searchParams] = useSearchParams();
  const { language } = useI18n();
  const deck = deckSlug
    ? findTrialDeck(deckSlug, language)
    : defaultTrialDeck(searchParams.get("jenis"), trialDecks(language));
  if (!deck) return <NotFound />;
  // Ganti bahasa di tengah sesi = deck dimuat ulang dalam bahasa baru.
  return <TrialSession key={`${deck.slug}-${language}`} deck={deck} />;
}

function defaultTrialDeck(mode: string | null, decks: TrialDeck[]): TrialDeck | undefined {
  return (isDeckMode(mode) && decks.find((deck) => deck.mode === mode)) || decks[0];
}

function startIndex(value: string | null, total: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 1 ? Math.min(parsed, total) - 1 : 0;
}

function TrialSession({ deck }: { deck: TrialDeck }) {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signedIn = useSignedIn();
  const { markSeen } = useTrialProgress();

  // Urutan kurasi, tidak diacak: kartu gratis harus selalu kartu yang sama,
  // dan "lanjut dari kartu ke-N" setelah login harus menunjuk kartu yang
  // memang belum dimainkan.
  const cards = deck.cards;
  const freeCards = freeCardCount(cards.length);
  const [index, setIndex] = useState(() => startIndex(searchParams.get("kartu"), cards.length));
  const [revealed, setRevealed] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [direction, setDirection] = useState(1);

  const locked = signedIn !== true && index >= freeCards && index < cards.length;

  useEffect(() => {
    if (signedIn === false) markSeen(deck.slug, Math.min(index + 1, freeCards));
  }, [signedIn, index, freeCards, deck.slug, markSeen]);

  const theme = deckThemeStyle(deck.theme);
  const allDecks = trialDecks(language);
  const nextDeck = allDecks[(allDecks.findIndex((item) => item.slug === deck.slug) + 1) % allDecks.length];
  const openDeck = (slug: string) => navigate(`/coba/${slug}`);
  const tryAnother = () => openDeck(nextDeck.slug);
  const exit = () => navigate(signedIn ? "/home" : "/");

  // Sesi belum diketahui: jangan sampai pemain yang baru kembali dari login
  // sempat melihat kartu terkunci.
  if (locked && signedIn === null) {
    return (
      <div className="mx-auto max-w-screen-sm px-4 py-8">
        <CardLoader label={t.app.checkingSession} />
      </div>
    );
  }

  if (index >= cards.length) {
    const answered = Object.values(results);
    return (
      <div
        style={deckThemeVars(deck.theme)}
        className={cn("flex min-h-dvh items-center justify-center bg-gradient-to-br px-6", theme.finish)}
      >
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md space-y-6 text-center"
        >
          <div className="text-7xl">🎉</div>
          <h1 className="text-3xl font-bold">{t.trial.deckDone(deck.name)}</h1>
          {answered.length > 0 && (
            <QuizScore correct={answered.filter(Boolean).length} total={answered.length} />
          )}
          <p className="leading-relaxed text-muted-foreground">
            {signedIn
              ? t.trial.doneSignedIn(AI_GENERATION_LIMIT)
              : t.trial.doneGuest}
          </p>
          <ShareActions
            text={answered.length > 0
              ? t.share.resultText(answered.filter(Boolean).length, answered.length, deck.name)
              : t.share.playedText(deck.name)}
            url={`${window.location.origin}/coba/${deck.slug}`}
            label={answered.length > 0 ? t.share.shareResult : t.share.inviteFriends}
            variant="outline"
          />
          <div className="space-y-2">
            {signedIn && (
              <Link
                to="/create"
                className={buttonVariants({ size: "lg", className: "w-full rounded-full" })}
              >
                {t.trial.makeOwn}
              </Link>
            )}
            <Button
              size="lg"
              variant={signedIn ? "outline" : "default"}
              className="w-full rounded-full"
              onClick={tryAnother}
            >
              {t.trial.tryAnother}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-full"
              onClick={() => {
                setIndex(0);
                setRevealed(false);
                setAnswerRevealed(false);
                setResults({});
              }}
            >
              {t.game.playAgain}
            </Button>
          </div>
        </m.div>
      </div>
    );
  }

  const card = cards[index];
  const awaitingAnswer =
    revealed && hasAnswerSide(card.cardType) && !answerRevealed;
  const goNext = () => {
    setDirection(1);
    setRevealed(false);
    setAnswerRevealed(false);
    setIndex((value) => value + 1);
  };
  const goPrevious = () => {
    if (index === 0) return;
    setDirection(-1);
    setRevealed(false);
    setAnswerRevealed(false);
    setIndex((value) => value - 1);
  };

  return (
    <div
      style={deckThemeVars(deck.theme)}
      className={cn("flex h-dvh min-h-[26rem] flex-col overflow-hidden bg-gradient-to-br", theme.play)}
    >
      <header className="shrink-0 space-y-2 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={exit}
            className="shrink-0 rounded-full"
            aria-label={t.common.exit}
          >
            <X className="size-5" />
          </Button>
          <DeckPicker decks={allDecks} current={deck.slug} onChange={openDeck} />
          {signedIn === false && freeCards < cards.length && (
            <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-600">
              {t.trial.freeBadge(Math.min(index + 1, freeCards), freeCards)}
            </span>
          )}
        </div>
        <div className="px-2">
          <GameProgressBar current={index} total={cards.length} />
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <m.div
            key={locked ? "locked" : card.id}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={cn(
              "absolute inset-0 flex justify-center px-6 py-2",
              locked ? "overflow-y-auto py-6" : "items-center"
            )}
          >
            {locked ? (
              <TrialLock deck={deck} freeCards={freeCards} results={results} />
            ) : (
              <CardDisplay
                card={card}
                isRevealed={revealed}
                onFlip={() => setRevealed(true)}
                isAnswerRevealed={answerRevealed}
                onRevealAnswer={() => setAnswerRevealed(true)}
                language={language}
                result={results[card.id]}
                onResult={(correct) =>
                  setResults((value) => ({ ...value, [card.id]: correct }))
                }
              />
            )}
          </m.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {locked ? (
          <div className="flex items-center gap-3">
            <Button
              onClick={goPrevious}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label={t.game.previousCard}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button onClick={tryAnother} variant="outline" size="lg" className="flex-1 rounded-full">
              {t.trial.tryAnother}
            </Button>
          </div>
        ) : !revealed ? (
          <Button onClick={() => setRevealed(true)} size="lg" className="w-full rounded-full">
            {t.game.openCard}
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              onClick={goPrevious}
              disabled={index === 0}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label={t.game.previousCard}
            >
              <ChevronLeft className="size-5" />
            </Button>
            {awaitingAnswer ? (
              <Button
                onClick={() => setAnswerRevealed(true)}
                size="lg"
                className="flex-1 rounded-full"
              >
                {t.game.showAnswer}
              </Button>
            ) : (
              <Button onClick={goNext} size="lg" className="flex-1 rounded-full">
                {t.game.nextCard}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Ganti deck tanpa keluar dari layar main. Native `<select>` supaya di HP
 * muncul pemilih bawaan sistem; deck dikelompokkan per jenis.
 */
function DeckPicker({
  decks,
  current,
  onChange,
}: {
  decks: TrialDeck[];
  current: string;
  onChange: (slug: string) => void;
}) {
  const t = useI18n().t;
  return (
    <label className="relative min-w-0 flex-1">
      <span className="sr-only">{t.trial.deckPicker}</span>
      <select
        value={current}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer appearance-none truncate rounded-full border border-white/60 bg-white/80 py-2 pr-9 pl-4 text-sm font-medium text-neutral-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
      >
        {DECK_MODES.map((mode) => {
          const inMode = decks.filter((deck) => deck.mode === mode);
          if (inMode.length === 0) return null;
          return (
            <optgroup key={mode} label={`${DECK_MODE_META[mode].emoji} ${t.modes[mode].label}`}>
              {inMode.map((deck) => (
                <option key={deck.slug} value={deck.slug}>
                  {deck.emoji} {deck.name}
                </option>
              ))}
            </optgroup>
          );
        })}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-500"
      />
    </label>
  );
}
