import { useT } from "@/lib/i18n";

/**
 * Kepala halaman bikin deck — tidak menunggu status akses AI, jadi ditulis
 * sekali di sini dan dipakai bersama oleh `page.tsx` dan `loading.tsx`.
 */
export function CreateHeader() {
  const t = useT();
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold">{t.create.title}</h1>
      <p className="text-muted-foreground mt-1">{t.create.subtitle}</p>
    </header>
  );
}
