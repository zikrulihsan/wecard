import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { fetchAiAccessDetails } from "@/lib/ai/access-client";
import type { AiAccess } from "@/lib/ai/access";
import { AI_TOPUP_PACK, formatIdr } from "@/lib/pricing";
import { BackLink } from "@/components/nav/back-link";
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

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href="/home" />
      <CreateHeader />
      {error ? <Card><CardContent className="py-8 text-center space-y-3"><p>{t.create.quotaError}</p><button className="text-primary underline" onClick={() => { setError(false); setRetry((value) => value + 1); }}>{t.common.retry}</button></CardContent></Card> :
        !access ? <CardLoader label={t.create.preparing} /> :
        !access.enabled ? <DisabledNotice /> :
        access.remaining === 0 && access.limit !== null ? <QuotaSpentNotice used={access.used} limit={access.limit} /> :
        <CreateForm remaining={access.remaining} limit={access.limit} />}
    </div>
  );
}

/** Jatah habis — bukan pintu tertutup, jadi nadanya beda dari akses dicabut. */
function QuotaSpentNotice({ used, limit }: { used: number; limit: number }) {
  const t = useT().create;
  const price = formatIdr(AI_TOPUP_PACK.priceIdr);
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <Sparkles className="size-5" />
        </div>
        <h2 className="font-semibold">{t.spentTitle}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {t.spentBody(used, limit)}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {AI_TOPUP_PACK.available
            ? t.topupAvailable(AI_TOPUP_PACK.generations, price)
            : t.topupSoon(AI_TOPUP_PACK.generations, price)}
        </p>
        <div className="pt-2">
          <Link
            to="/home"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            {t.playExisting}
          </Link>
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
