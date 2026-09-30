/**
 * Bagian halaman utama yang tidak menunggu data apa pun. Ditulis sekali di
 * sini lalu dipakai `page.tsx` dan `loading.tsx`, jadi judulnya tidak bergeser
 * saat kerangka rute diganti halaman aslinya.
 */
export function HomeHeader() {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold">Pilih Kategori</h1>
      <p className="text-muted-foreground mt-1">Mau main kartu apa hari ini?</p>
    </header>
  );
}
