import { useT } from "@/lib/i18n";

// Tidak ada data yang diambil di halaman ini, jadi tidak ada yang perlu
// ditunggu — biarkan dirender statis supaya muncul seketika saat dibuka.
export default function StorePage() {
  const t = useT();
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{t.store.title}</h1>
        <p className="text-muted-foreground mt-1">
          {t.store.subtitle}
        </p>
      </header>

      <div className="text-center py-16 text-muted-foreground">
        <div className="text-4xl mb-3">🛍️</div>
        <p>{t.store.soon}</p>
      </div>
    </div>
  );
}
