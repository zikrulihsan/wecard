import { BackLink } from "@/components/nav/back-link";
import { CardLoader } from "@/components/ui/card-loader";

// Nama deck dan daftar level sama-sama dari query, jadi di rute ini yang tetap
// cuma tautan kembali.
export default function DeckDetailLoading() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href="/home" />
      <CardLoader label="Membuka deck" />
    </div>
  );
}
