import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

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
  client ??= createSupabaseClient<Database>(url, key, {
    auth: {
      flowType: "pkce",
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return client;
}
