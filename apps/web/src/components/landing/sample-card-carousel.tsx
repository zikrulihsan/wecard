import { useRef } from "react";
import { DeckCard } from "./deck-card";
import { useT } from "@/lib/i18n";

// Isi kartunya ada di kamus i18n (`landing.samples.cards`): dikutip apa
// adanya dari seed.sql, seed_anak_orang_tua.sql, seed_kuis_mendengar.sql, dan
// deck coba. Selang-seling obrolan dan kuis supaya keduanya kelihatan tanpa
// harus menggeser jauh.

export function SampleCardCarousel() {
  const samples = useT().landing.samples;
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
      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={samples.carouselLabel}
        tabIndex={0}
      >
        {samples.cards.map((card) => (
          <div
            key={`${card.deck}-${card.kind}-${card.content}`}
            className="min-w-[85%] snap-start sm:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.667rem)]"
          >
            <DeckCard
              theme={card.theme}
              kind={card.kind}
              deck={card.deck}
              level={card.level}
              answer={card.level !== undefined}
              className="h-48 w-full"
            >
              {card.content}
            </DeckCard>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-center gap-2">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:text-pink-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 active:translate-y-0"
          onClick={() => moveCarousel(-1)}
          aria-label={samples.carouselPrev}
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:border-pink-300 hover:text-pink-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 active:translate-y-0"
          onClick={() => moveCarousel(1)}
          aria-label={samples.carouselNext}
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
