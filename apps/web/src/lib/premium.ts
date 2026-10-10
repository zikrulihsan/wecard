import type { DeckLanguage, DeckTheme } from "@flipcard/types";
import { createClient } from "@/lib/supabase/client";
import { resolveDeckTheme } from "@/lib/deck-theme";
import { resolveDeckLanguage } from "@/lib/deck-language";

/**
 * Deck premium: seri kurasi berbayar yang terdiri dari beberapa volume.
 * Tanpa membeli, setiap volume hanya membuka kartu preview-nya (RLS kartu);
 * membeli seri membuka semua volume, termasuk yang terbit belakangan.
 */

export type PremiumVolume = {
  id: string;
  name: string;
  description: string | null;
  volume: number;
  theme: DeckTheme;
  priceIdr: number;
  cardTotal: number;
  previewCount: number;
  owned: boolean;
};

export type PremiumSeries = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  theme: DeckTheme;
  language: DeckLanguage;
  priceIdr: number;
  owned: boolean;
  volumes: PremiumVolume[];
};

type RawVolume = {
  id: string; name: string; description: string | null; volume: number; theme: unknown;
  price_idr: number | null; card_total: number; preview_count: number; owned: boolean;
};
type RawSeries = {
  id: string; slug: string; name: string; description: string | null; theme: unknown; language: unknown;
  price_idr: number; owned: boolean; volumes: RawVolume[];
};

export async function fetchPremiumCatalog(): Promise<PremiumSeries[]> {
  const { data, error } = await createClient().rpc("premium_catalog");
  if (error) throw error;
  return ((data ?? []) as RawSeries[]).map((series) => ({
    id: series.id,
    slug: series.slug,
    name: series.name,
    description: series.description,
    theme: resolveDeckTheme(series.theme),
    language: resolveDeckLanguage(series.language),
    priceIdr: series.price_idr,
    owned: series.owned,
    volumes: (series.volumes ?? []).map((volume) => ({
      id: volume.id,
      name: volume.name,
      description: volume.description,
      volume: volume.volume,
      theme: resolveDeckTheme(volume.theme),
      priceIdr: volume.price_idr ?? 0,
      cardTotal: volume.card_total,
      previewCount: volume.preview_count,
      owned: series.owned || volume.owned,
    })),
  }));
}

/** Nama volume tanpa awalan nama seri: "Vol. 1: Everyday English". */
export function shortVolumeName(series: { name: string }, volume: { name: string }) {
  const prefix = `${series.name} · `;
  return volume.name.startsWith(prefix) ? volume.name.slice(prefix.length) : volume.name;
}

export type RedeemResult =
  | { ok: true; productType: string; categoryId: string | null; seriesSlug: string | null }
  | { ok: false; code: string; categoryId?: string | null };

export async function redeemGift(code: string): Promise<RedeemResult> {
  const { data, error } = await createClient().rpc("redeem_gift", { p_code: code });
  if (error) throw error;
  const result = data as {
    ok: boolean; code?: string; product_type?: string; category_id?: string | null; series_slug?: string | null;
  };
  return result.ok
    ? { ok: true, productType: result.product_type ?? "", categoryId: result.category_id ?? null, seriesSlug: result.series_slug ?? null }
    : { ok: false, code: result.code ?? "unknown", categoryId: result.category_id ?? null };
}

export function giftUrl(code: string) {
  return `${window.location.origin}/hadiah/${code}`;
}
