-- ============================================================
-- BAHASA DECK
-- Bahasa isi kartu sebuah deck, terpisah dari bahasa aplikasi.
-- Beranda menampilkan deck yang bahasanya sama dengan bahasa
-- aplikasi lebih dulu dan memberi badge pada deck berbahasa lain;
-- suara "Bacakan" memakai bahasa ini untuk memilih suara.
--
--   id  Bahasa Indonesia (semua deck yang sudah ada)
--   en  English
--
-- Deck AI menyimpan bahasa kartu yang dipilih di form generate.
-- Versi English deck bawaan ada di seed_english.sql.
--
-- Sama seperti `theme` dan `mode`, kolomnya TEXT tanpa CHECK:
-- daftar bahasa hidup di kode, dan nilai yang tidak dikenal
-- dibaca sebagai 'id'.
--
-- Aman dijalankan ulang.
-- ============================================================

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'id';
