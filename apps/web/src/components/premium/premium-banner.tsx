import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, PencilLine } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { invalidateAiAccess } from "@/lib/ai/access-client";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";

/** Volume premium yang belum dibeli: hanya kartu preview yang terbuka. */
export function PremiumLockedBanner({ previewCount, cardTotal, seriesSlug }: { previewCount: number; cardTotal: number; seriesSlug: string }) {
  const t = useT().premium;
  return (
    <div className="mb-6 space-y-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
      <p className="flex items-start gap-2 text-sm text-indigo-900">
        <Lock className="mt-0.5 size-4 shrink-0" />
        {t.lockedBanner(previewCount, cardTotal)}
      </p>
      <Link to={`/seri/${seriesSlug}`} className={buttonVariants({ size: "sm", className: "w-full rounded-full" })}>
        {t.seeSeries}
      </Link>
    </div>
  );
}

/** Volume premium yang sudah dimiliki: salin jadi versi pribadi, 1 kredit. */
export function PersonalizePanel({ categoryId }: { categoryId: string }) {
  const t = useT().premium;
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function personalize() {
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await createClient().rpc("personalize_premium", { p_category: categoryId });
    setBusy(false);
    const result = data as { ok?: boolean; code?: string; category_id?: string } | null;
    if (rpcError || !result?.ok || !result.category_id) {
      if (rpcError) console.error("[premium] gagal membuat versi pribadi", rpcError);
      setError(result?.code === "no_credits" ? t.noCredits : t.personalizeFailed);
      return;
    }
    invalidateAiAccess();
    navigate(`/play/${result.category_id}`);
  }

  return (
    <div className="mb-6 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 font-semibold"><PencilLine className="size-4 text-primary" />{t.personalizeTitle}</p>
      <p className="text-sm text-muted-foreground">{t.personalizeBody}</p>
      <Button variant="outline" className="w-full rounded-full" disabled={busy} onClick={personalize}>{t.personalize}</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
