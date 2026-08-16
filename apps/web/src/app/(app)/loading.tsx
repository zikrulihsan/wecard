export default function AppLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div
        className="size-8 rounded-full border-2 border-neutral-200 border-t-primary animate-spin"
        role="status"
        aria-label="Memuat halaman"
      />
    </div>
  );
}
