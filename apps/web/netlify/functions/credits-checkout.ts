import type { Config } from "@netlify/functions";
import { authenticatedClient } from "../auth";
import { serviceClient } from "../admin";
import { createSnapTransaction } from "../midtrans";
import { reportError, supabaseError } from "../../src/lib/observability";
import { findCreditPack } from "../../src/lib/credits";

export const config: Config = { path: "/api/credits/checkout" };

/**
 * Mulai pembelian paket kredit. Harga diambil dari daftar paket di server —
 * yang dikirim browser hanya id paketnya — lalu pesanan dicatat dengan
 * service_role (user tidak bisa menulis `credit_orders` sendiri), dan
 * browser diarahkan ke halaman bayar Midtrans. Saldo baru bertambah saat
 * webhook `/api/payments/midtrans` menerima pelunasan.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Metode tidak diizinkan", code: "method_not_allowed" }, { status: 405 });
  }
  const auth = await authenticatedClient(request);
  if (!auth) return Response.json({ error: "Belum login", code: "unauthenticated" }, { status: 401 });

  const admin = serviceClient();
  if (!process.env.MIDTRANS_SERVER_KEY || !admin) {
    return Response.json({ error: "Pembelian kredit belum dibuka.", code: "payments_unavailable" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { packId?: unknown } | null;
  const pack = findCreditPack(body?.packId);
  if (!pack) return Response.json({ error: "Paket tidak dikenal.", code: "invalid_input" }, { status: 400 });

  const { data: order, error: orderError } = await admin
    .from("credit_orders")
    .insert({ user_id: auth.user.id, pack_id: pack.id, credits: pack.credits, amount_idr: pack.priceIdr })
    .select("id")
    .single();
  if (orderError || !order) {
    reportError("checkout.pesanan-gagal", { userId: auth.user.id, ...(orderError ? supabaseError(orderError) : {}) });
    return Response.json({ error: "Pesanan belum bisa dibuat. Coba lagi.", code: "save_failed" }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  try {
    const snap = await createSnapTransaction({
      orderId: order.id,
      amountIdr: pack.priceIdr,
      itemId: pack.id,
      itemName: `${pack.credits} kredit FlipCard`,
      email: auth.user.email,
      finishUrl: `${origin}/store?order=${order.id}`,
    });
    return Response.json({ orderId: order.id, redirectUrl: snap.redirect_url });
  } catch (error) {
    await admin.from("credit_orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", order.id);
    reportError("checkout.midtrans-gagal", {
      userId: auth.user.id,
      orderId: order.id,
      cause: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: "Layanan pembayaran sedang bermasalah. Coba lagi sebentar.", code: "unreachable" }, { status: 502 });
  }
}
