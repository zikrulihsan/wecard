import type { CardType } from "@flipcard/types";
import { hasAnswerSide } from "@/lib/cards/formats";
import { useT } from "@/lib/i18n";

/**
 * Skor kuis satu putaran. Penyebutnya semua kartu berjawaban yang dimainkan,
 * bukan hanya yang sempat dinilai: kartu yang dilewati tanpa memilih
 * Benar/Salah dihitung belum benar, jadi 8 soal tetap tampil "x/8".
 */
export function scoreQuiz(
  cards: { id: string; cardType: CardType }[],
  results: Record<string, boolean>
) {
  const quiz = cards.filter((card) => hasAnswerSide(card.cardType));
  const correct = quiz.filter((card) => results[card.id] === true).length;
  const skipped = quiz.filter((card) => results[card.id] === undefined).length;
  return { correct, total: quiz.length, skipped };
}

/** Skor akhir sesi yang berisi kartu kuis. */
export function QuizScore({
  correct,
  total,
  skipped = 0,
}: {
  correct: number;
  total: number;
  skipped?: number;
}) {
  const t = useT();
  const percent = Math.round((correct / total) * 100);
  const message =
    percent >= 80
      ? t.game.scoreGreat
      : percent >= 50
        ? t.game.scoreOkay
        : t.game.scoreLow;
  return (
    <div className="space-y-2">
      <div className="text-5xl font-bold">
        {correct}
        <span className="text-2xl text-muted-foreground">/{total}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t.game.scoreLabel(percent)}
      </p>
      {skipped > 0 && (
        <p className="text-xs text-muted-foreground">{t.game.scoreSkipped(skipped)}</p>
      )}
      <p className="text-muted-foreground leading-relaxed">{message}</p>
    </div>
  );
}
