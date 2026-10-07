import { useEffect, useState, type ReactNode } from "react";
import { m } from "framer-motion";
import { Eye, EyeOff, Volume2, Square } from "lucide-react";
import type { CardDetails, GameCard } from "@flipcard/types";
import {
  CARD_FORMAT_EMOJI,
  OPTION_LETTERS,
  difficultyForLevel,
  hasAnswerSide,
  isAutoGraded,
} from "@/lib/cards/formats";
import { shuffle } from "@/lib/game/shuffle";
import { cn } from "@/lib/utils";
import { LOCALES, guessTextLanguage, useT } from "@/lib/i18n";

interface CardDisplayProps {
  card: GameCard;
  isRevealed: boolean;
  onFlip: () => void;
  /**
   * Sisi jawaban kartu kuis. Kalau tidak dikendalikan dari luar, kartu
   * menyimpan statusnya sendiri (dipakai mode coba & demo landing).
   */
  isAnswerRevealed?: boolean;
  onRevealAnswer?: () => void;
  /** Hasil yang sudah tercatat untuk kartu ini (true = benar). */
  result?: boolean;
  onResult?: (correct: boolean) => void;
}

const difficultyStyles: Record<
  GameCard["difficulty"],
  { bg: string; badge: string }
> = {
  easy: {
    bg: "from-green-400 to-emerald-500",
    badge: "bg-green-100 text-green-700",
  },
  medium: {
    bg: "from-amber-400 to-orange-500",
    badge: "bg-amber-100 text-amber-800",
  },
  hard: {
    bg: "from-rose-500 to-pink-600",
    badge: "bg-rose-100 text-rose-700",
  },
};

// Label kesulitan dibaca berbeda tergantung tipe kartu (lihat kamus
// `card.talkDifficulty` vs `card.plainDifficulty`). Di kartu talk ia menandai
// bobot emosional ("Intimate"), tapi di kartu action yang menantang itu tidak
// masuk akal — apalagi sejak deck bisa berisi tantangan saja untuk dimainkan
// bersama anak.

export function CardDisplay({
  card,
  isRevealed,
  onFlip,
  isAnswerRevealed,
  onRevealAnswer,
  result,
  onResult,
}: CardDisplayProps) {
  const t = useT();
  const [localAnswer, setLocalAnswer] = useState(false);
  const answerShown = isAnswerRevealed ?? localAnswer;
  const showAnswer = () => {
    if (onRevealAnswer) onRevealAnswer();
    else setLocalAnswer(true);
  };

  const [localResult, setLocalResult] = useState<boolean | undefined>();
  const currentResult = result ?? localResult;
  const record = (correct: boolean) => {
    setLocalResult(correct);
    onResult?.(correct);
  };

  // Pilihan pemain di pilihan ganda / mitos-fakta, untuk ditampilkan lagi di
  // sisi jawaban. Hidup selama kartu ini tampil saja.
  const [picked, setPicked] = useState<number | null>(null);

  const difficulty = card.level
    ? difficultyForLevel(card.level)
    : card.difficulty;
  const style = difficultyStyles[difficulty];
  const type = {
    emoji: CARD_FORMAT_EMOJI[card.cardType],
    ...t.formats[card.cardType],
  };
  const difficultyLabel =
    card.cardType === "talk"
      ? t.card.talkDifficulty[difficulty]
      : t.card.plainDifficulty[card.difficulty];
  const details = card.details ?? {};
  const withAnswer = hasAnswerSide(card.cardType);

  // 0 = sampul, 180 = pertanyaan, 360 = jawaban. Dua sisi fisik cukup:
  // sisi depan (0/360) berganti isi dari sampul ke jawaban saat ia sedang
  // membelakangi layar, jadi pergantiannya tidak pernah terlihat.
  const rotation = !isRevealed ? 0 : withAnswer && answerShown ? 360 : 180;

  const pick = (index: number, correct: boolean) => {
    if (answerShown) return;
    setPicked(index);
    record(correct);
    showAnswer();
  };

  const badge = card.level ? (
    <span
      className="text-sm tracking-tight text-amber-500"
      aria-label={t.common.levelOf(card.level)}
    >
      {"★".repeat(card.level)}
      <span className="text-neutral-300">{"★".repeat(5 - card.level)}</span>
    </span>
  ) : (
    <span
      className={cn(
        "text-xs px-2.5 py-1 rounded-full font-medium",
        style.badge
      )}
    >
      {difficultyLabel}
    </span>
  );

  return (
    // max-h-full menjaga kartu tetap muat di layar pendek (HP kecil /
    // lanskap) tanpa memaksa halaman ikut ter-scroll.
    <div
      className="w-full max-w-sm max-h-full aspect-[3/4] cursor-pointer no-select"
      style={{ perspective: "1200px" }}
      onClick={onFlip}
    >
      <m.div
        className="relative w-full h-full will-change-transform"
        animate={{ rotateY: rotation }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Sisi depan: sampul sebelum dibuka, jawaban setelah dibalik lagi */}
        {withAnswer && answerShown ? (
          <Face>
            <FaceHeader label={t.card.answerHeader} badge={badge} />
            <div className="flex-1 min-h-0 overflow-y-auto -mx-2 px-2">
              <AnswerBody
                card={card}
                details={details}
                picked={picked}
              />
            </div>
            {!isAutoGraded(card.cardType) && (
              <SelfGrade value={currentResult} onChange={record} />
            )}
          </Face>
        ) : (
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
              {card.level && (
                <div className="text-lg tracking-tight" aria-hidden>
                  {"★".repeat(card.level)}
                  <span className="opacity-40">
                    {"★".repeat(5 - card.level)}
                  </span>
                </div>
              )}
              <div className="text-xs opacity-75 mt-6">{t.card.tapToOpen}</div>
            </div>
          </div>
        )}

        {/* Sisi belakang: pertanyaan / isi kartu */}
        <Face back>
          <FaceHeader
            label={
              <>
                {type.emoji} {type.label}
              </>
            }
            badge={badge}
          />
          <div className="flex-1 min-h-0 overflow-y-auto -mx-2 px-2 flex flex-col">
            <QuestionBody
              card={card}
              details={details}
              active={isRevealed && !answerShown}
              onPick={pick}
            />
          </div>
          <div className="text-xs text-neutral-400 text-center pt-3 mt-3 border-t border-neutral-100">
            {withAnswer && !answerShown ? type.hint : card.sectionName}
          </div>
        </Face>
      </m.div>
    </div>
  );
}

function Face({ back, children }: { back?: boolean; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0 rounded-3xl shadow-2xl bg-white flex flex-col p-6 sm:p-8"
      style={{
        backfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

function FaceHeader({ label, badge }: { label: ReactNode; badge: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
      <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
        {label}
      </span>
      {badge}
    </div>
  );
}

/** Teks panjang (soal cerita, studi kasus) mengecil supaya tetap muat. */
function mainTextClass(text: string) {
  if (text.length > 220) return "text-base";
  if (text.length > 120) return "text-lg";
  return "text-xl md:text-2xl";
}

function stop(event: React.SyntheticEvent) {
  event.stopPropagation();
}

function QuestionBody({
  card,
  details,
  active,
  onPick,
}: {
  card: GameCard;
  details: CardDetails;
  active: boolean;
  onPick: (index: number, correct: boolean) => void;
}) {
  const t = useT();
  const prompt = (
    <p
      className={cn(
        "font-medium text-center leading-relaxed text-neutral-800",
        mainTextClass(card.content)
      )}
    >
      {card.content}
    </p>
  );

  switch (card.cardType) {
    case "multiple_choice":
      return (
        <div className="my-auto space-y-4">
          {prompt}
          <div className="space-y-2">
            {(details.options ?? []).map((option, index) => (
              <button
                key={index}
                type="button"
                disabled={!active}
                onClick={(event) => {
                  stop(event);
                  onPick(index, index === details.correctIndex);
                }}
                className="w-full flex items-start gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 text-left text-sm text-neutral-800 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <span className="font-semibold text-neutral-500">
                  {OPTION_LETTERS[index]}.
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>
      );

    case "true_false":
      return (
        <div className="my-auto space-y-6">
          {prompt}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t.card.factChoice, value: true },
              { label: t.card.mythChoice, value: false },
            ].map((choice, index) => (
              <button
                key={choice.label}
                type="button"
                disabled={!active}
                onClick={(event) => {
                  stop(event);
                  onPick(index, choice.value === details.isTrue);
                }}
                className="rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-800 hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      );

    case "clue":
      return (
        <ClueQuestion card={card} clues={details.clues ?? []} active={active} />
      );

    case "ordering":
      return <OrderingQuestion card={card} items={details.items ?? []} />;

    case "listening":
      return (
        <ListeningQuestion
          passage={card.content}
          questions={details.questions ?? []}
          active={active}
        />
      );

    default:
      return <div className="my-auto">{prompt}</div>;
  }
}

function ClueQuestion({
  card,
  clues,
  active,
}: {
  card: GameCard;
  clues: string[];
  active: boolean;
}) {
  const t = useT();
  const [shown, setShown] = useState(1);
  return (
    <div className="my-auto space-y-4">
      <p className="font-medium text-center text-lg text-neutral-800">
        {card.content}
      </p>
      <ol className="space-y-2">
        {clues.slice(0, shown).map((clue, index) => (
          <m.li
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-800"
          >
            <span className="font-semibold text-neutral-500">
              {t.card.clue(index + 1)}
            </span>{" "}
            {clue}
          </m.li>
        ))}
      </ol>
      {shown < clues.length && (
        <button
          type="button"
          disabled={!active}
          onClick={(event) => {
            stop(event);
            setShown((value) => value + 1);
          }}
          className="w-full rounded-full border border-dashed border-neutral-300 py-2 text-sm font-medium text-neutral-600 hover:border-primary/50"
        >
          {t.card.nextClue(shown, clues.length)}
        </button>
      )}
    </div>
  );
}

function OrderingQuestion({ card, items }: { card: GameCard; items: string[] }) {
  // Diacak sekali per kartu, dan dijamin tidak sama dengan urutan benarnya.
  const [scrambled] = useState(() => {
    let result = shuffle(items);
    for (let i = 0; i < 5 && result.every((item, j) => item === items[j]); i++) {
      result = shuffle(items);
    }
    return result;
  });

  return (
    <div className="my-auto space-y-4">
      <p className="font-medium text-center text-lg text-neutral-800">
        {card.content}
      </p>
      <ul className="space-y-2">
        {scrambled.map((item, index) => (
          <li
            key={index}
            className="flex gap-3 rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-800"
          >
            <span className="font-semibold text-neutral-500">
              {OPTION_LETTERS[index] ?? index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ListeningQuestion({
  passage,
  questions,
  active,
}: {
  passage: string;
  questions: { question: string }[];
  active: boolean;
}) {
  const t = useT();
  const [hidden, setHidden] = useState(false);
  const speech = useSpeech(passage);
  const stopSpeech = speech.stop;

  // Jawaban dibuka → hentikan suara. Pindah kartu ditangani unmount.
  useEffect(() => {
    if (!active) stopSpeech();
  }, [active, stopSpeech]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-amber-50 p-4">
        <p
          className={cn(
            "font-semibold leading-relaxed text-neutral-800 transition",
            passage.length > 160 ? "text-base" : "text-lg",
            hidden && "blur-md select-none"
          )}
        >
          {passage}
        </p>
        <div className="mt-3 flex gap-2">
          {speech.supported && (
            <button
              type="button"
              disabled={!active}
              onClick={(event) => {
                stop(event);
                speech.toggle();
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm"
            >
              {speech.speaking ? (
                <Square className="size-3.5" />
              ) : (
                <Volume2 className="size-3.5" />
              )}
              {speech.speaking ? t.card.stopReading : t.card.readAloud}
            </button>
          )}
          <button
            type="button"
            disabled={!active}
            onClick={(event) => {
              stop(event);
              setHidden((value) => !value);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm"
          >
            {hidden ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
            {hidden ? t.card.showText : t.card.hideText}
          </button>
        </div>
      </div>
      <div>
        <div className="mb-2 inline-block rounded-md bg-neutral-800 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
          {t.card.questions}
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-700">
          {questions.map((item, index) => (
            <li key={index}>{item.question}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function AnswerBody({
  card,
  details,
  picked,
}: {
  card: GameCard;
  details: CardDetails;
  picked: number | null;
}) {
  const t = useT();
  const explanation = details.explanation && (
    <p className="rounded-xl bg-neutral-50 px-3 py-2.5 text-sm leading-relaxed text-neutral-600">
      💡 {details.explanation}
    </p>
  );

  const big = (text: string) => (
    <p
      className={cn(
        "font-semibold text-center leading-relaxed text-neutral-900",
        mainTextClass(text)
      )}
    >
      {text}
    </p>
  );

  switch (card.cardType) {
    case "quiz":
    case "clue":
      return (
        <div className="min-h-full flex flex-col justify-center gap-4">
          {card.cardType === "quiz" && (
            <p className="text-center text-sm text-neutral-500">{card.content}</p>
          )}
          {big(details.answer ?? "")}
          {explanation}
        </div>
      );

    case "multiple_choice": {
      const options = details.options ?? [];
      const correct = details.correctIndex ?? 0;
      return (
        <div className="min-h-full flex flex-col justify-center gap-4">
          <p className="text-center text-sm text-neutral-500">{card.content}</p>
          {big(`${OPTION_LETTERS[correct]}. ${options[correct] ?? ""}`)}
          {picked !== null && (
            <Verdict
              correct={picked === correct}
              picked={`${OPTION_LETTERS[picked]}. ${options[picked]}`}
            />
          )}
          {explanation}
        </div>
      );
    }

    case "true_false": {
      return (
        <div className="min-h-full flex flex-col justify-center gap-4">
          <p className="text-center text-sm text-neutral-500">{card.content}</p>
          {big(details.isTrue ? t.card.factVerdict : t.card.mythVerdict)}
          {picked !== null && (
            <Verdict
              correct={(picked === 0) === details.isTrue}
              picked={picked === 0 ? t.card.fact : t.card.myth}
            />
          )}
          {explanation}
        </div>
      );
    }

    case "ordering":
      return (
        <div className="min-h-full flex flex-col justify-center gap-4">
          <ol className="space-y-2">
            {(details.items ?? []).map((item, index) => (
              <li
                key={index}
                className="flex gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-neutral-800"
              >
                <span className="font-bold text-emerald-700">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          {explanation}
        </div>
      );

    case "listening":
      return (
        <div className="space-y-3">
          <ol className="space-y-2.5">
            {(details.questions ?? []).map((item, index) => (
              <li key={index} className="text-sm">
                <p className="text-neutral-500">
                  {index + 1}. {item.question}
                </p>
                <p className="font-semibold text-neutral-900 pl-4">
                  {item.answer}
                </p>
              </li>
            ))}
          </ol>
          {explanation}
        </div>
      );

    default:
      return null;
  }
}

function Verdict({ correct, picked }: { correct: boolean; picked: string }) {
  const t = useT();
  return (
    <p
      className={cn(
        "rounded-xl px-3 py-2 text-center text-sm font-medium",
        correct ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      )}
    >
      {correct ? t.card.correct : t.card.wrong(picked)}
    </p>
  );
}

function SelfGrade({
  value,
  onChange,
}: {
  value: boolean | undefined;
  onChange: (correct: boolean) => void;
}) {
  const t = useT();
  return (
    <div className="shrink-0 pt-3 mt-3 border-t border-neutral-100">
      <p className="text-center text-xs text-neutral-400 mb-2">
        {t.card.selfGradeQuestion}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: t.card.selfGradeRight, correct: true, on: "bg-emerald-500 text-white border-emerald-500" },
          { label: t.card.selfGradeWrong, correct: false, on: "bg-rose-500 text-white border-rose-500" },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={(event) => {
              stop(event);
              onChange(option.correct);
            }}
            className={cn(
              "rounded-full border py-1.5 text-sm font-medium transition-colors",
              value === option.correct
                ? option.on
                : "border-neutral-200 text-neutral-700"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Bacakan teks dengan suara bawaan perangkat (Web Speech API). */
function useSpeech(text: string) {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const [speaking, setSpeaking] = useState(false);

  const [controls] = useState(() => ({
    stop() {
      if (!supported) return;
      window.speechSynthesis.cancel();
      setSpeaking(false);
    },
  }));

  useEffect(() => () => controls.stop(), [controls]);

  return {
    supported,
    speaking,
    stop: controls.stop,
    toggle() {
      if (!supported) return;
      if (speaking) {
        controls.stop();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      // Suara mengikuti bahasa teksnya, bukan bahasa aplikasi: deck bawaan
      // berbahasa Indonesia, deck AI bisa berbahasa Inggris.
      utterance.lang = LOCALES[guessTextLanguage(text)];
      utterance.rate = 0.9;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    },
  };
}
