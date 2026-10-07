import { useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AnimatePresence,
  m,
  useMotionValue,
  useTransform,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { X, ChevronLeft, SkipForward } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { CardDisplay } from "@/components/cards/card-display";
import { CardTimer } from "@/components/game/card-timer";
import { GameProgressBar } from "@/components/game/progress-bar";
import { QuizScore } from "@/components/game/quiz-score";
import { SessionSkeleton } from "@/components/game/session-skeleton";
import { Button } from "@/components/ui/button";
import { hasAnswerSide } from "@/lib/cards/formats";
import { deckThemeStyle, deckThemeVars } from "@/lib/deck-theme";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { DeckTheme, GameCard } from "@flipcard/types";

// Gerbang hidrasi: false saat SSR/hidrasi, true setelahnya — store zustand
// baru terisi dari localStorage di client, jadi render pertama harus netral.
const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

const noop = () => {};

// direction: 1 = maju (kartu baru masuk dari kanan), -1 = mundur (dari kiri).
// Jarak masuk sengaja pendek (56px) — kartu baru lebih banyak muncul lewat
// fade + scale daripada meluncur jauh, jadi tidak terbaca "melompat".
const cardVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 0.96,
    x: direction * 56,
  }),
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      x: { type: "spring", stiffness: 420, damping: 38, mass: 0.7 },
      opacity: { duration: 0.16, ease: "easeOut" },
      scale: { duration: 0.22, ease: "easeOut" },
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.96,
    x: direction * -300,
    transition: {
      x: { duration: 0.2, ease: [0.4, 0, 1, 1] },
      opacity: { duration: 0.14, ease: "easeIn" },
      scale: { duration: 0.2 },
    },
  }),
};

export default function SessionPage() {
  const t = useT();
  const navigate = useNavigate();
  const params = useParams();
  const deckId = params.deckId ?? "";

  const mounted = useMounted();
  // Arah navigasi: 1 = maju, -1 = mundur. Di-set bersamaan dengan aksi store
  // di handler yang sama, jadi keduanya ter-batch dalam satu render.
  const [direction, setDirection] = useState(1);

  const {
    cards,
    currentIndex,
    isCardRevealed,
    isAnswerRevealed,
    results,
    isActive,
    deckId: storedDeckId,
    deckTheme,
    timer,
    revealCard,
    revealAnswer,
    recordResult,
    nextCard,
    previousCard,
    skipCard,
    endSession,
  } = useGameStore();

  // Redirect if no active session or wrong deck
  useEffect(() => {
    if (!mounted) return;
    if (!isActive || storedDeckId !== deckId || cards.length === 0) {
      navigate(`/play/${deckId}`, { replace: true });
    }
  }, [mounted, isActive, storedDeckId, deckId, cards.length, navigate]);

  if (!mounted || !isActive || cards.length === 0) {
    // Kerangka yang sama dengan layar mainnya, bukan teks "Memuat..." —
    // supaya pergantian ke kartu asli tidak terasa seperti layar berganti.
    // Sebelum hidrasi selesai, tema dari store belum boleh dipakai: HTML
    // server tidak mengenalnya dan hasilnya jadi mismatch.
    return <SessionSkeleton theme={mounted ? deckTheme : undefined} />;
  }

  const isComplete = currentIndex >= cards.length;
  const currentCard = cards[currentIndex];

  if (isComplete) {
    return (
      <CompletionScreen
        deckId={deckId}
        deckTheme={deckTheme}
        results={results}
        onEnd={endSession}
      />
    );
  }

  const theme = deckThemeStyle(deckTheme);
  const awaitingAnswer =
    isCardRevealed && hasAnswerSide(currentCard.cardType) && !isAnswerRevealed;

  const goNext = () => {
    setDirection(1);
    nextCard();
  };

  const goPrevious = () => {
    setDirection(-1);
    previousCard();
  };

  const goSkip = () => {
    setDirection(1);
    skipCard();
  };

  const handleExit = () => {
    if (confirm(t.game.confirmExit)) {
      endSession();
      navigate(`/play/${deckId}`);
    }
  };

  return (
    // Tinggi dikunci ke area yang benar-benar terlihat: viewport dikurangi
    // tinggi bottom nav (--bottom-nav-h, dipakai bersama AppLayout).
    // Sebelumnya min-h-screen di dalam <main> yang sudah ber-padding-bawah
    // membuat halaman lebih tinggi dari layar sehingga ikut ter-scroll — itu
    // yang bikin jarak atas-bawah kartu terasa timpang.
    <div
      style={deckThemeVars(deckTheme)}
      className={cn(
        "flex flex-col h-[calc(100dvh-var(--bottom-nav-h))] min-h-[26rem] overflow-hidden bg-gradient-to-br",
        theme.play
      )}
    >
      {/* Header */}
      <header className="shrink-0 flex items-center gap-1 px-4 pt-3 pb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExit}
          className="rounded-full shrink-0"
          aria-label={t.common.exit}
        >
          <X className="size-5" />
        </Button>
        <div className="flex-1 px-2">
          <GameProgressBar current={currentIndex} total={cards.length} />
        </div>
        {timer.seconds > 0 ? (
          <CardTimer
            key={currentCard.id}
            seconds={timer.seconds}
            running={isCardRevealed}
            onExpire={timer.autoAdvance ? goNext : noop}
          />
        ) : (
          <div className="size-8 shrink-0" />
        )}
      </header>

      {/* Card area — kedua kartu absolut sejak awal, jadi kartu masuk dan
          keluar tidak pernah saling mendorong lewat layout. */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <SwipeableCard
            key={currentCard.id}
            card={currentCard}
            direction={direction}
            isRevealed={isCardRevealed}
            isAnswerRevealed={isAnswerRevealed}
            result={results[currentCard.id]}
            canGoBack={currentIndex > 0}
            onFlip={revealCard}
            onRevealAnswer={revealAnswer}
            onResult={(correct) => recordResult(currentCard.id, correct)}
            onNext={goNext}
            onPrevious={goPrevious}
          />
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="shrink-0 px-6 pt-3 pb-4 space-y-2">
        {!isCardRevealed ? (
          <Button
            onClick={revealCard}
            size="lg"
            className="w-full rounded-full"
          >
            {t.game.openCard}
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              onClick={goPrevious}
              disabled={currentIndex === 0}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label={t.game.previousCard}
            >
              <ChevronLeft className="size-5" />
            </Button>
            {awaitingAnswer ? (
              <Button
                onClick={revealAnswer}
                size="lg"
                className="flex-1 rounded-full"
              >
                {t.game.showAnswer}
              </Button>
            ) : (
              <Button
                onClick={goNext}
                size="lg"
                className="flex-1 rounded-full"
              >
                {t.game.nextCard}
              </Button>
            )}
            <Button
              onClick={goSkip}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label={t.game.skip}
            >
              <SkipForward className="size-5" />
            </Button>
          </div>
        )}
        {/* Selalu di-render agar tinggi area tombol konstan — kalau muncul
            hanya saat revealed, kartu ikut bergeser di tengah animasi flip. */}
        <p
          aria-hidden={!isCardRevealed}
          className={`text-center text-xs text-muted-foreground transition-opacity duration-200 ${
            isCardRevealed ? "opacity-100" : "opacity-0"
          }`}
        >
          {t.game.swipeHint}
        </p>
      </div>
    </div>
  );
}

function SwipeableCard({
  card,
  direction,
  isRevealed,
  isAnswerRevealed,
  result,
  canGoBack,
  onFlip,
  onRevealAnswer,
  onResult,
  onNext,
  onPrevious,
}: {
  card: GameCard;
  direction: number;
  isRevealed: boolean;
  isAnswerRevealed: boolean;
  result: boolean | undefined;
  canGoBack: boolean;
  onFlip: () => void;
  onRevealAnswer: () => void;
  onResult: (correct: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  // Drag menulis langsung ke motion value — tidak ada setState per frame,
  // React tidak re-render selama jari bergerak.
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-7, 7]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Gabungkan jarak + kecepatan supaya flick pendek tapi cepat tetap dihitung.
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -140) {
      onNext();
    } else if (swipe > 140 && canGoBack) {
      onPrevious();
    }
  };

  return (
    <m.div
      drag={isRevealed ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, willChange: "transform, opacity" }}
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute inset-0 flex items-center justify-center px-6 py-2"
    >
      <CardDisplay
        card={card}
        isRevealed={isRevealed}
        onFlip={() => !isRevealed && onFlip()}
        isAnswerRevealed={isAnswerRevealed}
        onRevealAnswer={onRevealAnswer}
        result={result}
        onResult={onResult}
      />
    </m.div>
  );
}

function CompletionScreen({
  deckId,
  deckTheme,
  results,
  onEnd,
}: {
  deckId: string;
  deckTheme: DeckTheme;
  results: Record<string, boolean>;
  onEnd: () => void;
}) {
  const t = useT();
  const graded = Object.values(results);
  const correct = graded.filter(Boolean).length;

  const navigate = useNavigate();

  const handleFinish = () => {
    onEnd();
    navigate(`/play/${deckId}`);
  };

  const handleAgain = () => {
    onEnd();
    navigate(`/play/${deckId}`);
  };

  return (
    <div
      style={deckThemeVars(deckTheme)}
      className={cn(
        "flex min-h-[calc(100dvh-var(--bottom-nav-h))] items-center justify-center px-6 bg-gradient-to-br",
        deckThemeStyle(deckTheme).finish
      )}
    >
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center space-y-6"
      >
        <div className="text-7xl">🎉</div>
        <h1 className="text-3xl font-bold">{t.game.done}</h1>
        {graded.length > 0 ? (
          <QuizScore correct={correct} total={graded.length} />
        ) : (
          <p className="text-muted-foreground leading-relaxed">
            {t.game.doneTalk}
          </p>
        )}
        <div className="space-y-2">
          <Button
            onClick={handleAgain}
            size="lg"
            className="w-full rounded-full"
          >
            {t.game.playAgain}
          </Button>
          <Button
            onClick={handleFinish}
            variant="outline"
            size="lg"
            className="w-full rounded-full"
          >
            {t.game.backToDeck}
          </Button>
        </div>
      </m.div>
    </div>
  );
}
