import { useSyncExternalStore } from "react";

/**
 * Deck yang terakhir dimainkan di perangkat ini, terbaru di depan. Dipakai
 * beranda untuk baris "Terakhir dimainkan". Disimpan lokal saja — tabel
 * `game_sessions` belum diisi aplikasi, dan riwayat ini cukup per perangkat.
 */
const STORAGE_KEY = "flipcard:recent-decks";
const MAX_RECENT = 8;
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

/** Catat deck sebagai yang paling baru dimainkan. */
export function markDeckPlayed(deckId: string) {
  const next = [deckId, ...parse(read()).filter((id) => id !== deckId)].slice(0, MAX_RECENT);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Penyimpanan diblokir (mode privat) — riwayat memang opsional.
  }
  listeners.forEach((listener) => listener());
}

/** Id deck yang terakhir dimainkan, terbaru di depan. */
export function useRecentDeckIds(): string[] {
  // Snapshot berupa string mentah supaya identitasnya stabil antar-render.
  return parse(useSyncExternalStore(subscribe, read, () => "[]"));
}
