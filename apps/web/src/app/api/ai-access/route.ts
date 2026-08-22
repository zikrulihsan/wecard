import { NextResponse } from "next/server";
import { getAiAccess } from "@/lib/ai/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sisa jatah generate AI untuk sesi yang sedang berjalan, dibaca dari klien.
 *
 * Sebelumnya nilai ini dibaca di `(app)/layout.tsx`. Masalahnya, membaca cookie
 * di layout menandai *seluruh* rute di bawahnya sebagai dinamis — termasuk
 * /store, yang tidak mengambil data apa pun. Rute dinamis dilewatkan oleh
 * prefetch Next, jadi halaman yang seharusnya muncul seketika ikut menunggu
 * satu putaran ke server. Dipindah ke sini supaya layout-nya bersih dari
 * cookie dan /store bisa dirender statis.
 *
 * Ini cuma untuk menggambar gembok di nav. Gerbang sebenarnya tetap RLS di
 * Postgres, ditambah pengecekan di POST /api/decks/generate.
 */
export async function GET() {
  const { canGenerate, enabled, used, limit, remaining } = await getAiAccess();

  return NextResponse.json(
    // `canUseAi` dipertahankan namanya supaya klien lama tidak ikut berubah;
    // artinya sekarang "masih boleh generate", termasuk soal kuota.
    { canUseAi: canGenerate, enabled, used, limit, remaining },
    { headers: { "Cache-Control": "no-store" } }
  );
}
