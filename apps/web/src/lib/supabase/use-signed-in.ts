import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Apakah pengunjung sudah masuk. `null` selama sesi masih diperiksa.
 *
 * Untuk halaman publik (mis. /coba) yang tampil beda bagi tamu dan pemain
 * yang sudah masuk. Konfigurasi Supabase yang tidak ada dibaca sebagai tamu,
 * supaya halaman publik tetap jalan.
 */
export function useSignedIn(): boolean | null {
  const [supabase] = useState(() => {
    try { return createClient(); } catch { return null; }
  });
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    }).catch(() => {
      if (active) setSignedIn(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSignedIn(Boolean(session));
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [supabase]);

  return supabase ? signedIn : false;
}
