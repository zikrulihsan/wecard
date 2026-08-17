-- ============================================================
-- AKSES FITUR AI TERBATAS
-- Generate deck lewat AI hanya untuk user yang ditandai.
-- Beri akses: centang profiles.ai_enabled di Table Editor Supabase,
-- atau: UPDATE profiles SET ai_enabled = true WHERE id = '<user-id>';
--
-- Aman dijalankan ulang.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- Kunci kolom ai_enabled dari tangan user.
--
-- Policy "Update own profile" (migration 00001) mengizinkan user meng-UPDATE
-- baris profilnya sendiri, dan RLS tidak mengenal batasan per kolom. Tanpa
-- bagian ini, siapa pun bisa memberi akses AI ke dirinya sendiri hanya dengan
--   supabase.from('profiles').update({ ai_enabled: true })
-- memakai anon key. Pembatasan per kolom harus lewat privilege GRANT.
--
-- Kolom ai_enabled jadi hanya bisa diubah lewat service_role / SQL Editor.
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE UPDATE ON public.profiles FROM authenticated;
    GRANT UPDATE (display_name, avatar_url, updated_at)
      ON public.profiles TO authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE UPDATE ON public.profiles FROM anon;
  END IF;
END $$;

-- ============================================================
-- Helper untuk dipakai di dalam policy.
--
-- SECURITY DEFINER supaya pengecekan tidak ikut tunduk pada RLS tabel
-- profiles — policy yang menanyakan tabel lain dievaluasi sebagai user
-- pemanggil, dan itu gampang jadi sumber bug halus kalau policy profiles
-- berubah di kemudian hari. search_path dikunci agar fungsi ini tidak bisa
-- dibelokkan lewat skema bayangan.
-- ============================================================
CREATE OR REPLACE FUNCTION public.has_ai_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT ai_enabled FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

REVOKE ALL ON FUNCTION public.has_ai_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_ai_access() TO authenticated;

-- ============================================================
-- Gerbang data: tanpa akses, insert kategori AI ditolak Postgres.
-- Ini menutup jalur pintas lewat anon key, di luar API route.
--
-- Catatan: kebijakan baca sengaja TIDAK diubah. User yang aksesnya
-- dicabut tetap bisa memainkan deck AI yang sudah terlanjur dibuatnya.
-- ============================================================
DROP POLICY IF EXISTS "Insert own AI categories" ON categories;
CREATE POLICY "Insert own AI categories" ON categories
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND is_ai_generated = true
    AND is_free = true
    AND price_idr IS NULL
    AND public.has_ai_access()
  );
