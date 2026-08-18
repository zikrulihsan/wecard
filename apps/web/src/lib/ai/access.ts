import { cache } from "react";
import { createClient, getAuthSnapshot } from "@/lib/supabase/server";

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
 * Apakah user yang sedang login boleh memakai fitur generate deck AI.
 *
 * Dibungkus `cache()` supaya kalau layout dan halaman sama-sama butuh nilai
 * ini dalam satu request, query-nya cuma jalan sekali.
 *
 * Ini bukan gerbang terakhir — RLS di Postgres (policy "Insert own AI
 * categories" + has_ai_access()) yang menolak insert kalau akses dicabut.
 * Fungsi ini dipakai untuk menampilkan status di UI dan untuk menolak lebih
 * awal di API route, sebelum biaya token AI keluar.
 *
 * Kegagalan sengaja dicatat ke log server. Tanpa itu, "kolom belum ada",
 * "baris profil tidak terlihat", dan "menunjuk project Supabase yang salah"
 * sama-sama berakhir jadi `false` tanpa jejak, dan penyebabnya cuma bisa
 * ditebak dari luar.
 */
export const getAiAccess = cache(async (): Promise<boolean> => {
  // Dibaca lokal dari cookie — tanpa jaringan.
  const auth = await getAuthSnapshot();
  if (!auth) return false;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("ai_enabled")
    .eq("id", auth.userId)
    .maybeSingle();

  if (error) {
    console.error("[ai-access] gagal membaca profiles", {
      supabaseHost: supabaseHost(),
      userId: auth.userId,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return false;
  }

  if (!data) {
    console.warn("[ai-access] baris profil tidak terlihat untuk sesi ini", {
      supabaseHost: supabaseHost(),
      userId: auth.userId,
    });
    return false;
  }

  // ai_enabled = false itu keadaan normal, tidak perlu dicatat.
  return data.ai_enabled === true;
});
