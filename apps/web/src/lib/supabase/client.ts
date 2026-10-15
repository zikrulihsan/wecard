import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { clearCaches } from "@/lib/cache";

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Tipe tabel belum dihasilkan dari project produksi; model domain/game tetap
// diberi tipe di @flipcard/types sampai skema Supabase itu tersedia.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any;
let client: SupabaseClient<Database> | null = null;

export function createClient() {
  if (!url || !key) {
    throw new Error("URL dan anon key Supabase belum diset");
  }
  if (!client) {
    client = createSupabaseClient<Database>(url, key, {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    // Sesi berakhir (keluar, atau token tidak bisa diperbarui): data akun
    // yang tersimpan tidak boleh tampil untuk akun berikutnya.
    client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") clearCaches();
    });
  }
  return client;
}

/**
 * Ada sesi tersimpan di perangkat ini (tanpa jaringan). Dipakai untuk
 * langsung merender halaman yang butuh login selagi Supabase memeriksa —
 * dan, kalau tokennya kedaluwarsa, memperbarui — sesinya.
 */
export function hasStoredSession() {
  try {
    return Object.keys(localStorage).some((key) => key.startsWith("sb-") && key.endsWith("-auth-token"));
  } catch {
    return false;
  }
}
