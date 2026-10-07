import { useT } from "@/lib/i18n";

/** Skor akhir sesi yang berisi kartu kuis. */
export function QuizScore({ correct, total }: { correct: number; total: number }) {
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
      <p className="text-muted-foreground leading-relaxed">{message}</p>
    </div>
  );
}
