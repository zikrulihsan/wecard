// Tidak ada data yang diambil di halaman ini, jadi tidak ada yang perlu
// ditunggu — biarkan dirender statis supaya muncul seketika saat dibuka.
export default function StorePage() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Toko</h1>
        <p className="text-muted-foreground mt-1">
          Beli kategori berbayar untuk membuka kartu baru
        </p>
      </header>

      <div className="text-center py-16 text-muted-foreground">
        <div className="text-4xl mb-3">🛍️</div>
        <p>Kategori berbayar akan segera hadir.</p>
      </div>
    </div>
  );
}
