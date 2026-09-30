"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Hitung mundur untuk satu kartu. Dipasang dengan `key` id kartu, jadi setiap
 * kartu baru mulai dari durasi penuh tanpa perlu logika reset.
 *
 * Waktu dihitung dari tenggat (Date.now), bukan dari jumlah tick — interval
 * browser bisa melambat saat tab di latar belakang, dan timer tidak boleh
 * ikut molor karenanya.
 */
export function CardTimer({
  seconds,
  running,
  onExpire,
}: {
  seconds: number;
  /** Timer baru berjalan setelah kartu dibuka. */
  running: boolean;
  onExpire: () => void;
}) {
  const [remainingMs, setRemainingMs] = useState(seconds * 1000);
  const [paused, setPaused] = useState(false);
  // Naik setiap kali timer di-reset, supaya interval menghitung tenggat baru
  // meskipun timer sedang berjalan (active tetap true).
  const [runId, setRunId] = useState(0);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const expired = remainingMs <= 0;
  const active = running && !paused && !expired;

  useEffect(() => {
    if (!active) return;
    const deadline = Date.now() + remainingMs;
    const id = window.setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      setRemainingMs(left);
      if (left === 0) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
    // remainingMs sengaja tidak jadi dependensi: tenggat hanya dihitung ulang
    // saat timer mulai/lanjut, bukan setiap tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, runId]);

  // Jeda singkat sebelum onExpire supaya "Habis!" sempat terbaca sebelum
  // kartu berganti. Dibersihkan saat unmount, jadi kalau pemain sudah pindah
  // kartu sendiri dalam jeda ini, kartu tidak ikut terlewat dua kali.
  useEffect(() => {
    if (!expired) return;
    navigator.vibrate?.(200);
    const id = window.setTimeout(() => onExpireRef.current(), 800);
    return () => window.clearTimeout(id);
  }, [expired]);

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const warning = !expired && remainingSeconds <= 10 && running;
  const canReset = running && remainingMs < seconds * 1000;

  const reset = () => {
    setRemainingMs(seconds * 1000);
    setPaused(false);
    setRunId((n) => n + 1);
  };

  return (
    <div className="shrink-0 flex items-center gap-1">
      <button
        type="button"
        onClick={() => running && !expired && setPaused((p) => !p)}
        disabled={!running || expired}
        aria-label={
          expired
            ? "Waktu habis"
            : paused
              ? `Timer dijeda, sisa ${remainingSeconds} detik. Ketuk untuk lanjut`
              : `Sisa ${remainingSeconds} detik. Ketuk untuk jeda`
        }
        className={cn(
          "shrink-0 h-8 min-w-[4.5rem] px-2.5 rounded-full flex items-center justify-center gap-1 text-xs font-semibold tabular-nums transition-colors",
          expired
            ? "bg-destructive text-white"
            : warning
              ? "bg-destructive/15 text-destructive animate-pulse"
              : "bg-white/70 text-foreground",
          !running && "opacity-60"
        )}
      >
        {paused ? (
          <Pause className="size-3.5" />
        ) : (
          <Timer className="size-3.5" />
        )}
        {expired ? "Habis!" : formatTime(remainingSeconds)}
      </button>
      <button
        type="button"
        onClick={reset}
        disabled={!canReset}
        aria-label="Ulangi timer"
        className="size-8 rounded-full flex items-center justify-center bg-white/70 text-foreground transition-opacity disabled:opacity-40"
      >
        <RotateCcw className="size-3.5" />
      </button>
    </div>
  );
}
