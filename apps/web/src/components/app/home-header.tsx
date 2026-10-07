import { useT } from "@/lib/i18n";

/**
 * Bagian halaman utama yang tidak menunggu data apa pun. Ditulis sekali di
 * sini lalu dipakai `page.tsx` dan `loading.tsx`, jadi judulnya tidak bergeser
 * saat kerangka rute diganti halaman aslinya.
 */
export function HomeHeader() {
  const t = useT();
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold">{t.home.title}</h1>
      <p className="text-muted-foreground mt-1">{t.home.subtitle}</p>
    </header>
  );
}
