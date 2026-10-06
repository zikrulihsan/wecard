/**
 * Kepala beranda — tidak menunggu data apa pun, jadi tampil langsung selagi
 * daftar deck dimuat.
 */
export function HomeHeader() {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold">Mau main apa hari ini?</h1>
      <p className="text-muted-foreground mt-1">Lanjutkan yang tadi, cari deck, atau bikin sendiri.</p>
    </header>
  );
}
