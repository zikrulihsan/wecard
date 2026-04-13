import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Profil</h1>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{profile?.display_name ?? "Player"}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </CardContent>
      </Card>

      <LogoutButton />
    </div>
  );
}
