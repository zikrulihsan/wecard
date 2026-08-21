import { cache } from "react";
import { createClient, getAuthSnapshot } from "@/lib/supabase/server";
import { AI_GENERATION_LIMIT } from "./quota";

export { AI_GENERATION_LIMIT };

export interface AiAccess {
  /** Sakelar pemutus per akun (`profiles.ai_enabled`). Bawaannya terbuka. */
  enabled: boolean;
  /** Generate yang berhasil dan sudah memakan jatah. */
  used: number;
  limit: number;
  remaining: number;
  /** Boleh menekan tombol generate sekarang. */
  canGenerate: boolean;
}

const NO_ACCESS: AiAccess = {
  enabled: false,
  used: AI_GENERATION_LIMIT,
  limit: AI_GENERATION_LIMIT,
  remaining: 0,
  canGenerate: false,
};

/**
 * Host Supabase yang benar-benar dipakai build ini. NEXT_PUBLIC_SUPABASE_URL
 * ditanam saat build, jadi kalau env di hosting menunjuk project lain daripada
 * yang dikira, nilai ini yang membuktikannya. Aman dicatat: URL-nya publik.
 */
function supabaseHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
  } catch {
    return "(NEXT_PUBLIC_SUPABASE_URL tidak valid)";
  }
}

/**
 * Status jatah generate deck AI untuk user yang sedang login.
 *
 * Fitur ini terbuka untuk semua akun; yang membatasi adalah kuota
 * {@link AI_GENERATION_LIMIT} deck, dihitung dari baris `ai_generations`
 * berstatus `success` — generate yang gagal tidak memakan jatah karena user
 * tidak dapat deck apa pun darinya. `profiles.ai_enabled` tinggal jadi
 * sakelar pemutus kalau satu akun perlu dicabut aksesnya.
 *
 * Dibungkus `cache()` supaya kalau layout dan halaman sama-sama butuh nilai
 * ini dalam satu request, query-nya cuma jalan sekali.
 *
 * Ini bukan gerbang terakhir — RLS di Postgres (policy "Insert own AI
 * categories" + has_ai_access(), yang ikut menghitung kuota) yang menolak
 * insert kalau jatahnya habis. Fungsi ini dipakai untuk menampilkan sisa
 * jatah di UI dan untuk menolak lebih awal di API route, sebelum biaya token
 * AI keluar.
 *
 * Kegagalan sengaja dicatat ke log server dan diperlakukan sebagai "tidak
 * boleh": kalau sisa jatah tidak bisa dibaca, menolak lebih murah daripada
 * menebak dan membakar token.
 */
export const getAiAccess = cache(async (): Promise<AiAccess> => {
  // Dibaca lokal dari cookie — tanpa jaringan.
  const auth = await getAuthSnapshot();
  if (!auth) return NO_ACCESS;

  const supabase = await createClient();

  const [profile, generations] = await Promise.all([
    supabase
      .from("profiles")
      .select("ai_enabled")
      .eq("id", auth.userId)
      .maybeSingle(),
    supabase
      .from("ai_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.userId)
      .eq("status", "success"),
  ]);

  if (profile.error) {
    console.error("[ai-access] gagal membaca profiles", {
      supabaseHost: supabaseHost(),
      userId: auth.userId,
      code: profile.error.code,
      message: profile.error.message,
      details: profile.error.details,
      hint: profile.error.hint,
    });
    return NO_ACCESS;
  }

  if (generations.error) {
    console.error("[ai-access] gagal menghitung ai_generations", {
      supabaseHost: supabaseHost(),
      userId: auth.userId,
      code: generations.error.code,
      message: generations.error.message,
      details: generations.error.details,
      hint: generations.error.hint,
    });
    return NO_ACCESS;
  }

  // Baris profil yang belum terbentuk bukan lagi jawaban "tidak boleh":
  // aksesnya sudah bawaan semua akun, dan kuotanya tetap terjaga lewat
  // hitungan di atas. Tetap dicatat karena itu tanda trigger pendaftaran
  // (atau RLS profiles) bermasalah.
  if (!profile.data) {
    console.warn("[ai-access] baris profil tidak terlihat untuk sesi ini", {
      supabaseHost: supabaseHost(),
      userId: auth.userId,
    });
  }

  const enabled = profile.data ? profile.data.ai_enabled === true : true;
  const used = Math.min(generations.count ?? 0, AI_GENERATION_LIMIT);
  const remaining = Math.max(AI_GENERATION_LIMIT - used, 0);

  return {
    enabled,
    used,
    limit: AI_GENERATION_LIMIT,
    remaining,
    canGenerate: enabled && remaining > 0,
  };
});
