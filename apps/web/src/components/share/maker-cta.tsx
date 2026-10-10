import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { rememberReferral } from "@/lib/share/local";
import { useT } from "@/lib/i18n";

/**
 * Ajakan di akhir sesi: pemain → pembuat. Tamu diarahkan daftar lalu langsung
 * ke halaman bikin deck; link asalnya diingat supaya pendaftarannya tercatat
 * berasal dari link main (lihat `claim_share_referral`).
 */
export function MakerCta({ signedIn, referralToken }: { signedIn: boolean | null; referralToken?: string }) {
  const t = useT().share;
  const remember = () => {
    if (referralToken) rememberReferral(referralToken);
  };
  return (
    <div className="space-y-3 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-4 text-left">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm">
          <Sparkles className="size-4" />
        </span>
        <div className="space-y-1">
          <p className="font-semibold leading-snug">{t.ctaTitle}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{t.ctaBody(AI_GENERATION_LIMIT)}</p>
        </div>
      </div>
      {signedIn ? (
        <Link to="/create" className={buttonVariants({ size: "lg", className: "w-full rounded-full" })}>
          {t.ctaSignedIn}
        </Link>
      ) : (
        <>
          <Link
            to={`/register?redirect=${encodeURIComponent("/create")}`}
            onClick={remember}
            className={buttonVariants({ size: "lg", className: "h-auto min-h-11 w-full whitespace-normal rounded-full py-2" })}
          >
            {t.ctaButton(AI_GENERATION_LIMIT)}
          </Link>
          <p className="text-center text-sm">
            <Link
              to={`/login?redirect=${encodeURIComponent("/create")}`}
              onClick={remember}
              className="font-semibold text-primary hover:underline"
            >
              {t.ctaSignIn}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
