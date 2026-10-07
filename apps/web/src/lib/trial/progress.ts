import { useCallback, useSyncExternalStore } from "react";

const DEFAULT_TRIAL_FREE_CARDS = 4;

/**
 * Berapa kartu pertama tiap deck yang boleh dimainkan tanpa akun. Semua deck
 * coba bisa dibuka; yang dikunci hanya kartu sesudahnya, jadi orang sempat
 * merasakan setiap jenis deck sebelum diminta masuk.
 *
 * Diatur lewat `VITE_TRIAL_FREE_CARDS`. Nilainya ditanam saat build, jadi
 * mengubahnya di hosting perlu redeploy. Kosong atau tidak valid → bawaan 4.
 */
export const TRIAL_FREE_CARDS = parseLimit(import.meta.env.VITE_TRIAL_FREE_CARDS);

function parseLimit(value: unknown): number {
  const parsed = Number(value);
  return typeof value === "string" && value.trim() !== "" && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_TRIAL_FREE_CARDS;
}

/** Banyak kartu yang terbuka tanpa akun untuk deck berisi `total` kartu. */
export function freeCardCount(total: number): number {
  return Math.min(total, TRIAL_FREE_CARDS);
}

const STORAGE_KEY = "flipcard:trial-progress";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

function parse(raw: string): Record<string, number> {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(
        (entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] > 0
      )
    );
  } catch {
    return {};
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Kartu terjauh yang sudah dilihat per deck coba di perangkat ini. Dipakai
 * halaman coba untuk menunjukkan berapa kartu gratis yang sudah dimainkan.
 */
export function useTrialProgress() {
  // Snapshot berupa string mentah supaya identitasnya stabil antar-render.
  const raw = useSyncExternalStore(subscribe, read, () => "{}");
  const seen = parse(raw);

  const markSeen = useCallback((slug: string, count: number) => {
    const current = parse(read());
    if ((current[slug] ?? 0) >= count) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, [slug]: count }));
    } catch {
      // Penyimpanan diblokir (mode privat) — biarkan tetap bisa main.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { seen, markSeen };
}
