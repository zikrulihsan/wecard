-- ============================================================
-- AI-GENERATED DECKS
-- Kategori yang dibuat user lewat AI. Hanya terlihat oleh
-- pembuatnya. Kategori bawaan dari seed (created_by IS NULL)
-- tetap publik dan tidak berubah perilakunya.
--
-- Aman dijalankan ulang.
-- ============================================================

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS created_by      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_categories_created_by ON categories(created_by);

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- LOG GENERATE (audit + rate limit)
-- Prompt user disimpan apa adanya; jangan isi data pribadi.
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_generations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  input         JSONB NOT NULL,
  provider      TEXT NOT NULL,
  model         TEXT NOT NULL,
  input_tokens  INTEGER,
  output_tokens INTEGER,
  status        TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user_created
  ON ai_generations(user_id, created_at DESC);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Manage own generations" ON ai_generations;
CREATE POLICY "Manage own generations" ON ai_generations
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- RLS: kategori
-- ============================================================

-- Kategori bawaan/seed: tetap publik seperti sebelumnya.
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (is_active = true AND created_by IS NULL);

-- Kategori AI: hanya pemiliknya.
DROP POLICY IF EXISTS "Read own categories" ON categories;
CREATE POLICY "Read own categories" ON categories
  FOR SELECT USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Insert own AI categories" ON categories;
CREATE POLICY "Insert own AI categories" ON categories
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND is_ai_generated = true
    AND is_free = true
    AND price_idr IS NULL
  );

DROP POLICY IF EXISTS "Delete own categories" ON categories;
CREATE POLICY "Delete own categories" ON categories
  FOR DELETE USING (created_by = auth.uid());

-- ============================================================
-- RLS: section — ikut visibilitas kategori induknya
-- ============================================================
DROP POLICY IF EXISTS "Public read sections" ON sections;
DROP POLICY IF EXISTS "Read sections" ON sections;
CREATE POLICY "Read sections" ON sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM categories c
      WHERE c.id = sections.category_id
      AND (c.created_by IS NULL OR c.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Insert sections in own categories" ON sections;
CREATE POLICY "Insert sections in own categories" ON sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM categories c
      WHERE c.id = sections.category_id
      AND c.created_by = auth.uid()
    )
  );

-- ============================================================
-- RLS: kartu
-- Deck bawaan: aturan lama (preview / gratis / sudah dibeli).
-- Deck AI: hanya pemiliknya.
-- ============================================================
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
          AND (
            cards.is_free_preview = true
            OR c.is_free = true
            OR EXISTS (
              SELECT 1 FROM purchases p
              WHERE p.user_id = auth.uid()
              AND p.category_id = c.id
              AND p.status = 'completed'
            )
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "Insert cards in own categories" ON cards;
CREATE POLICY "Insert cards in own categories" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sections s
      JOIN categories c ON c.id = s.category_id
      WHERE s.id = cards.section_id
      AND c.created_by = auth.uid()
    )
  );
