-- ============================================================
-- SEED: Kategori "Pasangan" dengan 50 kartu
-- ============================================================

-- Category
INSERT INTO categories (id, slug, name, description, is_free, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'pasangan', 'Pasangan', 'Kartu untuk pasangan — pertanyaan mendalam dan tantangan seru untuk mempererat hubungan kalian.', true, 1);

-- Sections
INSERT INTO sections (id, category_id, slug, name, icon, sort_order) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'warm-up', 'Warm Up', '🌱', 1),
  ('aaaa0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'appreciation', 'Appreciation', '❤️', 2),
  ('aaaa0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'deep-talk', 'Deep Talk', '💬', 3),
  ('aaaa0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'intimate', 'Intimate', '🔥', 4),
  ('aaaa0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'future-dreams', 'Future & Dreams', '🎯', 5);

-- ============================================================
-- WARM UP (8 cards: 4 talk, 4 action)
-- ============================================================
INSERT INTO cards (section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  -- Talk
  ('aaaa0001-0000-0000-0000-000000000001', 'talk', 'easy', 'Apa hal paling menyenangkan hari ini?', 1, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'talk', 'easy', 'Apa kebiasaan kecil aku yang kamu suka?', 2, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'talk', 'easy', 'Kalau kita jalan sekarang, kamu ingin ke mana?', 3, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'talk', 'easy', 'Apa makanan favorit kita berdua?', 4, false),
  -- Action
  ('aaaa0001-0000-0000-0000-000000000001', 'action', 'easy', 'Ceritakan 1 hal lucu hari ini dengan gaya lebay 😄', 5, true),
  ('aaaa0001-0000-0000-0000-000000000001', 'action', 'easy', 'Tatap pasanganmu 10 detik tanpa bicara', 6, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'action', 'easy', 'Tiru gaya pasanganmu saat lagi marah 😆', 7, false),
  ('aaaa0001-0000-0000-0000-000000000001', 'action', 'easy', 'Peluk pasanganmu selama 20 detik', 8, false);

-- ============================================================
-- APPRECIATION (8 cards: 4 talk, 4 action)
-- ============================================================
INSERT INTO cards (section_id, card_type, difficulty, content_text, sort_order) VALUES
  -- Talk
  ('aaaa0002-0000-0000-0000-000000000002', 'talk', 'easy', 'Sebutkan 3 hal yang kamu syukuri dari aku', 1),
  ('aaaa0002-0000-0000-0000-000000000002', 'talk', 'easy', 'Apa yang membuat kamu bangga punya aku?', 2),
  ('aaaa0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Hal apa dari aku yang bikin kamu merasa dicintai?', 3),
  ('aaaa0002-0000-0000-0000-000000000002', 'talk', 'easy', 'Apa kelebihan aku yang jarang aku sadari?', 4),
  -- Action
  ('aaaa0002-0000-0000-0000-000000000002', 'action', 'easy', 'Ucapkan "terima kasih" untuk 3 hal ke pasanganmu', 5),
  ('aaaa0002-0000-0000-0000-000000000002', 'action', 'medium', 'Bisikkan 1 kalimat manis ke telinga pasanganmu', 6),
  ('aaaa0002-0000-0000-0000-000000000002', 'action', 'easy', 'Tulis (atau ucapkan) 1 kalimat cinta spontan sekarang', 7),
  ('aaaa0002-0000-0000-0000-000000000002', 'action', 'easy', 'Pegang tangan pasanganmu selama 1 menit', 8);

-- ============================================================
-- DEEP TALK (11 cards: 7 talk, 4 action)
-- ============================================================
INSERT INTO cards (section_id, card_type, difficulty, content_text, sort_order) VALUES
  -- Talk
  ('aaaa0003-0000-0000-0000-000000000003', 'talk', 'hard', 'Apa ketakutan terbesar kamu saat ini?', 1),
  ('aaaa0003-0000-0000-0000-000000000003', 'talk', 'medium', 'Apa arti bahagia dalam hubungan menurut kamu?', 2),
  ('aaaa0003-0000-0000-0000-000000000003', 'talk', 'medium', 'Apa yang ingin kita perbaiki bersama?', 3),
  ('aaaa0003-0000-0000-0000-000000000003', 'talk', 'hard', 'Apa yang membuat kamu merasa tidak dimengerti?', 4),
  ('aaaa0003-0000-0000-0000-000000000003', 'talk', 'medium', 'Apa yang kamu butuhkan saat kamu sedih?', 5),
  ('aaaa0003-0000-0000-0000-000000000003', 'talk', 'medium', 'Apa arti "rumah" buat kamu?', 6),
  ('aaaa0003-0000-0000-0000-000000000003', 'talk', 'medium', 'Apa harapan kamu untuk hubungan ini?', 7),
  -- Action
  ('aaaa0003-0000-0000-0000-000000000003', 'action', 'hard', 'Ceritakan sesuatu yang selama ini kamu pendam', 8),
  ('aaaa0003-0000-0000-0000-000000000003', 'action', 'medium', 'Dengarkan pasanganmu tanpa menyela selama 2 menit', 9),
  ('aaaa0003-0000-0000-0000-000000000003', 'action', 'medium', 'Pegang tangan pasanganmu sambil saling menatap dan diam 30 detik', 10),
  ('aaaa0003-0000-0000-0000-000000000003', 'action', 'medium', 'Ucapkan "aku ada untuk kamu" dengan tulus', 11);

-- ============================================================
-- INTIMATE (10 cards: 6 talk, 5 action — note: originally listed as such)
-- ============================================================
INSERT INTO cards (section_id, card_type, difficulty, content_text, sort_order) VALUES
  -- Talk
  ('aaaa0004-0000-0000-0000-000000000004', 'talk', 'medium', 'Momen paling romantis kita menurut kamu?', 1),
  ('aaaa0004-0000-0000-0000-000000000004', 'talk', 'medium', 'Apa yang bikin kamu merasa dekat dengan aku?', 2),
  ('aaaa0004-0000-0000-0000-000000000004', 'talk', 'hard', 'Apa yang kamu rindukan dari masa awal kita?', 3),
  ('aaaa0004-0000-0000-0000-000000000004', 'talk', 'medium', 'Hal apa yang bikin kamu jatuh cinta lagi?', 4),
  ('aaaa0004-0000-0000-0000-000000000004', 'talk', 'medium', 'Apa cara favorit kamu menunjukkan cinta?', 5),
  ('aaaa0004-0000-0000-0000-000000000004', 'talk', 'hard', 'Kalau kita ulang dari awal, kamu tetap pilih aku?', 6),
  -- Action
  ('aaaa0004-0000-0000-0000-000000000004', 'action', 'hard', 'Peluk pasanganmu dari belakang', 7),
  ('aaaa0004-0000-0000-0000-000000000004', 'action', 'medium', 'Berikan 1 pujian yang sangat spesifik', 8),
  ('aaaa0004-0000-0000-0000-000000000004', 'action', 'hard', 'Cium kening pasanganmu', 9),
  ('aaaa0004-0000-0000-0000-000000000004', 'action', 'hard', 'Tatap mata pasanganmu dan bilang "aku sayang kamu"', 10),
  ('aaaa0004-0000-0000-0000-000000000004', 'action', 'medium', 'Buat pasanganmu tersenyum dalam 10 detik', 11);

-- ============================================================
-- FUTURE & DREAMS (10 cards: 5 talk, 4 action)
-- ============================================================
INSERT INTO cards (section_id, card_type, difficulty, content_text, sort_order) VALUES
  -- Talk
  ('aaaa0005-0000-0000-0000-000000000005', 'talk', 'medium', 'Kita 5 tahun lagi seperti apa?', 1),
  ('aaaa0005-0000-0000-0000-000000000005', 'talk', 'easy', 'Tempat impian kita ke mana?', 2),
  ('aaaa0005-0000-0000-0000-000000000005', 'talk', 'medium', 'Apa tujuan terbesar kita sebagai pasangan?', 3),
  ('aaaa0005-0000-0000-0000-000000000005', 'talk', 'easy', 'Hal apa yang ingin kita wujudkan dalam waktu dekat?', 4),
  ('aaaa0005-0000-0000-0000-000000000005', 'talk', 'medium', 'Versi terbaik dari "kita" itu seperti apa?', 5),
  -- Action
  ('aaaa0005-0000-0000-0000-000000000005', 'action', 'easy', 'Rencanakan 1 kencan sederhana bersama sekarang', 6),
  ('aaaa0005-0000-0000-0000-000000000005', 'action', 'easy', 'Sebutkan 1 mimpi dan minta pasanganmu mendukungnya', 7),
  ('aaaa0005-0000-0000-0000-000000000005', 'action', 'easy', 'Buat janji kecil yang bisa dilakukan minggu ini', 8),
  ('aaaa0005-0000-0000-0000-000000000005', 'action', 'medium', 'Bayangkan masa depan dan ceritakan dengan penuh semangat', 9);

-- ============================================================
-- SPECIAL CARDS (3 cards)
-- ============================================================
INSERT INTO cards (section_id, card_type, difficulty, content_text, special_kind, sort_order) VALUES
  ('aaaa0001-0000-0000-0000-000000000001', 'special', 'easy', 'Free Pass — Kamu boleh skip 1 pertanyaan', 'free_pass', 100),
  ('aaaa0001-0000-0000-0000-000000000001', 'special', 'easy', 'Switch — Tukar pertanyaan dengan pasanganmu', 'switch', 101),
  ('aaaa0001-0000-0000-0000-000000000001', 'special', 'easy', 'Double — Jawab + lakukan 1 action tambahan', 'double', 102);
