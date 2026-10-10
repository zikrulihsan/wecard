import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { invalidateAiAccess } from "@/lib/ai/access-client";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";

/**
 * Duplikat deck custom dari link main ke akun sendiri, 1 kredit
 * (`copy_shared_deck`). Hanya untuk pemain yang sudah masuk; tamu melihat
 * ajakan daftar (MakerCta).
 */
export function CopyDeckPanel({ token }: { token: string }) {
  const t = useT().premium;
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copy() {
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await createClient().rpc("copy_shared_deck", { p_token: token });
    setBusy(false);
    const result = data as { ok?: boolean; code?: string; category_id?: string } | null;
    if (rpcError || !result?.ok || !result.category_id) {
      if (rpcError) console.error("[main] gagal menyalin deck", rpcError);
      // Deck sendiri tidak perlu disalin — panelnya cukup disembunyikan.
      if (result?.code === "own_deck") { setCopied(""); return; }
      setError(result?.code === "no_credits" ? t.noCredits : t.copyFailed);
      return;
    }
    invalidateAiAccess();
    setCopied(result.category_id);
  }

  if (copied === "") return null;

  return (
    <div className="space-y-2 rounded-2xl bg-white/80 p-4 text-left shadow-sm">
      <p className="flex items-center gap-2 font-semibold"><Copy className="size-4 text-primary" />{copied ? t.copyDone : t.copyTitle}</p>
      {copied ? (
        <Link to={`/play/${copied}`} className={buttonVariants({ size: "lg", className: "w-full rounded-full" })}>{t.copyOpen}</Link>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{t.copyBody}</p>
          <Button variant="outline" size="lg" className="w-full rounded-full" disabled={busy} onClick={copy}>{t.copyToMine}</Button>
        </>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
