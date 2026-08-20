-- ============================================================
-- SEED: Kategori "Anak & Orang Tua"
--   Section 1: Orang Tua & Anak  — pertanyaan dua arah antara
--              orang tua dan anak
--   Section 2: Kids & Life       — role play + cerita/studi kasus
--              pengalaman anak di sekolah
-- ============================================================

-- Category
INSERT INTO categories (id, slug, name, description, is_free, sort_order, theme) VALUES
  ('22222222-2222-2222-2222-222222222222', 'anak-orang-tua', 'Anak & Orang Tua', 'Kartu untuk dimainkan orang tua bersama anak — pertanyaan hangat tentang hubungan kalian, plus role play dan studi kasus dari keseharian anak di sekolah.', true, 2, 'sky');

-- Sections
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES
  ('bbbb0001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'orang-tua-anak', 'Orang Tua & Anak', 'Pertanyaan bolak-balik: anak bertanya ke orang tua, orang tua bertanya ke anak.', '👨‍👩‍👧', 1),
  ('bbbb0002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'kids-and-life', 'Kids & Life', 'Role play dan studi kasus seputar cerita serta pengalaman anak di sekolah.', '🎒', 2);

-- ============================================================
-- ORANG TUA & ANAK (20 kartu: 12 talk, 8 action)
-- Kartu dibaca oleh siapa pun yang mengambilnya — "orang di
-- depanmu" bisa berarti orang tua atau anak.
-- ============================================================
INSERT INTO cards (section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  -- Talk
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'easy', 'Apa kegiatan bareng yang paling kamu tunggu-tunggu?', 1, true),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'easy', 'Kapan terakhir kali kamu merasa bangga sama aku?', 2, true),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'easy', 'Kenangan bareng kita yang paling kamu ingat sampai sekarang apa?', 3, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'easy', 'Kalau boleh minta satu hal dari aku minggu ini, kamu minta apa?', 4, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'easy', 'Menurut kamu, apa yang paling bikin aku tersenyum lebar?', 5, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'medium', 'Ada cerita yang ingin kamu bagi ke aku tapi belum sempat? Ceritakan sekarang.', 6, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'medium', 'Hal apa yang bikin kamu merasa disayang di rumah ini?', 7, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'medium', 'Kapan kamu merasa aku kurang mendengarkan kamu?', 8, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'medium', 'Aturan mana di rumah yang paling berat buat kamu jalani? Kenapa?', 9, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'medium', 'Kalau kamu yang jadi kepala keluarga sehari, apa yang kamu ubah?', 10, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'medium', 'Apa yang bikin kamu khawatir akhir-akhir ini tapi belum kamu bilang?', 11, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'talk', 'medium', 'Satu hal apa yang ingin kamu pelajari dari aku?', 12, false),
  -- Action
  ('bbbb0001-0000-0000-0000-000000000001', 'action', 'easy', 'Peluk orang di depanmu selama 10 detik 🤗', 13, true),
  ('bbbb0001-0000-0000-0000-000000000001', 'action', 'easy', 'Sebutkan 3 hal yang kamu syukuri dari orang di depanmu', 14, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'action', 'easy', 'Tirukan gaya bicara orang di depanmu waktu lagi senang 😄', 15, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'action', 'easy', 'Bergantian bilang "terima kasih sudah…" dan lengkapi kalimatnya', 16, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'action', 'easy', 'Ceritakan keluarga kita versi kamu dalam 1 menit', 17, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'action', 'easy', 'Tos, lalu ucapkan satu kalimat semangat untuk hari esok', 18, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'action', 'medium', 'Minta maaf untuk satu hal kecil yang belum sempat kamu minta maaf', 19, false),
  ('bbbb0001-0000-0000-0000-000000000001', 'action', 'medium', 'Buat satu janji kecil bareng untuk minggu ini, lalu jabat tangan', 20, false);

-- ============================================================
-- KIDS & LIFE (23 kartu: 14 talk, 9 action/role play)
-- ============================================================
INSERT INTO cards (section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  -- Talk — cerita & pengalaman
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'easy', 'Ceritakan satu hal seru yang terjadi di sekolah hari ini', 1, true),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'easy', 'Siapa teman yang bikin kamu paling nyaman di kelas? Kenapa?', 2, true),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'easy', 'Pelajaran apa yang paling susah? Bagian mana yang bikin susah?', 3, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'easy', 'Kapan terakhir kali kamu bangga sama diri sendiri di sekolah?', 4, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Kalau boleh mengulang satu hari di sekolah, hari apa dan kenapa?', 5, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Pernah nggak kamu merasa sendirian di sekolah? Ceritakan.', 6, false),
  -- Talk — studi kasus
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'easy', 'Studi kasus: Ada teman baru duduk sendirian saat istirahat. Apa yang kamu lakukan?', 7, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Studi kasus: Temanmu diejek di depan kelas. Apa yang kamu lakukan?', 8, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Studi kasus: Kamu lupa mengerjakan PR dan guru bertanya. Apa yang kamu katakan?', 9, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Studi kasus: Temanmu mengajak menyontek saat ulangan. Apa jawabanmu?', 10, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Studi kasus: Kamu nggak sengaja merusak barang teman. Apa langkah pertamamu?', 11, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Studi kasus: Bekalmu diambil tanpa izin. Apa yang kamu rasakan dan kamu lakukan?', 12, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Studi kasus: Kelompokmu nggak mau dengar idemu. Apa yang kamu coba?', 13, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'talk', 'medium', 'Studi kasus: Orang yang tidak kamu kenal menawarkan tumpangan pulang. Apa yang kamu lakukan?', 14, false),
  -- Action — role play
  ('bbbb0002-0000-0000-0000-000000000002', 'action', 'easy', 'Role play: Kamu jadi guru, aku jadi murid yang telat masuk kelas. Mulai!', 15, true),
  ('bbbb0002-0000-0000-0000-000000000002', 'action', 'easy', 'Role play: Kamu jadi murid baru, aku ajak kenalan. Peragakan perkenalanmu!', 16, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'action', 'easy', 'Role play: Kamu jadi orang tua, aku jadi anak yang susah bangun pagi', 17, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'action', 'easy', 'Role play: Presentasi 30 detik tentang hal favoritmu di depan "kelas"', 18, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'action', 'medium', 'Role play: Kita berdua rebutan giliran. Selesaikan tanpa berantem', 19, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'action', 'medium', 'Role play: Minta maaf ke teman yang kamu buat kesal. Ucapkan kalimatnya', 20, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'action', 'medium', 'Role play: Ada teman menangis di pojok kelas. Hibur dia sekarang', 21, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'action', 'medium', 'Role play: Tolak ajakan teman dengan sopan. Peragakan kalimatnya', 22, false),
  ('bbbb0002-0000-0000-0000-000000000002', 'action', 'medium', 'Role play: Minta tolong ke guru saat kamu merasa tidak aman. Peragakan', 23, false);

-- ============================================================
-- SPECIAL CARDS (3 kartu)
-- ============================================================
INSERT INTO cards (section_id, card_type, difficulty, content_text, special_kind, sort_order) VALUES
  ('bbbb0001-0000-0000-0000-000000000001', 'special', 'easy', 'Free Pass — Kamu boleh skip 1 pertanyaan', 'free_pass', 100),
  ('bbbb0001-0000-0000-0000-000000000001', 'special', 'easy', 'Switch — Tukar pertanyaan dengan lawan mainmu', 'switch', 101),
  ('bbbb0001-0000-0000-0000-000000000001', 'special', 'easy', 'Double — Jawab + lakukan 1 action tambahan', 'double', 102);
