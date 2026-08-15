import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CreateForm } from "./create-form";

export const dynamic = "force-dynamic";

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

      <CreateForm />
    </div>
  );
}
