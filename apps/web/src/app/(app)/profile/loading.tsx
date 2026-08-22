import { CardLoader } from "@/components/ui/card-loader";
import { ProfileHeader } from "./header";
import { LogoutButton } from "./logout-button";

/**
 * Kerangka rute /profile. Bentuknya menyusun ulang bagian halaman yang tidak
 * menunggu data — termasuk tombol keluar, yang tidak bergantung pada query
 * profil dan sudah berfungsi begitu hidrasi selesai. Kalau tombol itu baru
 * muncul setelah query selesai, isi halaman ikut bergeser turun.
 */
export default function ProfileLoading() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <ProfileHeader />
      <CardLoader label="Mengambil profil" />
      <LogoutButton />
    </div>
  );
}
