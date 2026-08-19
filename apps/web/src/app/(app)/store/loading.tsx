import { Skeleton } from "@/components/ui/skeleton";

export default function StoreLoading() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8">
      <header className="mb-6 space-y-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-5 w-72" />
      </header>
      <div className="flex flex-col items-center gap-3 py-16">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-5 w-56" />
      </div>
    </div>
  );
}
