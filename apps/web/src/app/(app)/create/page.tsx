import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import { getAiAccess } from "@/lib/ai/access";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateForm } from "./create-form";

export const dynamic = "force-dynamic";

// Tautan kembali dan judul tidak menunggu apa pun. Yang ditunggu cuma status
// akses AI, karena itu yang menentukan formulir atau catatan terkunci yang
// tampil — jadi hanya bagian itu yang punya kerangka.
export default function CreateDeckPage() {
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
          Isi konteksnya, AI yang nulis kartunya. Deck ini cuma kelihatan di
          akunmu.
        </p>
      </header>

      <Suspense fallback={<FormSkeleton />}>
        <AiGate />
      </Suspense>
    </div>
  );
}

async function AiGate() {
  const canUseAi = await getAiAccess();

  return canUseAi ? <CreateForm /> : <LockedNotice />;
}

function FormSkeleton() {
  return (
    <div className="space-y-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-11 w-full rounded-full" />
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
