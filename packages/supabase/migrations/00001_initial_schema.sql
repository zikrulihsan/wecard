-- ============================================================
-- CATEGORIES (e.g., "Pasangan", "Sahabat", "Keluarga")
-- ============================================================
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  cover_image   TEXT,
  is_free       BOOLEAN NOT NULL DEFAULT false,
  price_idr     INTEGER,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SECTIONS (levels within a category: Warm Up, Deep Talk, etc.)
-- ============================================================
CREATE TABLE sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  icon          TEXT,
  UNIQUE (category_id, slug)
);

-- ============================================================
-- CARDS
-- ============================================================
CREATE TYPE card_type AS ENUM ('talk', 'action', 'special');
CREATE TYPE card_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE special_card_kind AS ENUM ('free_pass', 'switch', 'double');

CREATE TABLE cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  card_type       card_type NOT NULL DEFAULT 'talk',
  difficulty      card_difficulty NOT NULL DEFAULT 'easy',
  content_text    TEXT NOT NULL,
  special_kind    special_card_kind,
  is_free_preview BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cards_section ON cards(section_id);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Player'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PURCHASES
-- ============================================================
CREATE TABLE purchases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  payment_method  TEXT,
  payment_ref     TEXT,
  amount_idr      INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  purchased_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id)
);

CREATE INDEX idx_purchases_user ON purchases(user_id);

-- ============================================================
-- GAME SESSIONS (analytics)
-- ============================================================
CREATE TABLE game_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id     UUID NOT NULL REFERENCES categories(id),
  cards_total     INTEGER NOT NULL,
  cards_viewed    INTEGER NOT NULL DEFAULT 0,
  sections_played TEXT[],
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  completed       BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Categories: readable by everyone
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (is_active = true);

-- Sections: readable by everyone
CREATE POLICY "Public read sections" ON sections
  FOR SELECT USING (true);

-- Cards: free cards visible to all; locked cards only to purchasers
CREATE POLICY "Read cards" ON cards
  FOR SELECT USING (
    is_free_preview = true
    OR EXISTS (
      SELECT 1 FROM sections s
      JOIN categories c ON c.id = s.category_id
      WHERE s.id = cards.section_id
      AND (c.is_free = true OR EXISTS (
        SELECT 1 FROM purchases p
        WHERE p.user_id = auth.uid()
        AND p.category_id = c.id
        AND p.status = 'completed'
      ))
    )
  );

-- Profiles: users read/update own
CREATE POLICY "Read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Purchases: users read own
CREATE POLICY "Read own purchases" ON purchases
  FOR SELECT USING (user_id = auth.uid());

-- Game sessions: users manage own
CREATE POLICY "Manage own sessions" ON game_sessions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
