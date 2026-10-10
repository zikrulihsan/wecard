import type { SupabaseClient } from "@supabase/supabase-js";
import { AI_GENERATION_LIMIT } from "./quota";

export interface AiAccess {
  /** `profiles.ai_enabled` — sakelar pemutus untuk akun yang menyalahgunakan. */
  enabled: boolean;
  unlimited: boolean;
  /** Saldo kredit. 1 kredit = 1 deck jadi. */
  balance: number;
  /** Bisa membuat draf baru: akses aktif dan (tanpa batas atau saldo ≥ 1). */
  canGenerate: boolean;
  /** Draf yang belum disimpan — hanya boleh ada satu. */
  openDraftId: string | null;
  /** Paket kredit bisa dibeli (kunci pembayaran sudah diset di server). */
  paymentsEnabled: boolean;
}

export const NO_ACCESS: AiAccess = {
  enabled: false,
  unlimited: false,
  balance: 0,
  canGenerate: false,
  openDraftId: null,
  paymentsEnabled: false,
};

/** Kode PostgREST/Postgres untuk fungsi atau kolom yang belum ada. */
const MISSING = new Set(["PGRST202", "42883", "42703"]);

/** The Supabase client carries the verified user's JWT so RLS applies. */
export async function getAiAccess(supabase: SupabaseClient, userId: string): Promise<AiAccess> {
  const paymentsEnabled = Boolean(process.env.MIDTRANS_SERVER_KEY);
  const [profile, balance, draft] = await Promise.all([
    supabase.from("profiles").select("ai_enabled, ai_unlimited").eq("id", userId).maybeSingle(),
    supabase.rpc("credit_balance"),
    supabase.from("categories").select("id").eq("created_by", userId).eq("status", "draft")
      .order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (profile.error) {
    console.error("[ai-access] gagal membaca profiles", { userId, code: profile.error.code, message: profile.error.message });
    return NO_ACCESS;
  }
  if (!profile.data) console.warn("[ai-access] profil tidak terlihat", { userId });

  const enabled = profile.data ? profile.data.ai_enabled === true : true;
  const unlimited = profile.data?.ai_unlimited === true;

  let credits: number;
  if (balance.error && MISSING.has(balance.error.code ?? "")) {
    // Web sudah dideploy tapi migration 00010 belum jalan: pakai hitungan
    // jatah lama supaya pengguna tidak tiba-tiba kehilangan aksesnya.
    credits = await legacyRemaining(supabase, userId);
  } else if (balance.error) {
    console.error("[ai-access] gagal membaca saldo kredit", { userId, message: balance.error.message });
    return NO_ACCESS;
  } else {
    credits = Number(balance.data ?? 0);
  }

  return {
    enabled,
    unlimited,
    balance: credits,
    canGenerate: enabled && (unlimited || credits > 0),
    openDraftId: draft.error ? null : draft.data?.id ?? null,
    paymentsEnabled,
  };
}

async function legacyRemaining(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase.from("ai_generations").select("id", { count: "exact", head: true })
    .eq("user_id", userId).eq("status", "success");
  if (error) return 0;
  return Math.max(AI_GENERATION_LIMIT - (count ?? 0), 0);
}
