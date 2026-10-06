import { useRef, useState } from "react";
import { m } from "framer-motion";
import type { GameCard } from "@flipcard/types";
import { CardDisplay } from "@/components/cards/card-display";
import { hasAnswerSide } from "@/lib/cards/formats";

// Satu kartu per keluarga format, supaya pengunjung merasakan alur ngobrol
// dan alur kuis (balik dua kali) dari satu demo. Isinya dikutip dari deck
// bawaan dan deck coba.
const demoCards: GameCard[] = [
  {
    id: "landing-demo-appreciation",
    content:
      "Hal kecil apa yang aku lakukan dan diam-diam selalu bikin kamu senang?",
    cardType: "talk",
    difficulty: "medium",
    specialKind: null,
    sectionName: "Apresiasi",
    sectionSlug: "apresiasi",
  },
  {
    id: "landing-demo-myth",
    content: "Kelelawar itu buta.",
    cardType: "true_false",
    difficulty: "easy",
    level: 2,
    details: {
      isTrue: false,
      explanation:
        "Kelelawar bisa melihat. Banyak jenisnya juga memakai ekolokasi untuk berburu dalam gelap.",
    },
    specialKind: null,
    sectionName: "Kuis Pengetahuan",
    sectionSlug: "kuis-pengetahuan",
  },
  {
    id: "landing-demo-choice",
    content: "Pulau terbesar di Indonesia adalah…",
    cardType: "multiple_choice",
    difficulty: "easy",
    level: 2,
    details: {
      options: ["Sumatra", "Kalimantan", "Papua", "Sulawesi"],
      correctIndex: 2,
      explanation:
        "Papua adalah pulau terbesar kedua di dunia setelah Greenland.",
    },
    specialKind: null,
    sectionName: "Kuis Pengetahuan",
    sectionSlug: "kuis-pengetahuan",
  },
  {
    id: "landing-demo-listening",
    content:
      "Karena ban sepeda kempis, Rara memutuskan untuk naik bus, lalu pergi ke pusat kegiatan anak.",
    cardType: "listening",
    difficulty: "hard",
    level: 4,
    details: {
      questions: [
        { question: "Apa yang terjadi?", answer: "Ban sepeda Rara kempis" },
        { question: "Apa yang diputuskan Rara?", answer: "Naik bus" },
        {
          question: "Mengapa Rara melakukan itu?",
          answer: "Karena ban sepedanya kempis",
        },
      ],
    },
    specialKind: null,
    sectionName: "Latihan Mendengar",
    sectionSlug: "latihan-mendengar",
  },
];

const swipeThreshold = 60;

export function LandingCardDemo() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const currentCard = demoCards[currentIndex];
  const withAnswer = hasAnswerSide(currentCard.cardType);

  // Sampul → soal → (kartu kuis) jawaban → kembali ke sampul.
  function flip() {
    if (!isRevealed) {
      setIsRevealed(true);
    } else if (withAnswer && !isAnswerRevealed) {
      setIsAnswerRevealed(true);
    } else {
      setIsRevealed(false);
      setIsAnswerRevealed(false);
    }
  }

  const flipLabel = !isRevealed
    ? "Balik kartunya"
    : withAnswer && !isAnswerRevealed
      ? "Lihat jawaban"
      : "Balik lagi";
  const [direction, setDirection] = useState(1);
  const isDragging = useRef(false);

  function moveCard(step: -1 | 1) {
    setDirection(step);
    setCurrentIndex(
      (index) => (index + step + demoCards.length) % demoCards.length
    );
    setIsRevealed(false);
    setIsAnswerRevealed(false);
  }

  function selectCard(index: number) {
    if (index === currentIndex) return;

    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsRevealed(false);
    setIsAnswerRevealed(false);
  }

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
        <m.div
          key={currentCard.id}
          className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          initial={{ x: direction * 70, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          dragMomentum={false}
          whileDrag={{ scale: 0.98 }}
          onDragStart={() => {
            isDragging.current = true;
          }}
          onDragEnd={(_, info) => {
            if (
              info.offset.x < -swipeThreshold ||
              info.velocity.x < -500
            ) {
              moveCard(1);
            } else if (
              info.offset.x > swipeThreshold ||
              info.velocity.x > 500
            ) {
              moveCard(-1);
            }

            window.setTimeout(() => {
              isDragging.current = false;
            }, 0);
          }}
        >
          <CardDisplay
            card={currentCard}
            isRevealed={isRevealed}
            isAnswerRevealed={isAnswerRevealed}
            onRevealAnswer={() => setIsAnswerRevealed(true)}
            onFlip={() => {
              if (!isDragging.current) flip();
            }}
          />
        </m.div>
      </div>

      <div className="relative mt-5 flex items-center justify-center gap-2">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm transition hover:border-pink-300 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
          onClick={() => moveCard(-1)}
          aria-label="Kartu sebelumnya"
        >
          <span aria-hidden="true">←</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-pink-200 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
          onClick={flip}
          aria-label={flipLabel}
        >
          <span aria-hidden="true">↻</span>
          {flipLabel}
        </button>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-600 shadow-sm transition hover:border-pink-300 hover:text-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
          onClick={() => moveCard(1)}
          aria-label="Kartu berikutnya"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <div
        className="relative mt-3 flex items-center justify-center gap-2"
        aria-label={`Kartu ${currentIndex + 1} dari ${demoCards.length}`}
      >
        {demoCards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            className={`size-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-pink-500" : "bg-neutral-300"
            }`}
            onClick={() => selectCard(index)}
            aria-label={`Tampilkan kartu ${index + 1}`}
            aria-current={index === currentIndex ? "true" : undefined}
          />
        ))}
      </div>

      <p className="relative mt-2 text-center text-xs text-neutral-500">
        Geser kanan atau kiri · {currentIndex + 1}/{demoCards.length}
      </p>
    </div>
  );
}
