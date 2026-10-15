-- ============================================================
-- Kartu tersembunyi
-- ============================================================
-- Pemilik deck bisa menyembunyikan kartu tanpa menghapusnya: kartunya
-- tetap ada di halaman revisi (dan bisa dimunculkan lagi), tapi tidak
-- ikut dimainkan, dibagikan lewat link, atau disalin.
-- Edit isi dan hapus kartu sudah dibuka oleh 00010 ("Update cards in
-- own categories") dan 00011 ("Delete cards in own categories").

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT UPDATE (is_hidden) ON public.cards TO authenticated;
  END IF;
END $$;

-- Link berbagi: sama seperti 00011, tanpa kartu tersembunyi.
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
        AND NOT k.is_hidden
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

-- Skor dari link berbagi: batas atasnya jumlah kartu yang terlihat.
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
  WHERE s.category_id = v_category AND NOT k.is_hidden;

  IF p_total IS NULL OR p_correct IS NULL
     OR p_total < 0 OR p_total > v_cards
     OR p_correct < 0 OR p_correct > p_total THEN
    RETURN false;
  END IF;

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

REVOKE ALL ON FUNCTION public.record_shared_play(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_shared_play(TEXT, TEXT, INTEGER, INTEGER) TO anon, authenticated;

-- Salinan (dari link, hadiah, versi pribadi): kartu tersembunyi tidak ikut.
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
    FROM cards k WHERE k.section_id = v_section.id AND NOT k.is_hidden;
  END LOOP;

  RETURN v_new;
END;
$$;

REVOKE ALL ON FUNCTION public.clone_deck(UUID, UUID, TEXT, BOOLEAN) FROM PUBLIC;
