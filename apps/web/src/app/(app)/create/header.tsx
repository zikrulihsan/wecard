/**
 * Kepala halaman bikin deck — tidak menunggu status akses AI, jadi ditulis
 * sekali di sini dan dipakai bersama oleh `page.tsx` dan `loading.tsx`.
 */
export function CreateHeader() {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold">Bikin Deck Sendiri</h1>
      <p className="text-muted-foreground mt-1">
        Isi konteksnya, AI yang nulis kartunya. Deck ini cuma kelihatan di
        akunmu.
      </p>
    </header>
  );
}
