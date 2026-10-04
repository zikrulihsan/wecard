-- ============================================================
-- FORMAT KARTU BARU: KUIS & LATIHAN MENDENGAR
--
-- Sampai sekarang kartu hanya talk / action / special — semuanya
-- "baca lalu kerjakan", tanpa jawaban. Format baru di bawah punya
-- sisi jawaban yang dibuka setelah pemain mencoba:
--
--   quiz            tanya jawab; balik kartu untuk lihat jawaban
--   multiple_choice pilihan ganda A–D
--   true_false      mitos atau fakta
--   clue            tebak dari clue yang dibuka satu per satu
--   ordering        urutkan langkah/kejadian yang diacak
--   listening       teks dibacakan, lalu pendengar menjawab
--                   pertanyaan-pertanyaannya
--
-- Bagian yang khas per format (pilihan, clue, jawaban, dll.)
-- disimpan di `details` (JSONB). Bentuknya didefinisikan dan
-- divalidasi di kode (packages/types/src/database.ts, CardDetails
-- dan apps/web/src/lib/cards/details.ts), sama seperti tema deck:
-- menambah field baru tidak butuh migration.
--
-- `level` (1–5, bintang) adalah tingkat kesulitan yang lebih halus
-- untuk kartu kuis & mendengar. Kartu lama tetap memakai
-- `difficulty`; level-nya NULL.
--
-- Catatan: nilai enum baru tidak boleh dipakai di transaksi yang
-- sama dengan ALTER TYPE ... ADD VALUE. Jalankan seed contoh
-- (seed_kuis_mendengar.sql) terpisah, setelah file ini.
--
-- Aman dijalankan ulang.
-- ============================================================

ALTER TYPE card_type ADD VALUE IF NOT EXISTS 'quiz';
ALTER TYPE card_type ADD VALUE IF NOT EXISTS 'multiple_choice';
ALTER TYPE card_type ADD VALUE IF NOT EXISTS 'true_false';
ALTER TYPE card_type ADD VALUE IF NOT EXISTS 'clue';
ALTER TYPE card_type ADD VALUE IF NOT EXISTS 'ordering';
ALTER TYPE card_type ADD VALUE IF NOT EXISTS 'listening';

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS details JSONB,
  ADD COLUMN IF NOT EXISTS level   SMALLINT;

ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_level_range;
ALTER TABLE cards
  ADD CONSTRAINT cards_level_range CHECK (level IS NULL OR level BETWEEN 1 AND 5);
