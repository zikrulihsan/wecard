import { useCallback, useSyncExternalStore } from "react";

/**
 * Berapa deck berbeda yang boleh dimainkan sebelum diminta daftar/masuk.
 * Deck yang sudah pernah dibuka tetap bisa diulang — yang dibatasi hanya
 * membuka deck baru.
 */
export const TRIAL_DECK_LIMIT = 2;

const STORAGE_KEY = "flipcard:trial-decks";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
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

/** Slug deck yang sudah pernah dibuka di perangkat ini. */
export function useTriedDecks() {
  // Snapshot berupa string mentah supaya identitasnya stabil antar-render.
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const tried = parse(raw);

  const markTried = useCallback((slug: string) => {
    const current = parse(read());
    if (current.includes(slug)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, slug]));
    } catch {
      // Penyimpanan diblokir (mode privat) — biarkan tetap bisa main.
    }
    listeners.forEach((listener) => listener());
  }, []);

  const canOpen = (slug: string) =>
    tried.includes(slug) || tried.length < TRIAL_DECK_LIMIT;

  return {
    tried,
    remaining: Math.max(TRIAL_DECK_LIMIT - tried.length, 0),
    canOpen,
    markTried,
  };
}
