import { createClient } from "@/lib/supabase/client";

export type CheckoutProduct =
  | { product: "credits"; packId: string }
  | { product: "volume"; categoryId: string; gift?: boolean }
  | { product: "series"; seriesId: string; gift?: boolean };

/**
 * Buka pembayaran Midtrans untuk satu produk. Harga selalu ditentukan
 * server; yang dikirim hanya produknya. Mengembalikan kode error (mis.
 * `already_owned`) kalau ditolak, atau berpindah halaman kalau berhasil.
 */
export async function startCheckout(body: CheckoutProduct): Promise<{ error: string }> {
  try {
    const { data: { session } } = await createClient().auth.getSession();
    if (!session) return { error: "unauthenticated" };
    const response = await fetch("/api/credits/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.redirectUrl) return { error: data.code ?? "unreachable" };
    window.location.assign(data.redirectUrl);
    return { error: "" };
  } catch (cause) {
    console.error("[checkout] gagal membuka pembayaran", cause);
    return { error: "unreachable" };
  }
}
