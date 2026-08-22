import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Tombol ajakan utama halaman marketing.
 *
 * Warnanya pink solid dengan border yang sedikit lebih gelap. Warna eksplisit
 * dipakai agar background tidak kalah oleh varian default tombol saat class
 * digabung; CTA ini harus tetap terbaca di atas latar hero yang terang.
 */
export function PrimaryCta({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ size: "lg" }),
        // `whitespace-normal` menimpa bawaan tombol: label ajakan di sini
        // panjang, dan tombol yang tidak boleh membungkus memaksa lebar
        // minimum yang membuat halaman bisa digeser ke samping di layar 320px.
        "h-auto min-h-12 whitespace-normal rounded-full border border-pink-700 bg-pink-600 px-8 py-3 text-center text-base leading-snug text-white shadow-lg shadow-rose-500/25 [a]:hover:bg-pink-700",
        className
      )}
    >
      {children}
    </Link>
  );
}
