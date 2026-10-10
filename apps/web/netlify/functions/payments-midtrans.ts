import type { Config } from "@netlify/functions";
import { serviceClient } from "../admin";
import { fetchTransactionStatus, orderOutcome, validSignature, type MidtransStatus } from "../midtrans";
import { reportError, supabaseError } from "../../src/lib/observability";

export const config: Config = { path: "/api/payments/midtrans" };

/**
 * Notifikasi pembayaran dari Midtrans (Payment Notification URL di dashboard
 * Midtrans: https://<domain>/api/payments/midtrans).
 *
 * Isi notifikasi tidak dipercaya begitu saja: tanda tangannya diperiksa, lalu
 * statusnya diambil ulang dari API Midtrans, dan nominalnya dicocokkan dengan
 * pesanan. Pelunasan lewat `fulfill_order`, yang hanya berlaku
 * sekali per pesanan — notifikasi ganda aman.
 */
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const admin = serviceClient();
  if (!process.env.MIDTRANS_SERVER_KEY || !admin) return new Response("Not configured", { status: 503 });

  const body = (await request.json().catch(() => null)) as MidtransStatus | null;
  if (!body?.order_id || !validSignature(body)) {
    reportError("midtrans.tanda-tangan-tidak-valid", { orderId: body?.order_id });
    return new Response("Invalid signature", { status: 401 });
  }

  let status: MidtransStatus;
  try {
    status = await fetchTransactionStatus(body.order_id);
  } catch (error) {
    reportError("midtrans.status-gagal", { orderId: body.order_id, cause: error instanceof Error ? error.message : String(error) });
    // 5xx → Midtrans mengirim ulang notifikasinya nanti.
    return new Response("Status unavailable", { status: 502 });
  }

  const { data: order, error: orderError } = await admin
    .from("credit_orders")
    .select("id, amount_idr, status")
    .eq("id", status.order_id)
    .maybeSingle();
  if (orderError) {
    reportError("midtrans.pesanan-tidak-terbaca", { orderId: status.order_id, ...supabaseError(orderError) });
    return new Response("Order unavailable", { status: 502 });
  }
  // Pesanan bukan milik aplikasi ini (mis. transaksi tes dari dashboard).
  if (!order) return new Response("OK", { status: 200 });

  if (Math.round(Number(status.gross_amount)) !== order.amount_idr) {
    reportError("midtrans.nominal-tidak-cocok", { orderId: order.id, expected: order.amount_idr, got: status.gross_amount });
    return new Response("Amount mismatch", { status: 200 });
  }

  const outcome = orderOutcome(status);
  if (outcome === "paid") {
    const args = {
      p_order: order.id,
      p_provider_ref: status.transaction_id ?? null,
      p_payment_type: status.payment_type ?? null,
    };
    // fulfill_order (00011) menangani kredit, volume, seri, dan hadiah;
    // fulfill_credit_order (00010) dipakai kalau 00011 belum dijalankan.
    let { error } = await admin.rpc("fulfill_order", args);
    if (error?.code === "PGRST202") ({ error } = await admin.rpc("fulfill_credit_order", args));
    if (error) {
      reportError("midtrans.saldo-gagal-ditambah", { orderId: order.id, ...supabaseError(error) });
      return new Response("Fulfillment failed", { status: 500 });
    }
  } else if ((outcome === "failed" || outcome === "expired") && order.status === "pending") {
    await admin.from("credit_orders")
      .update({ status: outcome, payment_type: status.payment_type ?? null, updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("status", "pending");
  }

  return new Response("OK", { status: 200 });
}
