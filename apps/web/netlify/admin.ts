import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien service_role — melewati RLS. Hanya untuk yang memang tidak punya
 * sesi user (webhook pembayaran) atau yang tidak boleh ditulis user sendiri
 * (pesanan kredit beserta harganya). Jangan pernah dipakai untuk membaca data
 * atas nama user.
 */
export function serviceClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
