import { useT } from "@/lib/i18n";

/**
 * Kepala beranda — tidak menunggu data apa pun, jadi tampil langsung selagi
 * daftar deck dimuat.
 */
export function HomeHeader() {
  const t = useT();
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold">{t.home.title}</h1>
      <p className="text-muted-foreground mt-1">{t.home.subtitle}</p>
    </header>
  );
}
