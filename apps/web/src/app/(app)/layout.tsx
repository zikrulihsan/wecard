import { Suspense } from "react";
import { getAiAccess } from "@/lib/ai/access";
import { BottomNav } from "@/components/nav/bottom-nav";

// Guard auth ada di middleware; layout ini sengaja tidak memanggil Supabase
// Auth. Satu-satunya query di sini adalah lookup primary key ke profiles
// untuk status akses AI — dan query itu ditaruh di bawah Suspense supaya
// kerangka halaman dan navigasi tidak ikut menunggunya. Layout tidak dirender
// ulang saat pindah tab, jadi query ini jalan sekali per muat halaman.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-bottom-nav">{children}</main>
      {/* Nav tampil utuh sejak awal; gembok di tab "Bikin" menyusul begitu
          status akses diketahui, jadi tidak ada kerangka di sini. */}
      <Suspense fallback={<BottomNav />}>
        <AiAwareBottomNav />
      </Suspense>
    </div>
  );
}

async function AiAwareBottomNav() {
  const canUseAi = await getAiAccess();

  return <BottomNav canUseAi={canUseAi} />;
}
