"use client";

import { useRef } from "react";
import { DeckCard } from "./deck-card";

const sampleCards = [
  {
    theme: "pink",
    kind: "Talk",
    deck: "Pasangan",
    content: "Hal apa dari aku yang bikin kamu merasa dicintai?",
  },
  {
    theme: "pink",
    kind: "Action",
    deck: "Pasangan",
    content: "Ceritakan 1 hal lucu hari ini dengan gaya lebay 😄",
  },
  {
    theme: "pink",
    kind: "Talk",
    deck: "Pasangan",
    content: "Apa kelebihan aku yang jarang aku sadari?",
  },
  {
    theme: "sky",
    kind: "Talk",
    deck: "Anak & Orang Tua",
    content: "Apa kegiatan bareng yang paling kamu tunggu-tunggu?",
  },
  {
    theme: "sky",
    kind: "Talk",
    deck: "Anak & Orang Tua",
    content: "Ada cerita yang ingin kamu bagi ke aku tapi belum sempat?",
  },
  {
    theme: "sky",
    kind: "Talk",
    deck: "Anak & Orang Tua",
    content: "Kenangan bareng kita yang paling kamu ingat sampai sekarang apa?",
  },
] as const;

export function SampleCardCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);

  function moveCarousel(direction: -1 | 1) {
    const carousel = carouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth * 0.85,
      behavior: "smooth",
    });
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
          onClick={() => moveCarousel(-1)}
          aria-label="Geser contoh kartu ke kiri"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
          onClick={() => moveCarousel(1)}
          aria-label="Geser contoh kartu ke kanan"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Carousel contoh kartu lainnya"
        tabIndex={0}
      >
        {sampleCards.map((card) => (
          <div
            key={`${card.deck}-${card.kind}-${card.content}`}
            className="min-w-[85%] snap-start sm:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.667rem)]"
          >
            <DeckCard
              theme={card.theme}
              kind={card.kind}
              deck={card.deck}
              className="h-44 w-full"
            >
              {card.content}
            </DeckCard>
          </div>
        ))}
      </div>
    </div>
  );
}
