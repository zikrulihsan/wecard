import { useState } from "react";
import { RotateCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoadError({
  title = "Gagal memuat",
  description = "Sambungan ke server bermasalah. Biasanya sebentar saja.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void | Promise<void>;
}) {
  const [retrying, setRetrying] = useState(false);
  async function retry() {
    if (!onRetry) { window.location.reload(); return; }
    setRetrying(true);
    try { await onRetry(); } finally { setRetrying(false); }
  }
  return (
    <Card><CardContent className="py-8 text-center space-y-3">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"><WifiOff className="size-5" /></div>
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{description}</p>
      <div className="pt-2"><Button onClick={retry} disabled={retrying}><RotateCw className={retrying ? "animate-spin" : undefined} />{retrying ? "Mencoba lagi…" : "Coba lagi"}</Button></div>
    </CardContent></Card>
  );
}
