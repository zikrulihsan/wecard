"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Tampilan saat data gagal diambil — bukan saat datanya memang kosong.
 *
 * Bedanya penting: "belum ada deck" mengajak pengguna membuat deck, sedangkan
 * "gagal memuat" mengajak mencoba lagi. Sebelum ini keduanya tampil sama, dan
 * Supabase yang sedang bermasalah terbaca sebagai produk yang kosong.
 *
 * Tombolnya memanggil `router.refresh()`, bukan `location.reload()`: yang
 * diambil ulang cuma render server rute ini, jadi keadaan halaman lain tidak
 * ikut hilang dan percobaan ulang terasa jauh lebih ringan.
 */
export function LoadError({
  title = "Gagal memuat",
  description = "Sambungan ke server bermasalah. Biasanya sebentar saja.",
}: {
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const [isRetrying, startRefresh] = useTransition();

  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          <WifiOff className="size-5" />
        </div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
        <div className="pt-2">
          <Button
            onClick={() => startRefresh(() => router.refresh())}
            disabled={isRetrying}
          >
            <RotateCw className={isRetrying ? "animate-spin" : undefined} />
            {isRetrying ? "Mencoba lagi…" : "Coba lagi"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
