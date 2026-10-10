-- ============================================================
-- KREDIT, DRAF DECK, DAN REVISI (FASE 2: MONETISASI DASAR)
--
-- Jatah "2 deck AI per akun" diganti saldo kredit:
--
--   1 kredit = 1 deck jadi. Generate menghasilkan DRAF; kreditnya
--   baru terpotong saat draf disimpan (sekaligus mulai dimainkan).
--
--   Revisi gratis per deck: 3x generate ulang penuh + 5x ganti
--   kartu satuan. Lewat batas: 1 kredit membuka jatah revisi baru.
--
--   Akun baru dapat 2 kredit. Akun lama dapat sisa jatah lamanya
--   (2 dikurangi deck AI yang sudah dibuat) sebagai kredit.
--
--   credit_ledger   setiap perubahan saldo (+ beli/bonus, − pakai).
--                   Saldo = jumlah delta. Hanya bisa diisi fungsi di
--                   bawah atau service_role — tidak dari tangan user.
--   credit_orders   pesanan paket kredit (Midtrans). Ditulis oleh
--                   Netlify Function memakai service_role.
--
-- Angka-angka aturan ada di fungsi signup_credits(),
-- free_regenerations(), dan free_card_swaps(); kembarannya di kode ada
-- di apps/web/src/lib/credits.ts — ubah keduanya bersamaan.
--
-- Butuh migration 00001–00009 dan 20260930094439 (ai_unlimited).
-- Aman dijalankan ulang.
-- ============================================================

-- ------------------------------------------------------------
-- Angka aturan
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.signup_credits() RETURNS INTEGER
LANGUAGE sql IMMUTABLE AS $$ SELECT 2; $$;

CREATE OR REPLACE FUNCTION public.free_regenerations() RETURNS INTEGER
LANGUAGE sql IMMUTABLE AS $$ SELECT 3; $$;

CREATE OR REPLACE FUNCTION public.free_card_swaps() RETURNS INTEGER
LANGUAGE sql IMMUTABLE AS $$ SELECT 5; $$;

-- ------------------------------------------------------------
-- Buku kredit
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_ledger (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta       INTEGER NOT NULL CHECK (delta <> 0),
  -- signup_bonus | legacy_quota | purchase | deck_save | revision | admin
  reason      TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  order_id    UUID,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user
  ON credit_ledger(user_id, created_at DESC);

-- Satu deck hanya bisa sekali memotong kredit "simpan", dan satu
-- pesanan hanya bisa sekali menambah saldo — penjaga terakhir kalau
-- dua permintaan datang bersamaan.
CREATE UNIQUE INDEX IF NOT EXISTS uq_credit_ledger_deck_save
  ON credit_ledger(category_id) WHERE reason = 'deck_save';
CREATE UNIQUE INDEX IF NOT EXISTS uq_credit_ledger_purchase
  ON credit_ledger(order_id) WHERE reason = 'purchase';

ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own credits" ON credit_ledger;
CREATE POLICY "Read own credits" ON credit_ledger
  FOR SELECT USING (user_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.credit_ledger FROM authenticated;
REVOKE ALL ON public.credit_ledger FROM anon;

CREATE OR REPLACE FUNCTION public.credit_balance_of(p_user UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(delta), 0)::INTEGER FROM credit_ledger WHERE user_id = p_user;
$$;

CREATE OR REPLACE FUNCTION public.credit_balance()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.credit_balance_of(auth.uid());
$$;

-- ------------------------------------------------------------
-- Kredit awal
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.grant_signup_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO credit_ledger (user_id, delta, reason)
  VALUES (NEW.id, public.signup_credits(), 'signup_bonus');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_signup_credits();

-- Akun yang sudah ada: sisa jatah lama jadi kredit. Hanya untuk akun
-- yang belum punya baris kredit sama sekali, jadi aman diulang.
INSERT INTO credit_ledger (user_id, delta, reason)
SELECT u.id, public.signup_credits() - COALESCE(g.used, 0), 'legacy_quota'
FROM auth.users u
LEFT JOIN (
  SELECT user_id, COUNT(*)::INTEGER AS used
  FROM ai_generations WHERE status = 'success'
  GROUP BY user_id
) g ON g.user_id = u.id
WHERE public.signup_credits() - COALESCE(g.used, 0) > 0
  AND NOT EXISTS (SELECT 1 FROM credit_ledger l WHERE l.user_id = u.id);

-- ------------------------------------------------------------
-- Draf & revisi di kategori
-- ------------------------------------------------------------
ALTER TABLE categories
  -- 'draft' (hasil generate, belum dibayar) | 'saved'
  ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'saved',
  -- Pemakaian jatah revisi yang sedang berjalan.
  ADD COLUMN IF NOT EXISTS revision_regens INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revision_swaps  INTEGER NOT NULL DEFAULT 0;

ALTER TABLE ai_generations
  -- 'deck' (draf baru) | 'regenerate' | 'swap' — untuk metrik biaya AI.
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'deck';

-- Draf hanya boleh dibuat lewat generate: berstatus draft, jatah
-- revisinya nol, dan pemiliknya punya akses AI + saldo.
DROP POLICY IF EXISTS "Insert own AI categories" ON categories;
CREATE POLICY "Insert own AI categories" ON categories
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND is_ai_generated = true
    AND is_free = true
    AND price_idr IS NULL
    AND status = 'draft'
    AND revision_regens = 0
    AND revision_swaps = 0
    AND public.has_ai_access()
  );

-- Pemilik boleh mengganti nama/deskripsi/tema deck-nya (dipakai saat
-- generate ulang). Status dan jatah revisi hanya lewat fungsi.
DROP POLICY IF EXISTS "Update own categories" ON categories;
CREATE POLICY "Update own categories" ON categories
  FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Delete sections in own categories" ON sections;
CREATE POLICY "Delete sections in own categories" ON sections
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM categories c WHERE c.id = sections.category_id AND c.created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Update cards in own categories" ON cards;
CREATE POLICY "Update cards in own categories" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sections s JOIN categories c ON c.id = s.category_id
      WHERE s.id = cards.section_id AND c.created_by = auth.uid()
    )
  );

REVOKE UPDATE ON public.categories FROM authenticated;
GRANT UPDATE (name, description, theme) ON public.categories TO authenticated;
REVOKE UPDATE ON public.cards FROM authenticated;
GRANT UPDATE (content_text, card_type, difficulty, special_kind, details, level)
ON public.cards TO authenticated;
REVOKE UPDATE ON public.categories FROM anon;
REVOKE UPDATE ON public.cards FROM anon;

-- ------------------------------------------------------------
-- Gerbang AI: akses tidak dicabut, dan tanpa batas atau saldo ≥ 1.
-- Menggantikan versi berbasis kuota di 00005 / 20260930094439.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_ai_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND COALESCE(p.ai_enabled, true)
    AND (COALESCE(p.ai_unlimited, false) OR public.credit_balance_of(auth.uid()) >= 1)
  FROM (SELECT auth.uid() AS user_id) AS caller
  LEFT JOIN profiles AS p ON p.id = caller.user_id;
$$;

-- Potong satu kredit milik pemanggil. Dipanggil hanya dari fungsi lain
-- di file ini. Kunci per akun mencegah dua pemotongan bersamaan
-- membuat saldo minus.
CREATE OR REPLACE FUNCTION public.spend_credit(p_reason TEXT, p_category UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('credits:' || auth.uid()::text));
  IF public.credit_balance_of(auth.uid()) < 1 THEN RETURN false; END IF;
  INSERT INTO credit_ledger (user_id, delta, reason, category_id)
  VALUES (auth.uid(), -1, p_reason, p_category);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_ai_unlimited()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT ai_unlimited FROM profiles WHERE id = auth.uid()), false);
$$;

-- Simpan draf: potong 1 kredit (kecuali akun tanpa batas), lalu deck
-- jadi tersimpan dan bisa dimainkan/dibagikan. Deck yang sudah
-- tersimpan tidak dipotong lagi.
CREATE OR REPLACE FUNCTION public.save_deck(p_category UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status    TEXT;
  v_unlimited BOOLEAN := public.is_ai_unlimited();
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unauthenticated');
  END IF;

  SELECT status INTO v_status FROM categories
  WHERE id = p_category AND created_by = auth.uid()
  FOR UPDATE;

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;

  IF v_status = 'draft' THEN
    IF NOT v_unlimited AND NOT public.spend_credit('deck_save', p_category) THEN
      RETURN jsonb_build_object('ok', false, 'code', 'no_credits',
        'balance', public.credit_balance_of(auth.uid()));
    END IF;
    UPDATE categories SET status = 'saved' WHERE id = p_category;
  END IF;

  RETURN jsonb_build_object('ok', true,
    'charged', v_status = 'draft' AND NOT v_unlimited,
    'balance', public.credit_balance_of(auth.uid()));
END;
$$;

-- Catat satu revisi ('regenerate' atau 'swap') SETELAH berhasil.
-- Selama jatah gratis masih ada, cukup menambah hitungan. Lewat batas,
-- 1 kredit membuka jatah revisi baru (hitungan diulang dari revisi
-- ini). Mengembalikan ok=false/no_credits kalau saldonya kosong.
CREATE OR REPLACE FUNCTION public.use_revision(p_category UUID, p_kind TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_regens INTEGER;
  v_swaps  INTEGER;
  v_charged BOOLEAN := false;
BEGIN
  IF p_kind NOT IN ('regenerate', 'swap') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_kind');
  END IF;

  SELECT revision_regens, revision_swaps INTO v_regens, v_swaps
  FROM categories
  WHERE id = p_category AND created_by = auth.uid() AND is_ai_generated
  FOR UPDATE;

  IF v_regens IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;

  IF (p_kind = 'regenerate' AND v_regens < public.free_regenerations())
     OR (p_kind = 'swap' AND v_swaps < public.free_card_swaps()) THEN
    IF p_kind = 'regenerate' THEN v_regens := v_regens + 1; ELSE v_swaps := v_swaps + 1; END IF;
  ELSE
    IF NOT public.is_ai_unlimited() THEN
      IF NOT public.spend_credit('revision', p_category) THEN
        RETURN jsonb_build_object('ok', false, 'code', 'no_credits',
          'balance', public.credit_balance_of(auth.uid()));
      END IF;
      v_charged := true;
    END IF;
    v_regens := CASE WHEN p_kind = 'regenerate' THEN 1 ELSE 0 END;
    v_swaps  := CASE WHEN p_kind = 'swap' THEN 1 ELSE 0 END;
  END IF;

  UPDATE categories SET revision_regens = v_regens, revision_swaps = v_swaps
  WHERE id = p_category;

  RETURN jsonb_build_object('ok', true, 'charged', v_charged,
    'regens_used', v_regens, 'swaps_used', v_swaps,
    'balance', public.credit_balance_of(auth.uid()));
END;
$$;

-- ------------------------------------------------------------
-- Pesanan paket kredit
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id      TEXT NOT NULL,
  credits      INTEGER NOT NULL CHECK (credits > 0),
  amount_idr   INTEGER NOT NULL CHECK (amount_idr > 0),
  -- pending | paid | failed | expired
  status       TEXT NOT NULL DEFAULT 'pending',
  provider     TEXT NOT NULL DEFAULT 'midtrans',
  provider_ref TEXT,
  payment_type TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_credit_orders_user
  ON credit_orders(user_id, created_at DESC);

ALTER TABLE credit_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own orders" ON credit_orders;
CREATE POLICY "Read own orders" ON credit_orders
  FOR SELECT USING (user_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.credit_orders FROM authenticated;
REVOKE ALL ON public.credit_orders FROM anon;

-- Tandai pesanan lunas dan tambah saldonya, sekali saja per pesanan.
-- Hanya untuk service_role (webhook pembayaran).
CREATE OR REPLACE FUNCTION public.fulfill_credit_order(
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

  INSERT INTO credit_ledger (user_id, delta, reason, order_id)
  VALUES (v_order.user_id, v_order.credits, 'purchase', p_order);
  RETURN true;
END;
$$;

-- ------------------------------------------------------------
-- Link main (00009) hanya untuk deck yang sudah tersimpan
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
    AND c.created_by IS NOT NULL;
$$;

-- ------------------------------------------------------------
-- Hak eksekusi
-- ------------------------------------------------------------
REVOKE ALL ON FUNCTION public.credit_balance_of(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.credit_balance() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_signup_credits() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_ai_access() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.spend_credit(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_ai_unlimited() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_deck(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.use_revision(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fulfill_credit_order(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_shared_deck(TEXT) FROM PUBLIC;

-- Supabase memberi EXECUTE ke anon/authenticated secara bawaan untuk
-- fungsi baru; cabut eksplisit untuk yang tidak boleh dipanggil user.
REVOKE EXECUTE ON FUNCTION public.credit_balance_of(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.spend_credit(TEXT, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.fulfill_credit_order(UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.grant_signup_credits() FROM anon;
REVOKE EXECUTE ON FUNCTION public.credit_balance_of(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.spend_credit(TEXT, UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.fulfill_credit_order(UUID, TEXT, TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_signup_credits() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.credit_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_ai_access() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_ai_unlimited() TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_deck(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_revision(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_credit_order(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_balance_of(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_shared_deck(TEXT) TO anon, authenticated;
