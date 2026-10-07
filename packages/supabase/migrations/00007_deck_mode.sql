-- ============================================================
-- JENIS DECK
-- Topik deck (pasangan, AI Engineering, …) dan cara memainkannya
-- adalah dua hal berbeda. Kolom `mode` menyimpan cara main:
--
--   ngobrol    pertanyaan dijawab dengan cerita (boleh diselipi
--              tantangan)
--   tantangan  semua kartu tantangan
--   kuis       kuis pengetahuan, jawaban di balik kartu
--   mendengar  teks dibacakan, lalu pertanyaannya dijawab
--
-- Beranda memisahkan deck per jenis, dan form generate memilih
-- jenis lebih dulu sebelum menanyakan pemain dan topik.
--
-- Sama seperti `theme`, kolomnya TEXT tanpa CHECK: daftar jenis
-- hidup di kode (packages/types/src/database.ts), dan nilai yang
-- tidak dikenal jatuh ke 'ngobrol' lewat resolveDeckMode().
--
-- Butuh migration 00006 (format kartu kuis & mendengar).
-- Aman dijalankan ulang.
-- ============================================================

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'ngobrol';

-- Deck yang sudah ada: tebak jenisnya dari kartu di dalamnya.
-- Hanya menyentuh baris yang masih bernilai bawaan, jadi jenis
-- yang sudah diisi (oleh generate atau manual) tidak tertimpa.
WITH card_kinds AS (
  SELECT
    s.category_id,
    bool_or(c.card_type = 'listening') AS has_listening,
    bool_or(c.card_type IN ('quiz', 'multiple_choice', 'true_false', 'clue', 'ordering')) AS has_quiz,
    bool_or(c.card_type = 'talk') AS has_talk,
    bool_or(c.card_type = 'action') AS has_action
  FROM cards c
  JOIN sections s ON s.id = c.section_id
  GROUP BY s.category_id
)
UPDATE categories cat
SET mode = CASE
    WHEN k.has_listening THEN 'mendengar'
    WHEN k.has_quiz THEN 'kuis'
    WHEN k.has_action AND NOT k.has_talk THEN 'tantangan'
    ELSE 'ngobrol'
  END
FROM card_kinds k
WHERE k.category_id = cat.id
  AND cat.mode = 'ngobrol';
