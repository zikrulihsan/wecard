"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

/**
 * Jaring pengaman untuk seluruh rute di bawah root layout.
 *
 * Tanpa berkas ini, error apa pun yang lolos dari komponen server berakhir di
 * layar bawaan Next — di produksi berbunyi "Application error: a client-side
 * exception has occurred", tanpa merek dan tanpa jalan keluar selain menutup
 * tab. Untuk aplikasi yang dipakai ramai-ramai di satu HP, itu akhir dari
 * permainan mereka.
 *
 * `digest` sengaja ditampilkan: di produksi pesan error asli disembunyikan
 * Next dan diganti sidik ini, jadi ini satu-satunya benang yang menghubungkan
 * keluhan pengguna dengan barisnya di log server.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] error tak tertangani", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-sm space-y-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-pink-50 text-3xl">
          🃏
        </div>

        <h1 className="text-2xl font-bold">Kartunya jatuh berantakan</h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Ada yang error di sisi kami, bukan di HP-mu. Coba muat ulang —
          biasanya langsung jalan lagi.
        </p>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RotateCw />
            Coba lagi
          </Button>
          <Link href="/home" className={buttonVariants({ variant: "outline" })}>
            Kembali ke beranda
          </Link>
        </div>

        {error.digest && (
          <p className="pt-2 text-xs text-neutral-400">
            Kode kejadian: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
