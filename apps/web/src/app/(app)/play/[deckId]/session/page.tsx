"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { GameProgressBar } from "@/components/game/progress-bar";
import { Button } from "@/components/ui/button";
import type { GameCard } from "@wecard/types";

// Gerbang hidrasi: false saat SSR/hidrasi, true setelahnya — store zustand
// baru terisi dari localStorage di client, jadi render pertama harus netral.
const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

const cardVariants: Variants = {
  enter: { opacity: 0, scale: 0.92 },
  center: { opacity: 1, scale: 1 },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.92,
    x: direction * 320,
    transition: { duration: 0.18, ease: "easeIn" },
  }),
};

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params.deckId as string;

  const mounted = useMounted();
  // Arah exit kartu: -1 = maju (terbang ke kiri), 1 = mundur (ke kanan).
  // Di-set bersamaan dengan aksi store di handler yang sama, jadi keduanya
  // ter-batch dalam satu render.
  const [exitDir, setExitDir] = useState(-1);

  const {
    cards,
    currentIndex,
    isCardRevealed,
    isActive,
    deckId: storedDeckId,
    revealCard,
    nextCard,
    previousCard,
    skipCard,
    endSession,
  } = useGameStore();

  // Redirect if no active session or wrong deck
  useEffect(() => {
    if (!mounted) return;
    if (!isActive || storedDeckId !== deckId || cards.length === 0) {
      router.replace(`/play/${deckId}`);
    }
  }, [mounted, isActive, storedDeckId, deckId, cards.length, router]);

  if (!mounted || !isActive || cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  const isComplete = currentIndex >= cards.length;
  const currentCard = cards[currentIndex];

  if (isComplete) {
    return <CompletionScreen deckId={deckId} onEnd={endSession} />;
  }

  const goNext = () => {
    setExitDir(-1);
    nextCard();
  };

  const goPrevious = () => {
    setExitDir(1);
    previousCard();
  };

  const goSkip = () => {
    setExitDir(-1);
    skipCard();
  };

  const handleExit = () => {
    if (confirm("Yakin keluar? Progres tidak akan disimpan.")) {
      endSession();
      router.push(`/play/${deckId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-pink-50/40 to-rose-50/40">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExit}
          className="rounded-full"
          aria-label="Keluar"
        >
          <X className="size-5" />
        </Button>
        <div className="flex-1 px-4">
          <GameProgressBar current={currentIndex} total={cards.length} />
        </div>
        <div className="w-10" />
      </header>

      {/* Card area */}
      <div className="relative flex-1 flex items-center justify-center px-6 py-4 overflow-hidden">
        <AnimatePresence
          mode="popLayout"
          initial={false}
          custom={exitDir}
        >
          <SwipeableCard
            key={currentCard.id}
            card={currentCard}
            isRevealed={isCardRevealed}
            canGoBack={currentIndex > 0}
            onFlip={revealCard}
            onNext={goNext}
            onPrevious={goPrevious}
          />
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="px-6 py-6 space-y-3">
        {!isCardRevealed ? (
          <Button
            onClick={revealCard}
            size="lg"
            className="w-full rounded-full"
          >
            Buka Kartu
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              onClick={goPrevious}
              disabled={currentIndex === 0}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label="Kartu sebelumnya"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              onClick={goNext}
              size="lg"
              className="flex-1 rounded-full"
            >
              Kartu Berikutnya
            </Button>
            <Button
              onClick={goSkip}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label="Lewati"
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
          Geser kartu ke kiri untuk lanjut, ke kanan untuk kembali
        </p>
      </div>
    </div>
  );
}

function SwipeableCard({
  card,
  isRevealed,
  canGoBack,
  onFlip,
  onNext,
  onPrevious,
}: {
  card: GameCard;
  isRevealed: boolean;
  canGoBack: boolean;
  onFlip: () => void;
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
      style={{ x, rotate }}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="w-full flex justify-center"
    >
      <CardDisplay
        card={card}
        isRevealed={isRevealed}
        onFlip={() => !isRevealed && onFlip()}
      />
    </m.div>
  );
}

function CompletionScreen({
  deckId,
  onEnd,
}: {
  deckId: string;
  onEnd: () => void;
}) {
  const router = useRouter();

  const handleFinish = () => {
    onEnd();
    router.push(`/play/${deckId}`);
  };

  const handleAgain = () => {
    onEnd();
    router.push(`/play/${deckId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center space-y-6"
      >
        <div className="text-7xl">🎉</div>
        <h1 className="text-3xl font-bold">Selesai!</h1>
        <p className="text-muted-foreground leading-relaxed">
          Semoga obrolan kalian tadi bikin makin dekat. Mau main sekali lagi?
        </p>
        <div className="space-y-2">
          <Button
            onClick={handleAgain}
            size="lg"
            className="w-full rounded-full"
          >
            Main Lagi
          </Button>
          <Button
            onClick={handleFinish}
            variant="outline"
            size="lg"
            className="w-full rounded-full"
          >
            Kembali ke Deck
          </Button>
        </div>
      </m.div>
    </div>
  );
}
