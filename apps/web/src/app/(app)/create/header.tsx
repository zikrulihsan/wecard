import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";

/**
 * Kepala halaman bikin deck — tidak menunggu status akses AI, jadi ditulis
 * sekali di sini dan dipakai bersama oleh `page.tsx` dan `loading.tsx`.
 *
 * Jatahnya disebut di sini (angka tetap, bukan sisa jatah yang harus dibaca
 * dari server) supaya batasnya sudah terbaca sejak kerangka halaman muncul,
 * bukan baru setelah formulirnya selesai dimuat.
 */
export function CreateHeader() {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold">Bikin Deck Sendiri</h1>
      <p className="text-muted-foreground mt-1">
        Isi konteksnya, AI yang nulis kartunya. Tiap akun dapat{" "}
        {AI_GENERATION_LIMIT} deck AI, dan deck ini cuma kelihatan di akunmu.
      </p>
    </header>
  );
}
