import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readCache, removeCache, writeCache } from "@/lib/cache";
import type { AiAccess } from "./access";

/**
 * Saldo dan status AI dibaca lewat fungsi Netlify (cold start + verifikasi
 * token + tiga kueri), jadi lambat. Nilai terakhir disimpan lokal: beranda,
 * tab bawah, dan toko langsung tampil dengan nilai itu lalu menyegarkannya.
 * Setiap aksi yang mengubah saldo/draf memanggil `invalidateAiAccess()`.
 */
const CACHE_KEY = "ai-access";
/** Selama ini nilai di memori dipakai tanpa bertanya ulang ke server. */
const FRESH_MS = 30_000;

type Entry = { userId: string; value: AiAccess; at: number };

let inFlight: { userId: string; promise: Promise<AiAccess> } | null = null;

/** Nilai terakhir yang diketahui (boleh basi), tanpa jaringan. */
export function peekAiAccess(): AiAccess | null {
  return readCache<Entry>(CACHE_KEY)?.value ?? null;
}

export async function fetchAiAccessDetails(): Promise<AiAccess> {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) throw new Error("Belum login");
  const userId = session.user.id;
  const cached = readCache<Entry>(CACHE_KEY);
  if (cached?.userId === userId && Date.now() - cached.at < FRESH_MS) return cached.value;
  if (inFlight?.userId === userId) return inFlight.promise;

  const promise = fetch("/api/ai-access", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  }).then(async (response) => {
    if (!response.ok) throw new Error("Gagal membaca jatah AI");
    const value = await response.json() as AiAccess;
    writeCache<Entry>(CACHE_KEY, { userId, value, at: Date.now() }, { persist: true });
    return value;
  }).finally(() => { if (inFlight?.userId === userId) inFlight = null; });
  inFlight = { userId, promise };
  return promise;
}

export function invalidateAiAccess() {
  removeCache(CACHE_KEY);
  inFlight = null;
}

/**
 * Status AI untuk komponen: nilai tersimpan langsung, lalu disegarkan.
 * `error` hanya true kalau penyegaran gagal dan tidak ada nilai tersimpan.
 */
export function useAiAccess(refreshKey?: unknown) {
  const [access, setAccess] = useState<AiAccess | null>(peekAiAccess);
  // Gagal untuk `refreshKey` mana — percobaan ulang dengan kunci baru
  // langsung kembali ke "memuat", bukan menahan pesan gagal yang lama.
  const [failed, setFailed] = useState<{ key: unknown } | null>(null);
  useEffect(() => {
    let active = true;
    fetchAiAccessDetails().then((value) => {
      if (active) { setAccess(value); setFailed(null); }
    }).catch((cause) => {
      console.error("[ai-access] gagal membaca saldo kredit", cause);
      if (active) setFailed({ key: refreshKey });
    });
    return () => { active = false; };
  }, [refreshKey]);
  return { access, error: failed?.key === refreshKey && !access, setAccess };
}
