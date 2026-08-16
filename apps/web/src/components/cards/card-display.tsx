"use client";

import { m } from "framer-motion";
import type { GameCard } from "@wecard/types";
import { cn } from "@/lib/utils";

interface CardDisplayProps {
  card: GameCard;
  isRevealed: boolean;
  onFlip: () => void;
}

const difficultyStyles: Record<
  GameCard["difficulty"],
  { bg: string; badge: string; label: string }
> = {
  easy: {
    bg: "from-green-400 to-emerald-500",
    badge: "bg-green-100 text-green-700",
    label: "Santai",
  },
  medium: {
    bg: "from-amber-400 to-orange-500",
    badge: "bg-amber-100 text-amber-800",
    label: "Dalam",
  },
  hard: {
    bg: "from-rose-500 to-pink-600",
    badge: "bg-rose-100 text-rose-700",
    label: "Intimate",
  },
};

const typeStyles: Record<
  GameCard["cardType"],
  { emoji: string; label: string }
> = {
  talk: { emoji: "💬", label: "TALK" },
  action: { emoji: "🎯", label: "ACTION" },
  special: { emoji: "✨", label: "SPECIAL" },
};

export function CardDisplay({ card, isRevealed, onFlip }: CardDisplayProps) {
  const style = difficultyStyles[card.difficulty];
  const type = typeStyles[card.cardType];

  return (
    <div
      className="w-full aspect-[3/4] max-w-sm mx-auto cursor-pointer no-select"
      style={{ perspective: "1200px" }}
      onClick={onFlip}
    >
      <m.div
        className="relative w-full h-full will-change-transform"
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card back (what you see first) */}
        <div
          className={cn(
            "absolute inset-0 rounded-3xl shadow-2xl flex items-center justify-center p-8",
            "bg-gradient-to-br",
            style.bg
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center text-white space-y-4">
            <div className="text-6xl">{type.emoji}</div>
            <div className="text-sm uppercase tracking-widest font-semibold opacity-90">
              {type.label}
            </div>
            <div className="text-xs opacity-75 mt-6">Ketuk untuk buka</div>
          </div>
        </div>

        {/* Card front (revealed content) */}
        <div
          className="absolute inset-0 rounded-3xl shadow-2xl bg-white flex flex-col p-8"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
              {type.emoji} {type.label}
            </span>
            <span
              className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium",
                style.badge
              )}
            >
              {style.label}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl md:text-2xl font-medium text-center leading-relaxed text-neutral-800">
              {card.content}
            </p>
          </div>

          <div className="text-xs text-neutral-400 text-center pt-4 border-t border-neutral-100">
            {card.sectionName}
          </div>
        </div>
      </m.div>
    </div>
  );
}
