-- ============================================================
-- WARNA DECK
-- Tiap kategori punya tema warna sendiri. Deck hasil generate
-- AI ikut memilih temanya, deck bawaan diisi di sini.
--
-- Kolomnya sengaja TEXT tanpa CHECK: daftar tema hidup di kode
-- (packages/types/src/database.ts), dan nilai yang tidak dikenal
-- sudah jatuh ke tema bawaan lewat resolveDeckTheme(). Dengan
-- begitu menambah tema baru tidak butuh migration lagi.
--
-- Aman dijalankan ulang.
-- ============================================================

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'pink';

-- Deck bawaan: pasangan tetap pink, anak & orang tua pakai biru muda.
UPDATE categories SET theme = 'sky'
  WHERE slug = 'anak-orang-tua' AND theme = 'pink';
