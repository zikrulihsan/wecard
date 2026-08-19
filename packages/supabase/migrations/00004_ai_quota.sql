-- ============================================================
-- KUOTA GENERATE AI YANG TIDAK BISA DIRESET SENDIRI
--
-- Sebelum migration ini, kuota 5-per-jam dihitung dengan membaca tabel
-- ai_generations memakai klien milik user. Policy-nya:
--
--   CREATE POLICY "Manage own generations" ON ai_generations
--     FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
--
-- FOR ALL mencakup DELETE, dan Supabase memberi GRANT ALL ke role
-- `authenticated` untuk tabel di skema public. Jadi satu baris dari browser
--
--   await supabase.from('ai_generations').delete().eq('user_id', myId)
--
-- mengembalikan kuota ke nol. Kepemilikan memang dijaga — baris orang lain
-- tetap tidak bisa disentuh — tapi yang dilindungi di sini bukan kepemilikan,
-- melainkan tagihan API.
--
-- Selain itu pemeriksaannya rentan balapan: baca-lalu-periksa tanpa kunci
-- membuat lima request paralel sama-sama membaca "0 terpakai" dan lolos semua.
--
-- Perbaikannya dua bagian:
--   1. Seluruh penulisan ke ai_generations ditutup untuk anon/authenticated.
--      Yang tersisa cuma SELECT, supaya riwayat tetap bisa ditampilkan.
--   2. Penulisan dipindah ke dua fungsi SECURITY DEFINER. Yang pertama
--      mengambil kunci per-user lalu menghitung dan menyisipkan dalam satu
--      transaksi, sehingga balapan ikut tertutup.
--
-- Aman dijalankan ulang.
-- ============================================================

-- ============================================================
-- Policy: pecah per perintah, sisakan baca saja.
-- ============================================================
DROP POLICY IF EXISTS "Manage own generations" ON ai_generations;

DROP POLICY IF EXISTS "Read own generations" ON ai_generations;
CREATE POLICY "Read own generations" ON ai_generations
  FOR SELECT USING (user_id = auth.uid());

-- Policy saja tidak cukup: RLS menyaring baris, GRANT yang menentukan perintah
-- apa yang boleh dijalankan sama sekali. Tanpa REVOKE di bawah, menghapus
-- policy INSERT/UPDATE/DELETE hanya membuat operasinya gagal karena tidak ada
-- policy yang cocok — bergantung pada ketiadaan policy itu rapuh.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE INSERT, UPDATE, DELETE ON public.ai_generations FROM authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE INSERT, UPDATE, DELETE ON public.ai_generations FROM anon;
  END IF;
END $$;

-- ============================================================
-- Ambil satu slot kuota.
--
-- Mengembalikan id baris log yang baru dibuat, atau melempar error kalau
-- kuota habis / akses AI belum terbuka. Baris dibuat berstatus 'pending' dan
-- baru dilengkapi hasilnya lewat finish_ai_generation().
--
-- pg_advisory_xact_lock membuat dua request paralel dari user yang sama antre,
-- bukan sama-sama membaca hitungan lama. Kuncinya dilepas otomatis saat
-- transaksi selesai — PostgREST membungkus tiap request dalam satu transaksi.
--
-- Percobaan yang ditolak karena kuota TIDAK meninggalkan baris, jadi menekan
-- tombol berulang kali saat kuota habis tidak ikut memperpanjang hukumannya.
-- ============================================================
CREATE OR REPLACE FUNCTION public.claim_ai_generation(
  p_input    JSONB,
  p_provider TEXT,
  p_model    TEXT,
  p_limit    INTEGER,
  p_window   INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid  UUID := auth.uid();
  v_used INTEGER;
  v_id   UUID;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  -- Gerbang yang sama dengan policy insert kategori AI. Diperiksa lagi di sini
  -- supaya pencabutan akses langsung berlaku, bukan menunggu tahap simpan.
  IF NOT public.has_ai_access() THEN
    RAISE EXCEPTION 'ai_not_enabled' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  SELECT count(*) INTO v_used
    FROM ai_generations
   WHERE user_id = v_uid
     AND created_at >= now() - p_window;

  IF v_used >= p_limit THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO ai_generations (user_id, input, provider, model, status)
  VALUES (v_uid, p_input, p_provider, p_model, 'pending')
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ============================================================
-- Lengkapi baris log setelah generate selesai (berhasil maupun gagal).
--
-- Syarat `status = 'pending'` membuat satu baris hanya bisa difinalkan sekali,
-- jadi riwayat lama tidak bisa ditulis ulang.
-- ============================================================
CREATE OR REPLACE FUNCTION public.finish_ai_generation(
  p_id            UUID,
  p_status        TEXT,
  p_category_id   UUID    DEFAULT NULL,
  p_input_tokens  INTEGER DEFAULT NULL,
  p_output_tokens INTEGER DEFAULT NULL,
  p_error_message TEXT    DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('success', 'error') THEN
    RAISE EXCEPTION 'status tidak dikenal: %', p_status USING ERRCODE = '22023';
  END IF;

  UPDATE ai_generations
     SET status        = p_status,
         category_id   = p_category_id,
         input_tokens  = p_input_tokens,
         output_tokens = p_output_tokens,
         error_message = p_error_message
   WHERE id      = p_id
     AND user_id = auth.uid()
     AND status  = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.claim_ai_generation(JSONB, TEXT, TEXT, INTEGER, INTERVAL) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finish_ai_generation(UUID, TEXT, UUID, INTEGER, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_ai_generation(JSONB, TEXT, TEXT, INTEGER, INTERVAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finish_ai_generation(UUID, TEXT, UUID, INTEGER, INTEGER, TEXT) TO authenticated;
