import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Gift } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CardLoader } from "@/components/ui/card-loader";
import { redeemGift, type RedeemResult } from "@/lib/premium";
import { useT } from "@/lib/i18n";

/**
 * Tukar kode hadiah (`/hadiah/<kode>`). Halaman ini di balik login, jadi
 * penerima yang belum punya akun didaftarkan dulu lalu kembali ke sini.
 */
export default function RedeemPage() {
  const t = useT().premium;
  const { code = "" } = useParams();
  const [result, setResult] = useState<RedeemResult | null>(null);
  // Sekali saja per kunjungan — StrictMode menjalankan efek dua kali di dev.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    redeemGift(code)
      .then(setResult)
      .catch((error) => {
        console.error("[hadiah] gagal menukar", error);
        setResult({ ok: false, code: "unknown" });
      });
  }, [code]);

  const target = result?.ok
    ? result.categoryId ? `/play/${result.categoryId}` : result.seriesSlug ? `/seri/${result.seriesSlug}` : "/home"
    : result?.categoryId ? `/play/${result.categoryId}` : null;

  return (
    <div className="mx-auto max-w-screen-sm px-4 py-12">
      {!result ? <CardLoader label={t.redeeming} /> : (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-pink-100 text-pink-600">
            <Gift className="size-6" />
          </div>
          <h1 className="text-2xl font-bold">{t.redeemTitle}</h1>
          <p className="leading-relaxed text-muted-foreground">
            {result.ok ? t.redeemOk : t.redeemErrors[result.code] ?? t.redeemErrors.unknown}
          </p>
          {target && (
            <Link to={target} className={buttonVariants({ size: "lg", className: "w-full rounded-full" })}>{t.redeemOpen}</Link>
          )}
        </div>
      )}
    </div>
  );
}
