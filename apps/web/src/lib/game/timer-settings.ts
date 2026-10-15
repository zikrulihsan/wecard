import type { CardTimerSettings } from "@flipcard/types";
import type { Messages } from "@/lib/i18n/messages/id";

// Pilihan durasi timer per kartu, dalam detik. 0 = tanpa timer.
export const TIMER_OPTIONS = [0, 30, 60, 90, 120, 180] as const;

// Pilihan terakhir diingat di perangkat ini supaya tidak perlu diatur ulang
// setiap main. Gagal baca/tulis (mode privat, storage diblokir) tidak apa-apa.
const TIMER_STORAGE_KEY = "flipcard-timer-settings";

export const DEFAULT_TIMER: CardTimerSettings = { seconds: 0, autoAdvance: false };

export function readStoredTimer(): string | null {
  try {
    return localStorage.getItem(TIMER_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Durasi di luar pilihan dianggap tanpa timer. */
export function normalizeTimer(seconds: unknown, autoAdvance: unknown): CardTimerSettings {
  return {
    seconds: TIMER_OPTIONS.includes(seconds as (typeof TIMER_OPTIONS)[number])
      ? (seconds as number)
      : 0,
    autoAdvance: autoAdvance === true,
  };
}

export function parseTimerSettings(raw: string | null): CardTimerSettings {
  if (!raw) return DEFAULT_TIMER;
  try {
    const parsed = JSON.parse(raw) as Partial<CardTimerSettings>;
    return normalizeTimer(parsed.seconds, parsed.autoAdvance);
  } catch {
    return DEFAULT_TIMER;
  }
}

export function saveTimerSettings(settings: CardTimerSettings) {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // abaikan
  }
}

export function timerLabel(seconds: number, t: Messages["picker"]) {
  if (seconds === 0) return t.timerOff;
  if (seconds < 60) return t.seconds(seconds);
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? t.minutes(minutes) : t.seconds(seconds);
}
