-- ============================================================
-- TIMER DI LINK MAIN
--
-- Pemilik deck mengatur timer per kartu untuk link main-nya. Pemain
-- yang membuka link memakai timer itu juga (sebelumnya link main
-- selalu tanpa timer).
--
--   deck_shares.timer_seconds       0 = tanpa timer
--   deck_shares.timer_auto_advance  langsung lanjut begitu waktu habis
--
-- get_shared_deck sekarang ikut mengembalikan 'timer'.
--
-- Butuh migration 00009, 00010, dan 00011.
-- Aman dijalankan ulang.
-- ============================================================

ALTER TABLE deck_shares
  ADD COLUMN IF NOT EXISTS timer_seconds INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timer_auto_advance BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deck_shares_timer_seconds'
  ) THEN
    ALTER TABLE deck_shares
      ADD CONSTRAINT deck_shares_timer_seconds CHECK (timer_seconds BETWEEN 0 AND 600);
  END IF;
END $$;

-- Pemilik boleh mengubah timernya, tetap tidak boleh menyentuh token.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT INSERT (category_id, enabled, timer_seconds, timer_auto_advance)
      ON public.deck_shares TO authenticated;
    GRANT UPDATE (enabled, updated_at, timer_seconds, timer_auto_advance)
      ON public.deck_shares TO authenticated;
  END IF;
END $$;

-- Sama dengan versi 00011, ditambah 'timer'.
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
    'timer', jsonb_build_object(
      'seconds', d.timer_seconds,
      'auto_advance', d.timer_auto_advance
    ),
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
