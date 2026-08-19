import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fallback netral untuk rute di grup (app) yang belum punya skeleton sendiri.
 * Sengaja tidak berbentuk halaman tertentu — skeleton yang bentuknya meleset
 * dari isi aslinya justru menambah kesan patah saat kontennya masuk.
 */
export default function AppLoading() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-5 w-56" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
