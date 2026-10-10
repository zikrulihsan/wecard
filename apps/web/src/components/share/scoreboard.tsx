import { Trophy } from "lucide-react";
import type { ScoreRow } from "@/lib/share/api";
import { LOCALES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];

/** Papan skor grup untuk deck kuis yang dimainkan lewat link. */
export function Scoreboard({
  rows,
  status,
  playerName,
}: {
  rows: ScoreRow[];
  status: "loading" | "error" | "ready";
  playerName: string;
}) {
  const { t, language } = useI18n();
  const me = playerName.toLocaleLowerCase(LOCALES[language]);
  return (
    <section aria-labelledby="scoreboard-title" className="rounded-2xl bg-white/80 p-4 text-left shadow-sm">
      <h2 id="scoreboard-title" className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
        <Trophy className="size-4 text-amber-500" />
        {t.share.scoreboard}
      </h2>
      {status === "loading" ? (
        <p className="text-sm text-muted-foreground">{t.share.scoreboardLoading}…</p>
      ) : status === "error" ? (
        <p className="text-sm text-muted-foreground">{t.share.scoreboardError}</p>
      ) : (
        <>
          <ol className="space-y-1">
            {rows.map((row, index) => {
              const isMe = row.name.toLocaleLowerCase(LOCALES[language]) === me;
              return (
                <li
                  key={`${row.name}-${index}`}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                    isMe && "bg-primary/10 font-semibold",
                  )}
                >
                  <span className="w-6 shrink-0 text-center tabular-nums text-muted-foreground">
                    {MEDALS[index] ?? index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {row.name}
                    {isMe && <span className="ml-1 font-normal text-muted-foreground">({t.share.you})</span>}
                  </span>
                  <span className="shrink-0 tabular-nums">{row.correct}/{row.total}</span>
                </li>
              );
            })}
          </ol>
          {rows.length <= 1 && <p className="mt-2 text-xs text-muted-foreground">{t.share.scoreboardEmpty}</p>}
        </>
      )}
    </section>
  );
}
