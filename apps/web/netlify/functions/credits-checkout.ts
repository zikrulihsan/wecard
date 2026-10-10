import type { Config } from "@netlify/functions";
import { authenticatedClient } from "../auth";
import { serviceClient } from "../admin";
import { createSnapTransaction } from "../midtrans";
import { reportError, supabaseError } from "../../src/lib/observability";
import type { SupabaseClient } from "@supabase/supabase-js";
import { findCreditPack } from "../../src/lib/credits";

export const config: Config = { path: "/api/credits/checkout" };

/**
 * Mulai pembelian: paket kredit, satu volume deck premium, atau satu seri —
 * untuk diri sendiri atau sebagai hadiah. Harga diambil di server (daftar
 * paket, `categories.price_idr`, `series.price_idr`); yang dikirim browser
 * hanya produknya. Pesanan dicatat dengan service_role (user tidak bisa
 * menulis `credit_orders` sendiri), lalu browser diarahkan ke halaman bayar
 * Midtrans. Saldo/akses baru diberikan saat webhook menerima pelunasan.
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

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const product = await resolveProduct(admin, auth.user.id, body);
  if ("error" in product) {
    return Response.json({ error: product.message, code: product.error }, { status: product.status });
  }

  const { data: order, error: orderError } = await admin
    .from("credit_orders")
    // Kolom produk baru ada sejak 00011; pesanan kredit tidak membutuhkannya
    // (bawaannya 'credits'), jadi pembelian kredit tetap jalan sebelum itu.
    .insert({ user_id: auth.user.id, ...withoutCreditDefaults(product.order) })
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
      amountIdr: product.order.amount_idr,
      itemId: product.order.pack_id,
      itemName: product.itemName,
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

type ProductOrder = {
  pack_id: string;
  amount_idr: number;
  product_type: "credits" | "volume" | "series";
  credits?: number;
  category_id?: string;
  series_id?: string;
  is_gift?: boolean;
};

type Resolved =
  | { order: ProductOrder; itemName: string }
  | { error: string; message: string; status: number };

async function resolveProduct(
  admin: SupabaseClient,
  userId: string,
  body: Record<string, unknown> | null,
): Promise<Resolved> {
  const invalid = { error: "invalid_input", message: "Produk tidak dikenal.", status: 400 };
  // Versi lama halaman Toko hanya mengirim { packId }.
  const kind = body?.product ?? (body?.packId ? "credits" : undefined);
  const gift = body?.gift === true;

  if (kind === "credits") {
    const pack = findCreditPack(body?.packId);
    if (!pack) return invalid;
    return {
      order: { pack_id: pack.id, amount_idr: pack.priceIdr, product_type: "credits", credits: pack.credits },
      itemName: `${pack.credits} kredit FlipCard`,
    };
  }

  if (kind === "volume" && typeof body?.categoryId === "string") {
    const { data: deck } = await admin
      .from("categories")
      .select("id, name, price_idr, is_free, is_active, created_by")
      .eq("id", body.categoryId)
      .maybeSingle();
    if (!deck || deck.is_free || !deck.is_active || deck.created_by || !deck.price_idr) return invalid;
    if (!gift && (await ownsVolume(admin, userId, deck.id))) {
      return { error: "already_owned", message: "Kamu sudah punya deck ini.", status: 409 };
    }
    return {
      order: { pack_id: `volume:${deck.id}`, amount_idr: deck.price_idr, product_type: "volume", category_id: deck.id, is_gift: gift },
      itemName: deck.name.slice(0, 50),
    };
  }

  if (kind === "series" && typeof body?.seriesId === "string") {
    const { data: series } = await admin
      .from("series")
      .select("id, name, price_idr, is_active")
      .eq("id", body.seriesId)
      .maybeSingle();
    if (!series || !series.is_active) return invalid;
    if (!gift) {
      const { data: owned } = await admin.from("series_purchases").select("series_id")
        .eq("user_id", userId).eq("series_id", series.id).maybeSingle();
      if (owned) return { error: "already_owned", message: "Kamu sudah punya seri ini.", status: 409 };
    }
    return {
      order: { pack_id: `series:${series.id}`, amount_idr: series.price_idr, product_type: "series", series_id: series.id, is_gift: gift },
      itemName: `Seri ${series.name}`.slice(0, 50),
    };
  }

  return invalid;
}

async function ownsVolume(admin: SupabaseClient, userId: string, categoryId: string): Promise<boolean> {
  const { data: purchase } = await admin.from("purchases").select("id")
    .eq("user_id", userId).eq("category_id", categoryId).eq("status", "completed").maybeSingle();
  if (purchase) return true;
  const { data: deck } = await admin.from("categories").select("series_id").eq("id", categoryId).maybeSingle();
  if (!deck?.series_id) return false;
  const { data: series } = await admin.from("series_purchases").select("series_id")
    .eq("user_id", userId).eq("series_id", deck.series_id).maybeSingle();
  return Boolean(series);
}

function withoutCreditDefaults(order: ProductOrder) {
  if (order.product_type !== "credits") return order;
  const rest: Partial<ProductOrder> = { ...order };
  delete rest.product_type;
  return rest;
}
