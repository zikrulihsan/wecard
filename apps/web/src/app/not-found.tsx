import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * Halaman 404 bermerek — dipakai untuk URL yang salah ketik maupun untuk
 * `notFound()` yang dipanggil dari rute deck.
 *
 * Kalimatnya sengaja tidak menuduh: yang paling sering sampai ke sini bukan
 * orang iseng, tapi pemilik deck yang membuka tautan lama setelah decknya
 * dihapus.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-sm space-y-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-pink-50 text-3xl">
          🔍
        </div>

        <h1 className="text-2xl font-bold">Halamannya nggak ketemu</h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Mungkin tautannya sudah berubah, atau decknya sudah dihapus. Deck
          lainmu tetap ada di beranda.
        </p>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
          <Link href="/home" className={buttonVariants()}>
            Ke beranda
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Halaman depan
          </Link>
        </div>
      </div>
    </main>
  );
}
