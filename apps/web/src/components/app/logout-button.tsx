import { useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { invalidateAiAccess } from "@/lib/ai/access-client";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function LogoutButton() {
  const t = useT();
  const navigate = useNavigate();
  async function handleLogout() {
    await createClient().auth.signOut();
    invalidateAiAccess();
    navigate("/", { replace: true });
  }
  return <Button onClick={handleLogout} variant="outline" className="w-full rounded-full">{t.profile.logout}</Button>;
}
