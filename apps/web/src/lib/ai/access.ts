import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

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
 */
export const getAiAccess = cache(async (): Promise<boolean> => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("ai_enabled")
    .single();

  return data?.ai_enabled === true;
});
