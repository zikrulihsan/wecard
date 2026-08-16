"use client";

import { m } from "framer-motion";

export function GameProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const progress = total === 0 ? 0 : Math.min(current / total, 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
        <span>
          Kartu {Math.min(current + 1, total)} dari {total}
        </span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        {/* scaleX, bukan width — animasi width memicu layout per frame */}
        <m.div
          className="h-full w-full origin-left bg-gradient-to-r from-pink-500 to-rose-500"
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
