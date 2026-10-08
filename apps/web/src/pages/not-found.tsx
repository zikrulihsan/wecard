import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

/**
 * Halaman 404 bermerek — dipakai untuk URL yang salah ketik maupun untuk
 * `notFound()` yang dipanggil dari rute deck.
 *
 * Kalimatnya sengaja tidak menuduh: yang paling sering sampai ke sini bukan
 * orang iseng, tapi pemilik deck yang membuka tautan lama setelah decknya
 * dihapus.
 */
export default function NotFound() {
  const t = useT();
  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-sm space-y-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-pink-50 text-3xl">
          🔍
        </div>

        <h1 className="text-2xl font-bold">{t.notFound.title}</h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {t.notFound.body}
        </p>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
          <Link to="/home" className={buttonVariants()}>
            {t.notFound.home}
          </Link>
          <Link to="/" className={buttonVariants({ variant: "outline" })}>
            {t.notFound.landing}
          </Link>
        </div>
      </div>
    </main>
  );
}
