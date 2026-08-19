import { CardLoader } from "@/components/ui/card-loader";
import { HomeHeader } from "./header";

/**
 * Kerangka rute /home.
 *
 * Keberadaan berkas ini yang membuat rute dinamis ini bisa di-prefetch: tanpa
 * batas loading, Next melewatkan prefetch untuk rute dinamis sama sekali, dan
 * ketukan tab baru menampilkan apa pun setelah satu putaran penuh ke server.
 */
export default function HomeLoading() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <HomeHeader />
      <CardLoader label="Mengambil daftar deck" />
    </div>
  );
}
