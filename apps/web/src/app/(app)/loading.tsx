export default function Loading() {
  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <div className="h-9 w-48 rounded-lg bg-neutral-200 animate-pulse" />
        <div className="h-5 w-64 rounded-md bg-neutral-100 animate-pulse" />
      </header>
      <div className="grid gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-36 rounded-2xl bg-neutral-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
