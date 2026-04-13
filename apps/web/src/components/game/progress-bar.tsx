"use client";

import { motion } from "framer-motion";

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
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
