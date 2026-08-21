import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { getAiAccess } from "@/lib/ai/access";

/**
 * Pintu masuk fitur bikin deck AI di halaman utama.
 *
 * Tab "Bikin" di nav sudah ada, tapi tidak menjelaskan apa-apa — pemain tidak
 * tahu fiturnya gratis, berjatah, dan hasilnya masuk ke daftar deck ini juga.
 * Kartu ini yang menyebutkannya, lengkap dengan sisa jatah, di tempat yang
 * pasti dilewati.
 *
 * Kedua keadaannya (masih ada jatah / sudah habis) sengaja setinggi
 * {@link AiDeckCtaPlaceholder} supaya daftar deck di bawahnya tidak bergeser
 * saat bagian ini selesai dimuat — karena itu teksnya dijaga tetap pendek:
 * diukur sampai lebar 320px, judul dan keterangannya masing-masing masih
 * satu baris, jadi tingginya tidak pernah lewat dari 74px.
 */
export async function AiDeckCta() {
  const { enabled, used, limit, remaining } = await getAiAccess();

  // Akun yang aksesnya dicabut tidak perlu ditawari sama sekali.
  if (!enabled) return null;

  if (remaining <= 0) {
    return (
      <div className="mb-6 flex min-h-[74px] items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-sm">Jatah deck AI sudah habis</p>
          <p className="text-sm text-muted-foreground">
            {used} dari {limit} terpakai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/create"
      className="mb-6 flex min-h-[74px] items-center gap-3 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-4 transition-shadow hover:shadow-md"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm">Bikin deck pakai AI</p>
        <p className="text-sm text-muted-foreground">
          {limit} deck gratis, sisamu {remaining}.
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-neutral-400" />
    </Link>
  );
}

/** Ruang kosong setinggi kartunya, dipakai selama sisa jatah masih diambil. */
export function AiDeckCtaPlaceholder() {
  return <div aria-hidden className="mb-6 h-[74px]" />;
}
