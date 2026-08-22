-- ============================================================
-- AKSES AI TERBUKA UNTUK SEMUA, TAPI BERKUOTA
--
-- Sebelumnya fitur generate deck mati secara default dan dibuka
-- satu per satu lewat profiles.ai_enabled. Sekarang dibalik: semua
-- akun dapat akses, dengan jatah 2 deck AI per akun (sekali seumur
-- akun, bukan per jam). Yang membatasi biaya token bukan lagi daftar
-- undangan, melainkan kuotanya.
--
-- profiles.ai_enabled tetap ada dan tetap terkunci dari tangan user —
-- sekarang fungsinya jadi sakelar pemutus untuk mencabut akses satu
-- akun (penyalahgunaan), bukan gerbang masuk:
--   UPDATE profiles SET ai_enabled = false WHERE id = '<user-id>';
--
-- Aman dijalankan ulang.
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE profiles ALTER COLUMN ai_enabled SET DEFAULT true;

-- Akun yang terlanjur dibuat saat fitur masih tertutup ikut dibuka.
-- Ini sengaja tidak selektif: keadaan "false" sebelum migration ini
-- artinya "belum diundang", bukan "dicabut aksesnya".
UPDATE profiles SET ai_enabled = true WHERE ai_enabled = false;

-- ============================================================
-- Kuota: 2 generate sukses per akun.
--
-- Ditaruh di fungsi supaya angkanya punya satu tempat di sisi
-- database. Kembarannya di sisi aplikasi ada di
-- apps/web/src/lib/ai/access.ts (AI_GENERATION_LIMIT) — kalau salah
-- satu diubah, ubah keduanya.
-- ============================================================
CREATE OR REPLACE FUNCTION public.ai_generation_limit()
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 2;
$$;

-- ============================================================
-- Pemakaian kuota: hanya generate yang berhasil yang dihitung.
--
-- Baris berstatus 'error' ditulis saat panggilan LLM gagal atau ditolak
-- filter — user tidak dapat deck apa pun dari situ, jadi tidak adil
-- kalau ikut memakan jatah.
--
-- SECURITY DEFINER dengan search_path terkunci, sama alasannya dengan
-- has_ai_access() di migration 00003: hitungannya tidak boleh ikut
-- tunduk pada RLS tabel yang dibacanya.
-- ============================================================
CREATE OR REPLACE FUNCTION public.ai_generations_used()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM ai_generations
  WHERE user_id = auth.uid()
    AND status = 'success';
$$;

REVOKE ALL ON FUNCTION public.ai_generations_used() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ai_generation_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ai_generations_used() TO authenticated;
GRANT EXECUTE ON FUNCTION public.ai_generation_limit() TO authenticated;

-- ============================================================
-- Gerbang yang dipakai policy insert kategori AI (migration 00003).
-- Sekarang dua syarat: akses tidak dicabut, dan kuota belum habis.
--
-- Beda dengan versi lama, baris profil yang tidak ada tidak lagi
-- berarti "tidak boleh". Akses sudah jadi bawaan semua akun, jadi
-- profil yang belum terbentuk itu bug pendaftaran, bukan keputusan
-- akses — dan kuotanya tetap dijaga hitungan ai_generations.
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
    true
  )
  AND public.ai_generations_used() < public.ai_generation_limit();
$$;

REVOKE ALL ON FUNCTION public.has_ai_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_ai_access() TO authenticated;

-- ============================================================
-- Kunci riwayat generate dari tangan user.
--
-- Kuota dihitung dari tabel ai_generations, dan policy lama
-- "Manage own generations" (FOR ALL) mengizinkan user MENGHAPUS
-- barisnya sendiri. Tanpa bagian ini, jatah 2 deck bisa direset
-- siapa pun hanya dengan
--   supabase.from('ai_generations').delete().eq('user_id', <dirinya>)
-- memakai anon key. Riwayat jadi hanya bisa dibaca dan ditambah;
-- mengubah/menghapus lewat service_role saja.
-- ============================================================
DROP POLICY IF EXISTS "Manage own generations" ON ai_generations;

DROP POLICY IF EXISTS "Read own generations" ON ai_generations;
CREATE POLICY "Read own generations" ON ai_generations
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Insert own generations" ON ai_generations;
CREATE POLICY "Insert own generations" ON ai_generations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy hanya menyaring baris; privilege-nya dicabut sekalian supaya
-- UPDATE/DELETE ditolak Postgres bahkan sebelum RLS dievaluasi.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE UPDATE, DELETE ON public.ai_generations FROM authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE UPDATE, DELETE ON public.ai_generations FROM anon;
  END IF;
END $$;
