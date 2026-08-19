/**
 * Kepala halaman profil — tidak menunggu data, jadi ditulis sekali di sini
 * dan dipakai bersama oleh `page.tsx` dan `loading.tsx`.
 */
export function ProfileHeader() {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold">Profil</h1>
    </header>
  );
}
