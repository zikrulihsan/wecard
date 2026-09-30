import type { SupabaseClient } from "@supabase/supabase-js";
import { AI_GENERATION_LIMIT } from "./quota";

export { AI_GENERATION_LIMIT };

export interface AiAccess {
  enabled: boolean;
  used: number;
  /** Null means this account has no generation quota. */
  limit: number | null;
  remaining: number | null;
  unlimited: boolean;
  canGenerate: boolean;
}

export const NO_ACCESS: AiAccess = {
  enabled: false,
  used: AI_GENERATION_LIMIT,
  limit: AI_GENERATION_LIMIT,
  remaining: 0,
  unlimited: false,
  canGenerate: false,
};

/** The Supabase client carries the verified user's JWT so RLS applies. */
export async function getAiAccess(supabase: SupabaseClient, userId: string): Promise<AiAccess> {
  const [profile, generations] = await Promise.all([
    supabase.from("profiles").select("ai_enabled, ai_unlimited").eq("id", userId).maybeSingle(),
    supabase.from("ai_generations").select("id", { count: "exact", head: true })
      .eq("user_id", userId).eq("status", "success"),
  ]);

  // A web deploy can precede the database migration. Keep the existing quota
  // while ai_unlimited is not yet available.
  const legacyProfile = profile.error?.code === "42703"
    ? await supabase.from("profiles").select("ai_enabled").eq("id", userId).maybeSingle()
    : null;
  const profileError = legacyProfile ? legacyProfile.error : profile.error;
  const profileData = legacyProfile ? legacyProfile.data : profile.data;

  if (profileError || generations.error) {
    console.error("[ai-access] gagal membaca kuota", {
      userId,
      profileError: profileError?.message,
      generationsError: generations.error?.message,
    });
    return NO_ACCESS;
  }

  if (!profileData) console.warn("[ai-access] profil tidak terlihat", { userId });

  const enabled = profileData ? profileData.ai_enabled === true : true;
  const unlimited = !legacyProfile && profile.data?.ai_unlimited === true;
  const used = unlimited
    ? generations.count ?? 0
    : Math.min(generations.count ?? 0, AI_GENERATION_LIMIT);
  const remaining = unlimited ? null : Math.max(AI_GENERATION_LIMIT - used, 0);

  return {
    enabled,
    used,
    limit: unlimited ? null : AI_GENERATION_LIMIT,
    remaining,
    unlimited,
    canGenerate: enabled && (remaining === null || remaining > 0),
  };
}
