import { Skeleton } from "@/components/ui/skeleton";

export default function CreateLoading() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <Skeleton className="h-5 w-20 mb-4" />
      <header className="mb-6 space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-72" />
      </header>
      <div className="space-y-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
