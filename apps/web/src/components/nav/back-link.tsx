import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Tautan "Kembali" di kepala halaman. Dipakai bersama oleh `page.tsx` dan
 * `loading.tsx` supaya posisinya identik di kerangka dan di halaman jadi —
 * kalau ditulis dua kali, bedanya sepiksel pun terlihat sebagai lompatan
 * tepat saat kerangka diganti isi aslinya.
 */
export function BackLink({
  href,
  children = "Kembali",
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ChevronLeft className="size-4" />
      {children}
    </Link>
  );
}
