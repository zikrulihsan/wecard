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

export default function CreateDeckPage() {
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
      {error ? <Card><CardContent className="py-8 text-center space-y-3"><p>Jatah belum bisa dibaca.</p><button className="text-primary underline" onClick={() => { setError(false); setRetry((value) => value + 1); }}>Coba lagi</button></CardContent></Card> :
        !access ? <CardLoader label="Menyiapkan formulir" /> :
        !access.enabled ? <DisabledNotice /> :
        access.remaining === 0 && access.limit !== null ? <QuotaSpentNotice used={access.used} limit={access.limit} /> :
        <CreateForm remaining={access.remaining} limit={access.limit} />}
    </div>
  );
}

/** Jatah habis — bukan pintu tertutup, jadi nadanya beda dari akses dicabut. */
function QuotaSpentNotice({ used, limit }: { used: number; limit: number }) {
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <Sparkles className="size-5" />
        </div>
        <h2 className="font-semibold">Jatah bikin deck sudah habis</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Tiap akun dapat {limit} deck AI, dan punyamu sudah terpakai semua (
          {used} dari {limit}). Deck yang sudah jadi tetap ada di beranda dan
          bisa dimainkan kapan saja.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {AI_TOPUP_PACK.available ? (
            <>
              Mau bikin lagi? Ada paket tambahan {AI_TOPUP_PACK.generations}{" "}
              deck seharga Rp {formatIdr(AI_TOPUP_PACK.priceIdr)}.
            </>
          ) : (
            <>
              Paket tambahan {AI_TOPUP_PACK.generations} deck (Rp{" "}
              {formatIdr(AI_TOPUP_PACK.priceIdr)}) lagi disiapkan — belum bisa
              dibeli sekarang.
            </>
          )}
        </p>
        <div className="pt-2">
          <Link
            to="/home"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Main deck yang sudah ada
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/** Sakelar `profiles.ai_enabled` dimatikan untuk akun ini. */
function DisabledNotice() {
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <Lock className="size-5" />
        </div>
        <h2 className="font-semibold">Sedang tidak aktif</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Fitur bikin deck dengan AI lagi tidak aktif untuk akunmu. Deck AI yang
          sudah terlanjur dibuat tetap bisa dimainkan.
        </p>
        <div className="pt-2">
          <Link
            to="/home"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Main deck yang ada dulu
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
