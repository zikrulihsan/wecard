import { useState, type ReactNode } from "react";
import { AnimatePresence, m, type Variants } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { CardDisplay } from "@/components/cards/card-display";
import { GameProgressBar } from "@/components/game/progress-bar";
import { Button } from "@/components/ui/button";
import { hasAnswerSide } from "@/lib/cards/formats";
import { deckThemeStyle, deckThemeVars } from "@/lib/deck-theme";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { DeckLanguage, DeckTheme, GameCard } from "@flipcard/types";

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
 * Layar main yang hidup di state lokal — untuk link main dan preview deck
 * premium. Sengaja tidak memakai `useGameStore`: store itu dipersist dan
 * milik sesi pemain yang sudah login. Begitu kartu habis, `renderDone`
 * menggambar layar selesainya dengan hasil kuis.
 */
export function LocalPlay({
  theme,
  language,
  cards,
  badge,
  onExit,
  renderDone,
}: {
  theme: DeckTheme;
  language: DeckLanguage;
  cards: GameCard[];
  /** Label kecil di pojok kanan atas, mis. nama pemain atau "Preview". */
  badge?: string;
  onExit: () => void;
  renderDone: (results: Record<string, boolean>) => ReactNode;
}) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [direction, setDirection] = useState(1);
  const style = deckThemeStyle(theme);

  if (index >= cards.length) return <>{renderDone(results)}</>;

  const card = cards[index];
  const awaitingAnswer = revealed && hasAnswerSide(card.cardType) && !answerRevealed;
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
  const exit = () => {
    if (confirm(t.game.confirmExit)) onExit();
  };

  return (
    <div
      style={deckThemeVars(theme)}
      className={cn("flex h-dvh min-h-[26rem] flex-col overflow-hidden bg-gradient-to-br", style.play)}
    >
      <header className="flex shrink-0 items-center gap-1 px-4 pt-3 pb-2">
        <Button variant="ghost" size="icon" onClick={exit} className="shrink-0 rounded-full" aria-label={t.common.exit}>
          <X className="size-5" />
        </Button>
        <div className="flex-1 px-2">
          <GameProgressBar current={index} total={cards.length} />
        </div>
        {badge && (
          <span className="max-w-[8rem] shrink-0 truncate rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-600">
            {badge}
          </span>
        )}
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <m.div
            key={card.id}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center px-6 py-2"
          >
            <CardDisplay
              card={card}
              isRevealed={revealed}
              onFlip={() => setRevealed(true)}
              isAnswerRevealed={answerRevealed}
              onRevealAnswer={() => setAnswerRevealed(true)}
              language={language}
              result={results[card.id]}
              onResult={(correct) => setResults((value) => ({ ...value, [card.id]: correct }))}
            />
          </m.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {!revealed ? (
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
              <Button onClick={() => setAnswerRevealed(true)} size="lg" className="flex-1 rounded-full">
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
