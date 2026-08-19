import { BackLink } from "@/components/nav/back-link";
import { CardLoader } from "@/components/ui/card-loader";
import { CreateHeader } from "./header";

export default function CreateLoading() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <BackLink href="/home" />
      <CreateHeader />
      <CardLoader label="Menyiapkan formulir" />
    </div>
  );
}
