import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, CheckCircle2, Clock, Coins, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAiAccessDetails, invalidateAiAccess } from "@/lib/ai/access-client";
import type { AiAccess } from "@/lib/ai/access";
import { CREDIT_PACKS, FREE_CARD_SWAPS, FREE_REGENERATIONS } from "@/lib/credits";
import { formatIdr } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/client";
import { LOCALES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LedgerRow = { id: string; delta: number; reason: string; created_at: string };
type OrderState = "checking" | "pending" | "paid" | "failed";

// Paket dengan harga per kredit termurah diberi tanda "paling hemat".
const BEST_VALUE = CREDIT_PACKS.reduce((best, pack) =>
  pack.priceIdr / pack.credits < best.priceIdr / best.credits ? pack : best
).id;

/**
 * Toko kredit. Pembelian: tombol beli → `/api/credits/checkout` → halaman
 * bayar Midtrans → kembali ke `/store?order=<id>`, lalu halaman ini menunggu
 * webhook menandai pesanannya lunas. Saldo hanya bertambah lewat webhook,
 * bukan dari halaman ini.
 */
export default function StorePage() {
  const { t, language } = useI18n();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const [access, setAccess] = useState<AiAccess | null>(null);
  const [error, setError] = useState(false);
  const [history, setHistory] = useState<LedgerRow[] | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [buyError, setBuyError] = useState(false);
  const [order, setOrder] = useState<{ state: OrderState; credits?: number } | null>(
    orderId ? { state: "checking" } : null
  );
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    fetchAiAccessDetails()
      .then((value) => { if (active) setAccess(value); })
      .catch(() => { if (active) setError(true); });
    createClient().from("credit_ledger")
      .select("id, delta, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => { if (active) setHistory(data ?? []); });
    return () => { active = false; };
  }, [refresh]);

  // Kembali dari Midtrans: tanyakan status pesanan sampai lunas/gagal.
  // Webhook biasanya datang dalam hitungan detik; setelah ±2 menit berhenti
  // bertanya dan biarkan statusnya "menunggu".
  useEffect(() => {
    if (!orderId) return;
    let active = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      const { data } = await createClient().from("credit_orders")
        .select("status, credits").eq("id", orderId).maybeSingle();
      if (!active) return;
      if (data?.status === "paid") {
        setOrder({ state: "paid", credits: data.credits });
        invalidateAiAccess();
        setRefresh((value) => value + 1);
        return;
      }
      if (data?.status === "failed" || data?.status === "expired") {
        setOrder({ state: "failed" });
        return;
      }
      setOrder({ state: "pending" });
      attempts += 1;
      if (attempts < 40) timer = setTimeout(check, 3000);
    };
    check();
    return () => { active = false; clearTimeout(timer); };
  }, [orderId]);

  async function buy(packId: string) {
    setBuying(packId);
    setBuyError(false);
    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) throw new Error("Belum login");
      const response = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ packId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.redirectUrl) throw new Error(data.error ?? "checkout gagal");
      window.location.assign(data.redirectUrl);
    } catch (cause) {
      console.error("[store] gagal membuka pembayaran", cause);
      setBuyError(true);
      setBuying(null);
    }
  }

  const s = t.store;
  const dateFormat = new Intl.DateTimeFormat(LOCALES[language], { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{s.title}</h1>
        <p className="text-muted-foreground mt-1">{s.subtitle}</p>
      </header>

      {order && <OrderNotice state={order.state} credits={order.credits} />}

      <Card className="p-5">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Coins className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{s.balanceLabel}</p>
            {error ? <p className="text-sm text-destructive">{s.loadError}</p> :
              !access ? <Skeleton className="mt-1 h-8 w-24" /> :
              <p className="text-3xl font-bold">{access.unlimited ? s.balanceUnlimited : access.balance}</p>}
          </div>
        </div>
      </Card>

      <ul className="space-y-2 text-sm">
        {s.rules(FREE_REGENERATIONS, FREE_CARD_SWAPS).map((rule) => (
          <li key={rule} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-pink-600" />
            <span className="text-muted-foreground">{rule}</span>
          </li>
        ))}
      </ul>

      <section className="space-y-3">
        <h2 className="font-semibold">{s.packsTitle}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CREDIT_PACKS.map((pack) => {
            const best = pack.id === BEST_VALUE;
            return (
              <Card key={pack.id} className={cn("relative space-y-3 p-5", best && "ring-2 ring-pink-300")}>
                {best && (
                  <span className="absolute top-3 right-3 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                    {s.bestValue}
                  </span>
                )}
                <div>
                  <p className="text-2xl font-bold">{s.packName(pack.credits)}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.packPerDeck(formatIdr(Math.round(pack.priceIdr / pack.credits)))}
                  </p>
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="w-full rounded-full"
                  variant={best ? "default" : "outline"}
                  disabled={!access?.paymentsEnabled || buying !== null}
                  onClick={() => buy(pack.id)}
                >
                  {buying === pack.id ? <><Loader2 className="size-4 animate-spin" />{s.buying}</> : s.buy(formatIdr(pack.priceIdr))}
                </Button>
              </Card>
            );
          })}
        </div>
        {access && !access.paymentsEnabled && <p className="text-sm text-muted-foreground">{s.soon}</p>}
        {buyError && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{s.buyError}</p>}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">{s.historyTitle}</h2>
        {history === null ? <Skeleton className="h-20 w-full" /> :
          history.length === 0 ? <p className="text-sm text-muted-foreground">{s.historyEmpty}</p> : (
            <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
              {history.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p>{s.reasons[row.reason] ?? row.reason}</p>
                    <p className="text-xs text-muted-foreground">{dateFormat.format(new Date(row.created_at))}</p>
                  </div>
                  <span className={cn("shrink-0 font-semibold tabular-nums", row.delta > 0 ? "text-emerald-600" : "text-neutral-500")}>
                    {row.delta > 0 ? `+${row.delta}` : row.delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
      </section>

      <p className="text-center text-sm text-muted-foreground">🛍️ {s.premiumSoon}</p>
    </div>
  );
}

function OrderNotice({ state, credits }: { state: OrderState; credits?: number }) {
  const s = useI18n().t.store;
  const config = {
    checking: { icon: Loader2, text: s.orderChecking, className: "bg-neutral-50 text-neutral-700", spin: true },
    pending: { icon: Clock, text: s.orderPending, className: "bg-amber-50 text-amber-800", spin: false },
    paid: { icon: CheckCircle2, text: s.orderPaid(credits ?? 0), className: "bg-emerald-50 text-emerald-800", spin: false },
    failed: { icon: XCircle, text: s.orderFailed, className: "bg-destructive/10 text-destructive", spin: false },
  }[state];
  const Icon = config.icon;
  return (
    <div role="status" className={cn("flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium", config.className)}>
      <Icon className={cn("size-4 shrink-0", config.spin && "animate-spin")} />
      {config.text}
    </div>
  );
}
