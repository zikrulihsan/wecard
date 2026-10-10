import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FilePen, Lock, Sparkles } from "lucide-react";
import { fetchAiAccessDetails, invalidateAiAccess } from "@/lib/ai/access-client";
import type { AiAccess } from "@/lib/ai/access";
import { createClient } from "@/lib/supabase/client";
import { BackLink } from "@/components/nav/back-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardLoader } from "@/components/ui/card-loader";
import { CreateForm } from "@/components/app/create-form";
import { CreateHeader } from "@/components/app/create-header";
import { useT } from "@/lib/i18n";

export default function CreateDeckPage() {
  const t = useT();
  const [access, setAccess] = useState<AiAccess | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    fetchAiAccessDetails().then((value) => {
      if (active) { setAccess(value); setError(false); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [retry]);

  const reload = () => { invalidateAiAccess(); setAccess(null); setRetry((value) => value + 1); };

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href="/home" />
      <CreateHeader />
      {error ? <Card><CardContent className="py-8 text-center space-y-3"><p>{t.create.quotaError}</p><button className="text-primary underline" onClick={() => { setError(false); setRetry((value) => value + 1); }}>{t.common.retry}</button></CardContent></Card> :
        !access ? <CardLoader label={t.create.preparing} /> :
        !access.enabled ? <DisabledNotice /> :
        access.openDraftId ? <DraftOpenNotice draftId={access.openDraftId} onDiscarded={reload} /> :
        !access.canGenerate ? <NoCreditsNotice /> :
        <CreateForm balance={access.unlimited ? null : access.balance} />}
    </div>
  );
}

/** Satu draf terbuka per akun — lanjutkan atau buang dulu. */
function DraftOpenNotice({ draftId, onDiscarded }: { draftId: string; onDiscarded: () => void }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  async function discard() {
    if (!confirm(t.review.discardConfirm)) return;
    setBusy(true);
    const { error } = await createClient().from("categories").delete().eq("id", draftId);
    setBusy(false);
    if (error) { console.error("[create] gagal membuang draf", error); return; }
    onDiscarded();
  }
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <FilePen className="size-5" />
        </div>
        <h2 className="font-semibold">{t.create.draftOpenTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{t.create.draftOpenBody}</p>
        <div className="mx-auto flex max-w-xs flex-col gap-2 pt-2">
          <Link to={`/create/${draftId}`} className={buttonVariants({ size: "lg", className: "rounded-full" })}>
            {t.create.continueDraft}
          </Link>
          <Button variant="ghost" disabled={busy} onClick={discard}>{t.create.discardDraft}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Saldo habis — bukan pintu tertutup, jadi nadanya beda dari akses dicabut. */
function NoCreditsNotice() {
  const t = useT().create;
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <Sparkles className="size-5" />
        </div>
        <h2 className="font-semibold">{t.noCreditsTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{t.noCreditsBody}</p>
        <div className="mx-auto flex max-w-xs flex-col gap-2 pt-2">
          <Link to="/store" className={buttonVariants({ size: "lg", className: "rounded-full" })}>{t.buyCredits}</Link>
          <Link to="/home" className="text-sm font-medium text-primary underline underline-offset-4">{t.playExisting}</Link>
        </div>
      </CardContent>
    </Card>
  );
}

/** Sakelar `profiles.ai_enabled` dimatikan untuk akun ini. */
function DisabledNotice() {
  const t = useT().create;
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <Lock className="size-5" />
        </div>
        <h2 className="font-semibold">{t.disabledTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {t.disabledBody}
        </p>
        <div className="pt-2">
          <Link
            to="/home"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            {t.playExistingFirst}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
