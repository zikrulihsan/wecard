-- ============================================================
-- DECK PREMIUM (FASE 3: SERI PREMIUM PERTAMA)
--
--   series            seri kurasi berbayar, misal "English Speaking
--                     Practice". Volume-nya adalah kategori biasa
--                     (categories.series_id + volume), harga per
--                     volume di categories.price_idr.
--   series_purchases  pembeli seri — membuka SEMUA volume seri itu,
--                     termasuk volume yang terbit belakangan.
--   purchases         (sudah ada sejak 00001) pembeli satu volume.
--   gift_codes        hadiah: pembeli membayar, penerima menukar kode.
--
-- Aturan akses deck premium:
--   - Tanpa membeli: hanya kartu preview (is_free_preview), 3–5 per
--     volume. Dijaga RLS kartu, termasuk untuk tamu tanpa akun.
--   - Tidak bisa diduplikat ke akun lain — harus beli (atau dihadiahi).
--   - Pemilik bisa membuat "versi pribadi" seharga 1 kredit untuk
--     menambah kartu sendiri (personalize_premium).
--
-- Sekalian aturan deck custom yang tersisa dari fase 1:
--   - Duplikat ke akun lain: 1 kredit (copy_shared_deck lewat link main).
--   - Hadiah: pemilik membayar 1 kredit, penerima menukar kode dan
--     mendapat salinannya (gift_custom_deck).
--
-- Pesanan Midtrans (credit_orders) diperluas untuk volume & seri.
--
-- Butuh migration 00001–00010. Aman dijalankan ulang.
-- ============================================================

-- ------------------------------------------------------------
-- Seri & volume
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS series (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  theme       TEXT,
  language    TEXT NOT NULL DEFAULT 'id',
  price_idr   INTEGER NOT NULL CHECK (price_idr > 0),
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE series ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read series" ON series;
CREATE POLICY "Public read series" ON series FOR SELECT USING (is_active);

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS series_id          UUID REFERENCES series(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS volume             INTEGER,
  -- Salinan pribadi / hadiah: asal deck-nya.
  ADD COLUMN IF NOT EXISTS source_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  -- Versi pribadi deck premium: isinya konten berbayar, jadi tidak boleh
  -- dibagikan lewat link, disalin, atau dihadiahkan.
  ADD COLUMN IF NOT EXISTS premium_copy BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_categories_series ON categories(series_id, volume);

CREATE TABLE IF NOT EXISTS series_purchases (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id    UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  order_id     UUID,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, series_id)
);

ALTER TABLE series_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read own series purchases" ON series_purchases;
CREATE POLICY "Read own series purchases" ON series_purchases
  FOR SELECT USING (user_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.series_purchases FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.purchases FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.series FROM authenticated;
REVOKE ALL ON public.series_purchases FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.purchases FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.series FROM anon;

-- ------------------------------------------------------------
-- Kepemilikan
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.owns_deck(p_category UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM purchases p
      WHERE p.user_id = auth.uid() AND p.category_id = p_category AND p.status = 'completed'
    )
    OR EXISTS (
      SELECT 1 FROM categories c
      JOIN series_purchases sp ON sp.series_id = c.series_id AND sp.user_id = auth.uid()
      WHERE c.id = p_category
    )
  );
$$;

-- Id deck berbayar yang sudah dimiliki pemanggil (beli volume atau seri).
CREATE OR REPLACE FUNCTION public.owned_category_ids()
RETURNS UUID[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(DISTINCT id), '{}') FROM (
    SELECT p.category_id AS id FROM purchases p
    WHERE p.user_id = auth.uid() AND p.status = 'completed'
    UNION
    SELECT c.id FROM categories c
    JOIN series_purchases sp ON sp.series_id = c.series_id AND sp.user_id = auth.uid()
  ) owned;
$$;

-- Kartu: aturan 00002, dengan pembelian seri ikut membuka volume.
DROP POLICY IF EXISTS "Read cards" ON cards;
CREATE POLICY "Read cards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sections s
      JOIN categories c ON c.id = s.category_id
      WHERE s.id = cards.section_id
      AND (
        c.created_by = auth.uid()
        OR (
          c.created_by IS NULL
          AND (cards.is_free_preview = true OR c.is_free = true OR public.owns_deck(c.id))
        )
      )
    )
  );

DROP POLICY IF EXISTS "Delete cards in own categories" ON cards;
CREATE POLICY "Delete cards in own categories" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sections s JOIN categories c ON c.id = s.category_id
      WHERE s.id = cards.section_id AND c.created_by = auth.uid()
    )
  );

-- Katalog untuk Toko dan halaman seri: seri, volume, jumlah kartu
-- (termasuk yang terkunci), dan apa yang sudah dimiliki pemanggil.
CREATE OR REPLACE FUNCTION public.premium_catalog()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', s.id,
    'slug', s.slug,
    'name', s.name,
    'description', s.description,
    'theme', s.theme,
    'language', s.language,
    'price_idr', s.price_idr,
    'owned', EXISTS (SELECT 1 FROM series_purchases sp WHERE sp.series_id = s.id AND sp.user_id = auth.uid()),
    'volumes', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'description', c.description,
        'volume', c.volume,
        'theme', c.theme,
        'price_idr', c.price_idr,
        'card_total', (SELECT COUNT(*) FROM cards k JOIN sections x ON x.id = k.section_id WHERE x.category_id = c.id),
        'preview_count', (SELECT COUNT(*) FROM cards k JOIN sections x ON x.id = k.section_id WHERE x.category_id = c.id AND k.is_free_preview),
        'owned', public.owns_deck(c.id)
      ) ORDER BY c.volume)
      FROM categories c
      WHERE c.series_id = s.id AND c.is_active AND c.created_by IS NULL
    ), '[]'::jsonb)
  ) ORDER BY s.sort_order), '[]'::jsonb)
  FROM series s
  WHERE s.is_active;
$$;

-- ------------------------------------------------------------
-- Pesanan: kredit, volume, atau seri — untuk diri sendiri atau hadiah
-- ------------------------------------------------------------
ALTER TABLE credit_orders
  -- 'credits' | 'volume' | 'series'
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'credits',
  ADD COLUMN IF NOT EXISTS category_id  UUID REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS series_id    UUID REFERENCES series(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_gift      BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE credit_orders ALTER COLUMN credits DROP NOT NULL;
ALTER TABLE credit_orders DROP CONSTRAINT IF EXISTS credit_orders_credits_check;
ALTER TABLE credit_orders DROP CONSTRAINT IF EXISTS credit_orders_product;
ALTER TABLE credit_orders ADD CONSTRAINT credit_orders_product CHECK (
  (product_type = 'credits' AND credits > 0)
  OR (product_type = 'volume' AND category_id IS NOT NULL)
  OR (product_type = 'series' AND series_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS gift_codes (
  code         TEXT PRIMARY KEY
               DEFAULT upper(substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 10)),
  -- 'volume' | 'series' | 'custom_copy'
  product_type TEXT NOT NULL,
  category_id  UUID REFERENCES categories(id) ON DELETE CASCADE,
  series_id    UUID REFERENCES series(id) ON DELETE CASCADE,
  buyer_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id     UUID,
  redeemed_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at  TIMESTAMPTZ,
  -- Untuk hadiah deck custom: salinan yang dibuat saat ditukar.
  result_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_codes_buyer ON gift_codes(buyer_id, created_at DESC);

ALTER TABLE gift_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read own gift codes" ON gift_codes;
CREATE POLICY "Read own gift codes" ON gift_codes
  FOR SELECT USING (buyer_id = auth.uid() OR redeemed_by = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.gift_codes FROM authenticated;
REVOKE ALL ON public.gift_codes FROM anon;

-- Berikan produk ke satu akun. Internal — dipanggil fungsi lain.
CREATE OR REPLACE FUNCTION public.grant_product(
  p_user UUID, p_type TEXT, p_category UUID, p_series UUID, p_order UUID, p_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_type = 'volume' THEN
    INSERT INTO purchases (user_id, category_id, payment_method, payment_ref, amount_idr, status)
    VALUES (p_user, p_category, 'midtrans', p_order::text, COALESCE(p_amount, 0), 'completed')
    ON CONFLICT (user_id, category_id) DO UPDATE SET status = 'completed';
  ELSIF p_type = 'series' THEN
    INSERT INTO series_purchases (user_id, series_id, order_id)
    VALUES (p_user, p_series, p_order)
    ON CONFLICT (user_id, series_id) DO NOTHING;
  END IF;
END;
$$;

-- Lunasi pesanan, sekali saja. Kredit → saldo; volume/seri → akses,
-- atau kode hadiah kalau pesanannya hadiah. Hanya untuk service_role.
CREATE OR REPLACE FUNCTION public.fulfill_order(
  p_order        UUID,
  p_provider_ref TEXT,
  p_payment_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order credit_orders%ROWTYPE;
BEGIN
  SELECT * INTO v_order FROM credit_orders WHERE id = p_order FOR UPDATE;
  IF NOT FOUND OR v_order.status = 'paid' THEN RETURN false; END IF;

  UPDATE credit_orders
  SET status = 'paid', provider_ref = p_provider_ref, payment_type = p_payment_type,
      paid_at = now(), updated_at = now()
  WHERE id = p_order;

  IF v_order.product_type = 'credits' THEN
    INSERT INTO credit_ledger (user_id, delta, reason, order_id)
    VALUES (v_order.user_id, v_order.credits, 'purchase', p_order);
  ELSIF v_order.is_gift THEN
    INSERT INTO gift_codes (product_type, category_id, series_id, buyer_id, order_id)
    VALUES (v_order.product_type, v_order.category_id, v_order.series_id, v_order.user_id, p_order);
  ELSE
    PERFORM public.grant_product(v_order.user_id, v_order.product_type,
      v_order.category_id, v_order.series_id, p_order, v_order.amount_idr);
  END IF;
  RETURN true;
END;
$$;

-- Nama lama tetap ada untuk webhook versi sebelumnya.
CREATE OR REPLACE FUNCTION public.fulfill_credit_order(
  p_order UUID, p_provider_ref TEXT, p_payment_type TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT public.fulfill_order(p_order, p_provider_ref, p_payment_type); $$;

-- ------------------------------------------------------------
-- Salin deck (versi pribadi, salinan dari link, hadiah)
-- ------------------------------------------------------------
-- Internal: salin kategori + section + kartu ke akun p_owner sebagai
-- deck milik sendiri yang sudah tersimpan.
DROP FUNCTION IF EXISTS public.clone_deck(UUID, UUID, TEXT);
CREATE OR REPLACE FUNCTION public.clone_deck(p_source UUID, p_owner UUID, p_name TEXT, p_premium BOOLEAN)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new UUID := gen_random_uuid();
  v_section RECORD;
  v_new_section UUID;
BEGIN
  INSERT INTO categories (id, slug, name, description, theme, mode, language, is_free, price_idr,
    sort_order, is_active, created_by, is_ai_generated, status, source_category_id, premium_copy)
  SELECT v_new, 'copy-' || substr(replace(v_new::text, '-', ''), 1, 12), p_name, c.description,
    c.theme, c.mode, c.language, true, NULL, 100, true, p_owner, false, 'saved', c.id,
    p_premium OR c.premium_copy
  FROM categories c WHERE c.id = p_source;

  FOR v_section IN SELECT * FROM sections WHERE category_id = p_source ORDER BY sort_order LOOP
    v_new_section := gen_random_uuid();
    INSERT INTO sections (id, category_id, slug, name, description, sort_order, icon)
    VALUES (v_new_section, v_new, v_section.slug, v_section.name, v_section.description,
      v_section.sort_order, v_section.icon);
    INSERT INTO cards (section_id, card_type, difficulty, content_text, special_kind,
      is_free_preview, sort_order, is_ai_generated, details, level)
    SELECT v_new_section, k.card_type, k.difficulty, k.content_text, k.special_kind,
      true, k.sort_order, k.is_ai_generated, k.details, k.level
    FROM cards k WHERE k.section_id = v_section.id;
  END LOOP;

  RETURN v_new;
END;
$$;

-- Versi pribadi deck premium milik sendiri, 1 kredit. Hasilnya deck
-- milik pemanggil yang bisa ditambah kartu sendiri.
CREATE OR REPLACE FUNCTION public.personalize_premium(p_category UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
  v_new  UUID;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'unauthenticated'); END IF;

  SELECT name INTO v_name FROM categories
  WHERE id = p_category AND created_by IS NULL AND NOT is_free AND is_active;
  IF v_name IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  IF NOT public.owns_deck(p_category) THEN RETURN jsonb_build_object('ok', false, 'code', 'not_owned'); END IF;

  IF NOT public.is_ai_unlimited() AND NOT public.spend_credit('personalize', p_category) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'no_credits');
  END IF;

  v_new := public.clone_deck(p_category, auth.uid(), v_name || ' ✎', true);
  RETURN jsonb_build_object('ok', true, 'category_id', v_new);
END;
$$;

-- Simpan deck custom dari link main ke akun sendiri, 1 kredit.
CREATE OR REPLACE FUNCTION public.copy_shared_deck(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source UUID;
  v_owner  UUID;
  v_name   TEXT;
  v_new    UUID;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'unauthenticated'); END IF;

  SELECT c.id, c.created_by, c.name INTO v_source, v_owner, v_name
  FROM deck_shares d JOIN categories c ON c.id = d.category_id
  WHERE d.token = p_token AND d.enabled AND c.is_active AND c.status = 'saved' AND NOT c.premium_copy;
  IF v_source IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  IF v_owner = auth.uid() THEN RETURN jsonb_build_object('ok', false, 'code', 'own_deck'); END IF;

  IF NOT public.is_ai_unlimited() AND NOT public.spend_credit('copy', v_source) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'no_credits');
  END IF;

  v_new := public.clone_deck(v_source, auth.uid(), v_name, false);
  RETURN jsonb_build_object('ok', true, 'category_id', v_new);
END;
$$;

-- Hadiahkan deck custom milik sendiri: 1 kredit dari pemberi, hasilnya
-- kode yang ditukar penerima menjadi salinan deck.
CREATE OR REPLACE FUNCTION public.gift_custom_deck(p_category UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'unauthenticated'); END IF;
  IF NOT EXISTS (
    SELECT 1 FROM categories WHERE id = p_category AND created_by = auth.uid() AND status = 'saved'
      AND NOT premium_copy
  ) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;

  IF NOT public.is_ai_unlimited() AND NOT public.spend_credit('gift', p_category) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'no_credits');
  END IF;

  INSERT INTO gift_codes (product_type, category_id, buyer_id)
  VALUES ('custom_copy', p_category, auth.uid())
  RETURNING code INTO v_code;
  RETURN jsonb_build_object('ok', true, 'code', v_code);
END;
$$;

-- Tukar kode hadiah. Kode yang sudah dipakai, atau produk yang sudah
-- dimiliki, tidak menghabiskan kode.
CREATE OR REPLACE FUNCTION public.redeem_gift(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gift gift_codes%ROWTYPE;
  v_new  UUID;
  v_name TEXT;
  v_slug TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'unauthenticated'); END IF;

  SELECT * INTO v_gift FROM gift_codes WHERE code = upper(btrim(p_code)) FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  IF v_gift.redeemed_by IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'code',
      CASE WHEN v_gift.redeemed_by = auth.uid() THEN 'already_redeemed' ELSE 'used' END,
      'category_id', COALESCE(v_gift.result_category_id, v_gift.category_id));
  END IF;

  IF v_gift.product_type = 'custom_copy' THEN
    SELECT name INTO v_name FROM categories WHERE id = v_gift.category_id;
    IF v_name IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
    v_new := public.clone_deck(v_gift.category_id, auth.uid(), v_name, false);
  ELSIF v_gift.product_type = 'volume' THEN
    IF public.owns_deck(v_gift.category_id) THEN
      RETURN jsonb_build_object('ok', false, 'code', 'already_owned', 'category_id', v_gift.category_id);
    END IF;
    PERFORM public.grant_product(auth.uid(), 'volume', v_gift.category_id, NULL, v_gift.order_id, 0);
  ELSIF v_gift.product_type = 'series' THEN
    IF EXISTS (SELECT 1 FROM series_purchases WHERE user_id = auth.uid() AND series_id = v_gift.series_id) THEN
      RETURN jsonb_build_object('ok', false, 'code', 'already_owned');
    END IF;
    PERFORM public.grant_product(auth.uid(), 'series', NULL, v_gift.series_id, v_gift.order_id, 0);
  END IF;

  UPDATE gift_codes SET redeemed_by = auth.uid(), redeemed_at = now(), result_category_id = v_new
  WHERE code = v_gift.code;

  SELECT slug INTO v_slug FROM series WHERE id = v_gift.series_id;
  RETURN jsonb_build_object('ok', true, 'product_type', v_gift.product_type,
    'category_id', COALESCE(v_new, v_gift.category_id), 'series_slug', v_slug);
END;
$$;

-- ------------------------------------------------------------
-- Versi pribadi deck premium tidak bisa dibagikan lewat link
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Create own deck shares" ON deck_shares;
CREATE POLICY "Create own deck shares" ON deck_shares
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM categories c
      WHERE c.id = deck_shares.category_id
      AND c.created_by = auth.uid()
      AND c.status = 'saved'
      AND NOT c.premium_copy
    )
  );

CREATE OR REPLACE FUNCTION public.get_shared_deck(p_token TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'description', c.description,
    'theme', c.theme,
    'mode', c.mode,
    'language', c.language,
    'cards', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', k.id,
        'content_text', k.content_text,
        'card_type', k.card_type,
        'difficulty', k.difficulty,
        'special_kind', k.special_kind,
        'details', k.details,
        'level', k.level,
        'section_name', s.name,
        'section_slug', s.slug
      ) ORDER BY s.sort_order, k.sort_order)
      FROM sections s
      JOIN cards k ON k.section_id = s.id
      WHERE s.category_id = c.id
    ), '[]'::jsonb)
  )
  FROM deck_shares d
  JOIN categories c ON c.id = d.category_id
  WHERE d.token = p_token
    AND d.enabled
    AND c.is_active
    AND c.status = 'saved'
    AND NOT c.premium_copy
    AND c.created_by IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_shared_deck(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_deck(TEXT) TO anon, authenticated;

-- ------------------------------------------------------------
-- Hak eksekusi
-- ------------------------------------------------------------
REVOKE ALL ON FUNCTION public.owns_deck(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owned_category_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.premium_catalog() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_product(UUID, TEXT, UUID, UUID, UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fulfill_order(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fulfill_credit_order(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.clone_deck(UUID, UUID, TEXT, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.personalize_premium(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.copy_shared_deck(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gift_custom_deck(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_gift(TEXT) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.grant_product(UUID, TEXT, UUID, UUID, UUID, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.fulfill_order(UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.clone_deck(UUID, UUID, TEXT, BOOLEAN) FROM anon;
GRANT EXECUTE ON FUNCTION public.owns_deck(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.premium_catalog() TO anon;
REVOKE EXECUTE ON FUNCTION public.grant_product(UUID, TEXT, UUID, UUID, UUID, INTEGER) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.fulfill_order(UUID, TEXT, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.clone_deck(UUID, UUID, TEXT, BOOLEAN) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.owns_deck(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owned_category_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.premium_catalog() TO authenticated;
GRANT EXECUTE ON FUNCTION public.personalize_premium(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.copy_shared_deck(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gift_custom_deck(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_gift(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_order(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.fulfill_credit_order(UUID, TEXT, TEXT) TO service_role;
