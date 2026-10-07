import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/app/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError } from "@/components/ui/load-error";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { useT } from "@/lib/i18n";

type Identity = { name: string; email: string | null };

export default function ProfilePage() {
  const t = useT();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) throw new Error("Sesi tidak ditemukan");
      const { data: profile, error: profileError } = await supabase.from("profiles")
        .select("display_name").eq("id", session.user.id).maybeSingle();
      if (profileError) throw profileError;
      if (active) setIdentity({
        name: profile?.display_name ?? session.user.user_metadata?.name ?? "Player",
        email: session.user.email ?? null,
      });
    }).catch((cause) => { if (active) { console.error("[profile] gagal memuat", cause); setError(true); } });
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
