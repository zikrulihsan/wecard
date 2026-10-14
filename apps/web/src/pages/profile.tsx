import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readCache, writeCache } from "@/lib/cache";
import { LogoutButton } from "@/components/app/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError } from "@/components/ui/load-error";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useT } from "@/lib/i18n";

type Identity = { name: string; email: string | null };

const PROFILE_CACHE_KEY = "profile";

export default function ProfilePage() {
  const t = useT();
  // Nama dan email jarang berubah: tampilkan yang tersimpan, segarkan diam-diam.
  const [identity, setIdentity] = useState<Identity | null>(() => readCache<Identity>(PROFILE_CACHE_KEY) ?? null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) throw new Error("Sesi tidak ditemukan");
      const fallback = { name: session.user.user_metadata?.name ?? "Player", email: session.user.email ?? null };
      const { data: profile, error: profileError } = await supabase.from("profiles")
        .select("display_name").eq("id", session.user.id).maybeSingle();
      if (profileError) throw profileError;
      const next = { name: profile?.display_name ?? fallback.name, email: fallback.email };
      writeCache(PROFILE_CACHE_KEY, next, { persist: true });
      if (active) setIdentity(next);
    }).catch((cause) => {
      console.error("[profile] gagal memuat", cause);
      // Nama tersimpan tetap ditampilkan; galat hanya kalau tidak ada apa-apa.
      if (active && !readCache<Identity>(PROFILE_CACHE_KEY)) setError(true);
    });
    return () => { active = false; };
  }, [retry]);

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <header className="mb-6"><h1 className="text-3xl font-bold">{t.profile.title}</h1></header>
      {error ? <LoadError title={t.profile.errorTitle} onRetry={() => { setError(false); setRetry((value) => value + 1); }} /> :
        identity ? <Card className="mb-6"><CardHeader><CardTitle>{identity.name}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{identity.email}</p></CardContent></Card> :
        <Card className="mb-6"><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-4 w-56" /></CardContent></Card>}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium">{t.language.settingTitle}</p>
            <p className="text-sm text-muted-foreground">{t.language.settingHint}</p>
          </div>
          <LanguageSwitcher className="shrink-0" />
        </CardContent>
      </Card>
      <LogoutButton />
    </div>
  );
}
