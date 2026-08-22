"use client";

import { useState } from "react";
import type { GameCard } from "@flipcard/types";
import { CardDisplay } from "@/components/cards/card-display";

const demoCard: GameCard = {
  id: "landing-demo",
  content: "Hal kecil apa yang aku lakukan dan diam-diam selalu bikin kamu senang?",
  cardType: "talk",
  difficulty: "medium",
  specialKind: null,
  sectionName: "Appreciation",
  sectionSlug: "appreciation",
};

export function LandingCardDemo() {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-[20rem]">
      <div
        aria-hidden="true"
        className="absolute inset-4 translate-x-5 rotate-6 rounded-3xl bg-pink-200/70 shadow-lg"
      />
      <div
        aria-hidden="true"
        className="absolute inset-4 -translate-x-5 -rotate-6 rounded-3xl bg-orange-100/90 shadow-lg"
      />

      <div className="relative aspect-[3/4]">
        <CardDisplay
          card={demoCard}
          isRevealed={isRevealed}
          onFlip={() => setIsRevealed((revealed) => !revealed)}
        />
      </div>

      <button
        type="button"
        className="relative mx-auto mt-5 flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
        onClick={() => setIsRevealed((revealed) => !revealed)}
        aria-label={isRevealed ? "Tutup kartu contoh" : "Buka kartu contoh"}
      >
        <span aria-hidden="true">↻</span>
        {isRevealed ? "Balik lagi" : "Coba balik kartunya"}
      </button>
    </div>
  );
}
