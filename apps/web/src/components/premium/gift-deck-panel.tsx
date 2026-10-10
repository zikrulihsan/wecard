import { useState } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareActions } from "@/components/share/share-actions";
import { invalidateAiAccess } from "@/lib/ai/access-client";
import { giftUrl } from "@/lib/premium";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";

/**
 * Hadiahkan deck custom milik sendiri: pemberi membayar 1 kredit, penerima
 * menukar kodenya di /hadiah/<kode> dan mendapat salinan di akunnya.
 */
export function GiftDeckPanel({ deckId, deckName }: { deckId: string; deckName: string }) {
  const t = useT().premium;
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await createClient().rpc("gift_custom_deck", { p_category: deckId });
    setBusy(false);
    const result = data as { ok?: boolean; code?: string } | null;
    if (rpcError || !result?.ok || !result.code) {
      if (rpcError) console.error("[deck] gagal membuat kode hadiah", rpcError);
      setError(result?.code === "no_credits" ? t.noCredits : t.giftFailed);
      return;
    }
    invalidateAiAccess();
    setCode(result.code);
  }

  return (
    <div className="mb-6 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 font-semibold"><Gift className="size-4 text-primary" />{t.giftTitle}</p>
      {code ? (
        <>
          <p className="text-sm text-muted-foreground">{t.giftCreated}</p>
          <p className="rounded-xl bg-neutral-50 px-3 py-2 text-center font-mono text-lg font-semibold tracking-widest">{code}</p>
          <ShareActions text={t.giftShareText(deckName)} url={giftUrl(code)} label={t.giftShare} variant="outline" />
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{t.giftBody}</p>
          <Button variant="outline" className="w-full rounded-full" disabled={busy} onClick={create}>{t.giftCreate}</Button>
        </>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
