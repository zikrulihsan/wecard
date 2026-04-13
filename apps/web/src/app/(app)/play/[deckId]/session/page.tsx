"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, SkipForward } from "lucide-react";
import { useGameStore } from "@/stores/game-store";
import { CardDisplay } from "@/components/cards/card-display";
import { GameProgressBar } from "@/components/game/progress-bar";
import { Button } from "@/components/ui/button";

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const deckId = params.deckId as string;

  const [mounted, setMounted] = useState(false);
  const [dragX, setDragX] = useState(0);

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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    setDragX(0);
    const threshold = 100;
    if (info.offset.x < -threshold && isCardRevealed) {
      nextCard();
    } else if (info.offset.x > threshold && currentIndex > 0) {
      previousCard();
    }
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
      <div className="flex-1 flex items-center justify-center px-6 py-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            drag={isCardRevealed ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDrag={(_, info) => setDragX(info.offset.x)}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: dragX * 0.05,
              x: dragX * 0.1,
            }}
            exit={{ opacity: 0, scale: 0.9, x: dragX < 0 ? -300 : 300 }}
            transition={{ duration: 0.25 }}
            className="w-full flex justify-center"
          >
            <CardDisplay
              card={currentCard}
              isRevealed={isCardRevealed}
              onFlip={() => !isCardRevealed && revealCard()}
            />
          </motion.div>
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
              onClick={previousCard}
              disabled={currentIndex === 0}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label="Kartu sebelumnya"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              onClick={nextCard}
              size="lg"
              className="flex-1 rounded-full"
            >
              Kartu Berikutnya
            </Button>
            <Button
              onClick={skipCard}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label="Lewati"
            >
              <SkipForward className="size-5" />
            </Button>
          </div>
        )}
        {isCardRevealed && (
          <p className="text-center text-xs text-muted-foreground">
            Geser kartu ke kiri untuk lanjut, ke kanan untuk kembali
          </p>
        )}
      </div>
    </div>
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
      <motion.div
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
      </motion.div>
    </div>
  );
}
