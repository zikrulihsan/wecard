-- ============================================================
-- LINK MAIN (FASE 1: VIRAL LOOP)
--
-- Pemilik deck custom bisa membagikan deck-nya lewat satu link
-- (/main/<token>). Siapa pun yang membuka link itu bisa main tanpa
-- akun — cukup isi nama — dan hasil kuisnya masuk papan skor grup.
--
--   deck_shares      satu link per deck; pemilik bisa mematikannya
--   shared_plays     satu baris per permainan lewat link (skor kuis,
--                    sekaligus hitungan "berapa kali dimainkan")
--   share_referrals  akun baru yang datang dari link main — untuk
--                    metrik pemain → pembuat
--
-- Pemain tanpa akun tidak pernah menyentuh tabel langsung. Semua
-- lewat fungsi SECURITY DEFINER di bawah, yang hanya membuka deck
-- kalau link-nya masih menyala.
--
-- Hanya deck custom (created_by IS NOT NULL) yang bisa dibagikan
-- penuh. Deck kurasi/premium punya aturan preview sendiri di fase
-- berikutnya.
--
-- Butuh migration 00002, 00006, 00007, dan 00008.
-- Aman dijalankan ulang.
-- ============================================================

-- ------------------------------------------------------------
-- Link main per deck
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deck_shares (
  category_id UUID PRIMARY KEY REFERENCES categories(id) ON DELETE CASCADE,
  -- 16 karakter hex (64 bit acak): cukup pendek untuk dibagikan di
  -- chat, cukup panjang untuk tidak bisa ditebak.
  token       TEXT NOT NULL UNIQUE
              DEFAULT substr(md5(gen_random_uuid()::text || clock_timestamp()::text), 1, 16),
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE deck_shares ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own deck shares" ON deck_shares;
CREATE POLICY "Read own deck shares" ON deck_shares
  FOR SELECT USING (created_by = auth.uid());

-- Hanya untuk deck milik sendiri.
DROP POLICY IF EXISTS "Create own deck shares" ON deck_shares;
CREATE POLICY "Create own deck shares" ON deck_shares
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM categories c
      WHERE c.id = deck_shares.category_id
      AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Toggle own deck shares" ON deck_shares;
CREATE POLICY "Toggle own deck shares" ON deck_shares
  FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- Token dan pemilik selalu diisi database dan tidak bisa diubah: yang
-- boleh hanya menyalakan / mematikan link. Sama seperti
-- profiles.ai_enabled, pembatasan per kolom harus lewat privilege,
-- bukan RLS.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE INSERT, UPDATE, DELETE ON public.deck_shares FROM authenticated;
    GRANT INSERT (category_id, enabled) ON public.deck_shares TO authenticated;
    GRANT UPDATE (enabled, updated_at) ON public.deck_shares TO authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON public.deck_shares FROM anon;
  END IF;
END $$;

-- ------------------------------------------------------------
-- Permainan lewat link
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shared_plays (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  -- total = jumlah kartu yang dinilai; 0 untuk deck tanpa kuis.
  correct     INTEGER NOT NULL DEFAULT 0,
  total       INTEGER NOT NULL DEFAULT 0,
  -- Pemain yang sudah masuk tetap dicatat akunnya, untuk metrik.
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT shared_plays_score CHECK (correct >= 0 AND total >= 0 AND correct <= total)
);

CREATE INDEX IF NOT EXISTS idx_shared_plays_category_created
  ON shared_plays(category_id, created_at DESC);

ALTER TABLE shared_plays ENABLE ROW LEVEL SECURITY;

-- Pemilik deck boleh melihat siapa saja yang memainkan deck-nya.
DROP POLICY IF EXISTS "Owners read plays" ON shared_plays;
CREATE POLICY "Owners read plays" ON shared_plays
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM categories c
      WHERE c.id = shared_plays.category_id
      AND c.created_by = auth.uid()
    )
  );

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE INSERT, UPDATE, DELETE ON public.shared_plays FROM authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON public.shared_plays FROM anon;
  END IF;
END $$;

-- ------------------------------------------------------------
-- Akun yang datang dari link main
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS share_referrals (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE share_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own referral" ON share_referrals;
CREATE POLICY "Read own referral" ON share_referrals
  FOR SELECT USING (user_id = auth.uid());

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE INSERT, UPDATE, DELETE ON public.share_referrals FROM authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON public.share_referrals FROM anon;
  END IF;
END $$;

-- ============================================================
-- Fungsi untuk pemain lewat link
--
-- SECURITY DEFINER dengan search_path terkunci: pemain tanpa akun
-- tidak lolos RLS kartu deck custom, jadi pembacaannya harus lewat
-- sini — dan fungsi inilah yang memastikan link masih menyala.
-- ============================================================

-- Deck yang link-nya masih menyala, beserta seluruh kartunya.
-- NULL kalau token tidak dikenal, link dimatikan, atau deck nonaktif.
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
    AND c.created_by IS NOT NULL;
$$;

-- Catat satu permainan. Mengembalikan false kalau link sudah mati,
-- nama tidak valid, atau skornya mustahil.
CREATE OR REPLACE FUNCTION public.record_shared_play(
  p_token   TEXT,
  p_name    TEXT,
  p_correct INTEGER,
  p_total   INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category UUID;
  v_cards    INTEGER;
  v_name     TEXT := btrim(COALESCE(p_name, ''));
BEGIN
  SELECT d.category_id INTO v_category
  FROM deck_shares d
  JOIN categories c ON c.id = d.category_id
  WHERE d.token = p_token AND d.enabled AND c.is_active;

  IF v_category IS NULL THEN RETURN false; END IF;
  IF char_length(v_name) NOT BETWEEN 1 AND 40 THEN RETURN false; END IF;

  SELECT COUNT(*) INTO v_cards
  FROM cards k JOIN sections s ON s.id = k.section_id
  WHERE s.category_id = v_category;

  IF p_total IS NULL OR p_correct IS NULL
     OR p_total < 0 OR p_total > v_cards
     OR p_correct < 0 OR p_correct > p_total THEN
    RETURN false;
  END IF;

  -- Rem kasar untuk spam: satu deck tidak masuk akal dimainkan
  -- lebih dari 300 kali dalam satu jam.
  IF (SELECT COUNT(*) FROM shared_plays
      WHERE category_id = v_category
        AND created_at > now() - interval '1 hour') >= 300 THEN
    RETURN false;
  END IF;

  INSERT INTO shared_plays (category_id, player_name, correct, total, user_id)
  VALUES (v_category, v_name, p_correct, p_total, auth.uid());
  RETURN true;
END;
$$;

-- Papan skor grup: skor terbaik tiap nama dalam 30 hari terakhir.
CREATE OR REPLACE FUNCTION public.get_shared_scoreboard(p_token TEXT)
RETURNS TABLE (player_name TEXT, correct INTEGER, total INTEGER, played_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.player_name, b.correct, b.total, b.created_at
  FROM (
    SELECT DISTINCT ON (lower(p.player_name))
      p.player_name, p.correct, p.total, p.created_at
    FROM shared_plays p
    JOIN deck_shares d ON d.category_id = p.category_id
    WHERE d.token = p_token
      AND d.enabled
      AND p.total > 0
      AND p.created_at > now() - interval '30 days'
    ORDER BY lower(p.player_name),
      (p.correct::numeric / p.total) DESC, p.correct DESC, p.created_at ASC
  ) b
  ORDER BY (b.correct::numeric / b.total) DESC, b.correct DESC, b.created_at ASC
  LIMIT 20;
$$;

-- Akun baru yang mendaftar setelah main lewat link. Hanya dicatat
-- untuk akun berumur kurang dari sehari (pendaftaran yang memang
-- berasal dari link), sekali per akun, dan bukan pemilik deck-nya.
CREATE OR REPLACE FUNCTION public.claim_share_referral(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category UUID;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() AND u.created_at > now() - interval '1 day'
  ) THEN
    RETURN false;
  END IF;

  SELECT d.category_id INTO v_category
  FROM deck_shares d
  WHERE d.token = p_token AND d.created_by <> auth.uid();

  IF v_category IS NULL THEN RETURN false; END IF;

  INSERT INTO share_referrals (user_id, category_id)
  VALUES (auth.uid(), v_category)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.get_shared_deck(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_shared_play(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_shared_scoreboard(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_share_referral(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_shared_deck(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_shared_play(TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_shared_scoreboard(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_share_referral(TEXT) TO authenticated;
