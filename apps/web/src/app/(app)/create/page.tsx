import { Suspense } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { getAiAccess } from "@/lib/ai/access";
import { BackLink } from "@/components/nav/back-link";
import { Card, CardContent } from "@/components/ui/card";
import { CardLoader } from "@/components/ui/card-loader";
import { CreateForm } from "./create-form";
import { CreateHeader } from "./header";

export const dynamic = "force-dynamic";

// Tautan kembali dan judul tidak menunggu apa pun. Yang ditunggu cuma status
// akses AI, karena itu yang menentukan formulir atau catatan terkunci yang
// tampil — jadi hanya bagian itu yang punya penanda memuat, dan bentuknya sama
// persis dengan loading.tsx rute ini.
export default function CreateDeckPage() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href="/home" />
      <CreateHeader />

      <Suspense fallback={<CardLoader label="Menyiapkan formulir" />}>
        <AiGate />
      </Suspense>
    </div>
  );
}

async function AiGate() {
  const canUseAi = await getAiAccess();

  return canUseAi ? <CreateForm /> : <LockedNotice />;
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
