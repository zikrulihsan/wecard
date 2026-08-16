import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readAuthSnapshot, type AuthSnapshot } from "./session";

/**
 * Identitas user dari cookie, dibaca lokal tanpa memanggil Supabase Auth.
 * Cocok untuk menampilkan data milik user sendiri di Server Component —
 * query datanya tetap dijaga RLS, jadi klaim yang belum terverifikasi ini
 * tidak bisa dipakai mengintip data akun lain.
 *
 * Untuk keputusan yang butuh jaminan kuat (mis. menulis data atas nama user
 * di route handler), tetap pakai `supabase.auth.getUser()`.
 */
export async function getAuthSnapshot(): Promise<AuthSnapshot | null> {
  const cookieStore = await cookies();
  return readAuthSnapshot(
    (name) => cookieStore.get(name)?.value,
    process.env.NEXT_PUBLIC_SUPABASE_URL!
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component. This can be ignored if you have middleware
            // refreshing user sessions.
          }
        },
      },
    }
  );
}
