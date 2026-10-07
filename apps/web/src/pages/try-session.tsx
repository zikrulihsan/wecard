import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, m, type Variants } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { CardDisplay } from "@/components/cards/card-display";
import { GameProgressBar } from "@/components/game/progress-bar";
import { QuizScore } from "@/components/game/quiz-score";
import { TrialLock } from "@/components/trial/trial-lock";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardLoader } from "@/components/ui/card-loader";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { hasAnswerSide } from "@/lib/cards/formats";
import { deckThemeStyle, deckThemeVars } from "@/lib/deck-theme";
import { useSignedIn } from "@/lib/supabase/use-signed-in";
import { findTrialDeck, type TrialDeck } from "@/lib/trial/decks";
import { freeCardCount, useTrialProgress } from "@/lib/trial/progress";
import { cn } from "@/lib/utils";
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
 * Layar main versi coba. Sengaja tidak memakai `useGameStore`: store itu
 * dipersist dan dipakai sesi pemain yang sudah login, jadi sesi coba cukup
 * hidup di state lokal dan hilang saat halaman ditutup.
 *
 * Tamu memainkan beberapa kartu pertama, lalu bertemu kartu terkunci. Pemain
 * yang sudah masuk memainkan deck sampai habis; `?kartu=N` membuka deck
 * langsung di kartu ke-N, dipakai saat kembali dari login supaya tidak
 * mengulang dari awal.
 */
export default function TrySessionPage() {
  const { deckSlug } = useParams();
  const deck = findTrialDeck(deckSlug);
  if (!deck) return <NotFound />;
  return <TrialSession key={deck.slug} deck={deck} />;
}

function startIndex(value: string | null, total: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 1 ? Math.min(parsed, total) - 1 : 0;
}

function TrialSession({ deck }: { deck: TrialDeck }) {
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
  const backToTry = () => navigate(`/coba?jenis=${deck.mode}`);

  // Sesi belum diketahui: jangan sampai pemain yang baru kembali dari login
  // sempat melihat kartu terkunci.
  if (locked && signedIn === null) {
    return (
      <div className="mx-auto max-w-screen-sm px-4 py-8">
        <CardLoader label="Memeriksa sesi" />
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
          <h1 className="text-3xl font-bold">Deck {deck.name} selesai!</h1>
          {answered.length > 0 && (
            <QuizScore correct={answered.filter(Boolean).length} total={answered.length} />
          )}
          <p className="leading-relaxed text-muted-foreground">
            {signedIn
              ? `Mau deck dengan topik kalian sendiri? Bikin pakai AI — akunmu punya jatah ${AI_GENERATION_LIMIT} deck gratis.`
              : "Masih banyak deck lain yang bisa kamu coba gratis."}
          </p>
          <div className="space-y-2">
            {signedIn && (
              <Link
                to="/create"
                className={buttonVariants({ size: "lg", className: "w-full rounded-full" })}
              >
                Bikin deck sendiri
              </Link>
            )}
            <Button
              size="lg"
              variant={signedIn ? "outline" : "default"}
              className="w-full rounded-full"
              onClick={backToTry}
            >
              Coba deck lain
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
              Main lagi
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
      <header className="flex shrink-0 items-center gap-1 px-4 pt-3 pb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={backToTry}
          className="shrink-0 rounded-full"
          aria-label="Keluar"
        >
          <X className="size-5" />
        </Button>
        <div className="flex-1 px-2">
          <GameProgressBar current={index} total={cards.length} />
        </div>
        {signedIn === false && freeCards < cards.length && (
          <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-600">
            {Math.min(index + 1, freeCards)}/{freeCards} gratis
          </span>
        )}
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
              aria-label="Kartu sebelumnya"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button onClick={backToTry} variant="outline" size="lg" className="flex-1 rounded-full">
              Coba deck lain
            </Button>
          </div>
        ) : !revealed ? (
          <Button onClick={() => setRevealed(true)} size="lg" className="w-full rounded-full">
            Buka Kartu
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              onClick={goPrevious}
              disabled={index === 0}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label="Kartu sebelumnya"
            >
              <ChevronLeft className="size-5" />
            </Button>
            {awaitingAnswer ? (
              <Button
                onClick={() => setAnswerRevealed(true)}
                size="lg"
                className="flex-1 rounded-full"
              >
                Lihat Jawaban
              </Button>
            ) : (
              <Button onClick={goNext} size="lg" className="flex-1 rounded-full">
                Kartu Berikutnya
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
