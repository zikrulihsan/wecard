import { createClient } from "@/lib/supabase/client";
import type { AiAccess } from "./access";

let cached: { userId: string; value: AiAccess } | null = null;
let inFlight: { userId: string; promise: Promise<AiAccess> } | null = null;

export async function fetchAiAccessDetails(): Promise<AiAccess> {
  const { data: { session } } = await createClient().auth.getSession();
  if (!session) throw new Error("Belum login");
  const userId = session.user.id;
  if (cached?.userId === userId) return cached.value;
  if (inFlight?.userId === userId) return inFlight.promise;

  const promise = fetch("/api/ai-access", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  }).then(async (response) => {
    if (!response.ok) throw new Error("Gagal membaca jatah AI");
    const value = await response.json() as AiAccess;
    cached = { userId, value };
    return value;
  }).finally(() => { if (inFlight?.userId === userId) inFlight = null; });
  inFlight = { userId, promise };
  return promise;
}

export function invalidateAiAccess() {
  cached = null;
  inFlight = null;
}
