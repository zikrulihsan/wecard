import { getAiAccess } from "@/lib/ai/access";
import { BottomNav } from "@/components/nav/bottom-nav";

// Guard auth ada di middleware; layout ini sengaja tidak memanggil Supabase
// Auth. Satu-satunya query di sini adalah lookup primary key ke profiles
// untuk status akses AI. Layout tidak dirender ulang saat pindah tab, jadi
// query ini jalan sekali per muat halaman, bukan tiap navigasi.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const canUseAi = await getAiAccess();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-bottom-nav">{children}</main>
      <BottomNav canUseAi={canUseAi} />
    </div>
  );
}
