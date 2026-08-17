import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import { getAiAccess } from "@/lib/ai/access";
import { Card, CardContent } from "@/components/ui/card";
import { CreateForm } from "./create-form";

export const dynamic = "force-dynamic";

export default async function CreateDeckPage() {
  const canUseAi = await getAiAccess();

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <Link
        href="/home"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="size-4" />
        Kembali
      </Link>

      <header className="mb-6">
        <h1 className="text-3xl font-bold">Bikin Deck Sendiri</h1>
        <p className="text-muted-foreground mt-1">
          {canUseAi
            ? "Isi konteksnya, AI yang nulis kartunya. Deck ini cuma kelihatan di akunmu."
            : "Kartunya ditulis AI dari konteks yang kamu isi, dan decknya cuma kelihatan di akunmu."}
        </p>
      </header>

      {canUseAi ? <CreateForm /> : <LockedNotice />}
    </div>
  );
}

function LockedNotice() {
  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <Lock className="size-5" />
        </div>
        <h2 className="font-semibold">Masih terbatas</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Fitur bikin deck dengan AI lagi dibuka untuk sebagian pengguna dulu.
          Akunmu belum termasuk — nanti muncul sendiri di sini begitu dibuka.
        </p>
        <div className="pt-2">
          <Link
            href="/home"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Main deck yang ada dulu
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
