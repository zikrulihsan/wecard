/** Skor akhir sesi yang berisi kartu kuis. */
export function QuizScore({ correct, total }: { correct: number; total: number }) {
  const percent = Math.round((correct / total) * 100);
  const message =
    percent >= 80
      ? "Mantap, kamu sudah menguasai deck ini!"
      : percent >= 50
        ? "Lumayan! Ulangi sekali lagi supaya makin nempel."
        : "Masih banyak yang bisa dipelajari — coba lagi, ya.";
  return (
    <div className="space-y-2">
      <div className="text-5xl font-bold">
        {correct}
        <span className="text-2xl text-muted-foreground">/{total}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        jawaban benar ({percent}%)
      </p>
      <p className="text-muted-foreground leading-relaxed">{message}</p>
    </div>
  );
}
