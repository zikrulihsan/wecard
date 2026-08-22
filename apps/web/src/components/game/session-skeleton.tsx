import type { DeckTheme } from "@flipcard/types";
import { deckThemeStyle } from "@/lib/deck-theme";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Kerangka layar main. Dipakai dua kali: sebagai loading.tsx rute sesi, dan
 * sebagai tampilan sementara di dalam halaman selagi store zustand dipulihkan
 * dari localStorage. Bentuknya sengaja sama persis dengan layar aslinya
 * supaya kartu tidak "melompat" masuk saat sesi siap.
 *
 * `theme` belum diketahui saat dirender dari loading.tsx (temanya baru terbaca
 * dari store di client), jadi warnanya jatuh ke tema bawaan sampai sesi siap.
 */
export function SessionSkeleton({ theme }: { theme?: DeckTheme }) {
  return (
    <div
      className={cn(
        "flex flex-col h-[calc(100dvh-var(--bottom-nav-h))] min-h-[26rem] overflow-hidden bg-gradient-to-br",
        deckThemeStyle(theme).play
      )}
    >
      <header className="shrink-0 flex items-center gap-1 px-4 pt-3 pb-2">
        <Skeleton className="size-8 rounded-full shrink-0" />
        <div className="flex-1 px-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="size-8 shrink-0" />
      </header>

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-6 py-2">
        <Skeleton className="w-full max-w-sm max-h-full aspect-[3/4] rounded-3xl" />
      </div>

      <div className="shrink-0 px-6 pt-3 pb-4 space-y-2">
        <Skeleton className="h-9 w-full rounded-full" />
        <div className="h-4" />
      </div>
    </div>
  );
}
