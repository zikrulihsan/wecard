import { Skeleton } from "@/components/ui/skeleton";

export default function DeckLoading() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-6">
      <Skeleton className="h-5 w-20 mb-4" />
      <header className="mb-6 space-y-2">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-5 w-full max-w-sm" />
      </header>
      <Skeleton className="h-5 w-24 mb-3" />
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
        ))}
      </div>
      <div className="pt-8">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
