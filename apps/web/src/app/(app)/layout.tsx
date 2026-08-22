import { BottomNav } from "@/components/nav/bottom-nav";

// Guard auth ada di middleware, jadi layout ini tidak memanggil Supabase Auth.
//
// Ia juga sengaja tidak membaca cookie sama sekali. Satu panggilan `cookies()`
// di sini — bahkan yang sudah dibungkus Suspense — menandai *seluruh* rute di
// bawahnya sebagai dinamis, dan rute dinamis dilewatkan oleh prefetch Next.
// Efeknya /store, yang isinya statis dan tidak mengambil data apa pun, ikut
// menunggu satu putaran ke server tiap kali dibuka. Status akses AI untuk
// gembok di tab "Bikin" karena itu diambil BottomNav dari /api/ai-access.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-bottom-nav">{children}</main>
      <BottomNav />
    </div>
  );
}
