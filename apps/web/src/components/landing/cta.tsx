import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Tombol ajakan utama halaman marketing.
 *
 * Warnanya gradien pink→rose, sama dengan aksen di judul dan kartu, bukan
 * `--primary` polos: di halaman ini tombolnya bagian dari identitas visual,
 * dan satu-satunya tombol yang boleh paling menonjol.
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
        "h-auto min-h-12 whitespace-normal rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-3 text-center text-base leading-snug text-white shadow-lg shadow-rose-500/20 transition-opacity hover:opacity-90",
        className
      )}
    >
      {children}
    </Link>
  );
}
