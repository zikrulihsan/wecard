import { cn } from "@/lib/utils";

/**
 * Penanda memuat berbentuk kartu yang berbalik.
 *
 * Dipakai di dua tempat yang harus terlihat sama persis: `loading.tsx` tiap
 * rute (kerangka yang ter-prefetch, tampil seketika saat tab diketuk) dan
 * fallback `<Suspense>` di dalam halamannya. Kalau keduanya berbeda bentuk,
 * pemain melihat dua pergantian tampilan untuk satu kali pindah halaman.
 *
 * Animasinya didefinisikan sebagai kelas CSS di globals.css, bukan di sini —
 * lihat catatan di sana soal kenapa tidak boleh bergantung pada JavaScript.
 */
export function CardLoader({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-6 py-16",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="card-loader h-16 w-12">
          <div className="card-loader-card">
            {/* Muka depan mengikuti gradien kartu deck di halaman utama. */}
            <span className="card-loader-face bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-rose-500/25" />
            <span className="card-loader-face card-loader-face-back border border-rose-200 bg-white shadow-lg shadow-rose-500/10" />
          </div>
        </div>
        <div className="card-loader-shadow h-1.5 w-9 rounded-[100%] bg-neutral-500" />
      </div>

      {label ? (
        <p className="text-sm text-muted-foreground">{label}</p>
      ) : (
        <span className="sr-only">Memuat</span>
      )}
    </div>
  );
}
