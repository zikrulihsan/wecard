import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Midtrans Snap. Kunci server hanya ada di env Netlify:
 *
 *   MIDTRANS_SERVER_KEY      wajib — tanpa ini paket kredit tampil "segera hadir"
 *   MIDTRANS_PRODUCTION      "true" untuk transaksi sungguhan; selain itu sandbox
 */

function serverKey(): string {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) throw new Error("MIDTRANS_SERVER_KEY belum diset");
  return key;
}

const production = () => process.env.MIDTRANS_PRODUCTION === "true";

function authHeader() {
  return `Basic ${Buffer.from(`${serverKey()}:`).toString("base64")}`;
}

export type SnapTransaction = { token: string; redirect_url: string };

export async function createSnapTransaction(params: {
  orderId: string;
  amountIdr: number;
  itemId: string;
  itemName: string;
  email: string | undefined;
  finishUrl: string;
}): Promise<SnapTransaction> {
  const url = production()
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authHeader() },
    body: JSON.stringify({
      transaction_details: { order_id: params.orderId, gross_amount: params.amountIdr },
      item_details: [{ id: params.itemId, price: params.amountIdr, quantity: 1, name: params.itemName }],
      customer_details: params.email ? { email: params.email } : undefined,
      callbacks: { finish: params.finishUrl },
    }),
  });
  if (!response.ok) {
    throw new Error(`Midtrans Snap ${response.status}: ${await response.text()}`);
  }
  return (await response.json()) as SnapTransaction;
}

export type MidtransStatus = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  signature_key?: string;
};

/** Status transaksi langsung dari API Midtrans — sumber kebenaran, bukan isi notifikasi. */
export async function fetchTransactionStatus(orderId: string): Promise<MidtransStatus> {
  const base = production() ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
  const response = await fetch(`${base}/v2/${encodeURIComponent(orderId)}/status`, {
    headers: { Accept: "application/json", Authorization: authHeader() },
  });
  if (!response.ok) throw new Error(`Midtrans status ${response.status}`);
  return (await response.json()) as MidtransStatus;
}

/** signature_key = SHA512(order_id + status_code + gross_amount + server_key). */
export function validSignature(body: MidtransStatus): boolean {
  if (!body.signature_key) return false;
  const expected = createHash("sha512")
    .update(`${body.order_id}${body.status_code}${body.gross_amount}${serverKey()}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(body.signature_key);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Ringkas status Midtrans jadi status pesanan kita. */
export function orderOutcome(status: MidtransStatus): "paid" | "pending" | "failed" | "expired" {
  const tx = status.transaction_status;
  if (tx === "settlement") return "paid";
  if (tx === "capture") return status.fraud_status === "accept" || !status.fraud_status ? "paid" : "pending";
  if (tx === "expire") return "expired";
  if (tx === "deny" || tx === "cancel" || tx === "failure") return "failed";
  return "pending";
}
