-- ============================================================
-- SEED: deck contoh latihan berpendapat — Agree or Disagree
--
-- Deck gratis berbahasa Inggris, jenis 'berpendapat': 3 section ×
-- 8 kartu opinion, dari topik sehari-hari ke isu yang lebih berat.
-- Cara main: pembuka membaca pernyataan, membalik kartu, lalu
-- membela sisi yang keluar (AGREE / DISAGREE, diundi aplikasi)
-- sementara pemain lain menanggapi.
--
-- Semua pernyataan dipilih supaya KEDUA sisinya wajar dibela.
--
-- WAJIB jalankan migration 00001–00014 lebih dulu, dan jalankan
-- file ini terpisah dari 00014 (nilai enum baru).
-- Dibuat dari skrip; aman dijalankan ulang (ON CONFLICT DO NOTHING).
-- ============================================================

INSERT INTO categories (id, slug, name, description, is_free, sort_order, theme, mode, language) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'agree-or-disagree', 'Agree or Disagree', 'Practice arguing in English. Read a statement, flip the card, and defend the side you get — agree or disagree — while everyone else pushes back.', true, 5, 'teal', 'berpendapat', 'en')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('b1000000-0000-0000-0001-000000000001', 'b1000000-0000-0000-0000-000000000001', 'everyday-life', 'Everyday Life', 'Light statements about daily habits and choices.', '🏠', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('b1000000-0001-0001-0000-000000000001', 'b1000000-0000-0000-0001-000000000001', 'opinion', 'easy', 'Breakfast is the most important meal of the day.', 1, true),
  ('b1000000-0001-0001-0000-000000000002', 'b1000000-0000-0000-0001-000000000001', 'opinion', 'easy', 'It is better to wake up early than to stay up late.', 2, true),
  ('b1000000-0001-0001-0000-000000000003', 'b1000000-0000-0000-0001-000000000001', 'opinion', 'easy', 'Living in a big city is better than living in a village.', 3, true),
  ('b1000000-0001-0001-0000-000000000004', 'b1000000-0000-0000-0001-000000000001', 'opinion', 'easy', 'Having a pet makes people happier.', 4, true),
  ('b1000000-0001-0001-0000-000000000005', 'b1000000-0000-0000-0001-000000000001', 'opinion', 'easy', 'Cooking at home is always better than eating out.', 5, false),
  ('b1000000-0001-0001-0000-000000000006', 'b1000000-0000-0000-0001-000000000001', 'opinion', 'easy', 'The weekend should be three days long.', 6, false),
  ('b1000000-0001-0001-0000-000000000007', 'b1000000-0000-0000-0001-000000000001', 'opinion', 'easy', 'It is better to have a few close friends than many friends.', 7, false),
  ('b1000000-0001-0001-0000-000000000008', 'b1000000-0000-0000-0001-000000000001', 'opinion', 'easy', 'Walking is the best way to get around a city.', 8, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('b1000000-0000-0000-0001-000000000002', 'b1000000-0000-0000-0000-000000000001', 'school-work', 'School & Work', 'Statements about learning, studying, and working.', '🎒', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('b1000000-0001-0002-0000-000000000001', 'b1000000-0000-0000-0001-000000000002', 'opinion', 'medium', 'Students should not get homework on weekends.', 1, false),
  ('b1000000-0001-0002-0000-000000000002', 'b1000000-0000-0000-0001-000000000002', 'opinion', 'medium', 'Every school should require a uniform.', 2, false),
  ('b1000000-0001-0002-0000-000000000003', 'b1000000-0000-0000-0001-000000000002', 'opinion', 'medium', 'Working from home is better than working in an office.', 3, false),
  ('b1000000-0001-0002-0000-000000000004', 'b1000000-0000-0000-0001-000000000002', 'opinion', 'medium', 'Every student should learn a second language.', 4, false),
  ('b1000000-0001-0002-0000-000000000005', 'b1000000-0000-0000-0001-000000000002', 'opinion', 'medium', 'Exams are not a good way to measure learning.', 5, false),
  ('b1000000-0001-0002-0000-000000000006', 'b1000000-0000-0000-0001-000000000002', 'opinion', 'medium', 'Teenagers should have a part-time job.', 6, false),
  ('b1000000-0001-0002-0000-000000000007', 'b1000000-0000-0000-0001-000000000002', 'opinion', 'medium', 'Online classes are as good as classes in a classroom.', 7, false),
  ('b1000000-0001-0002-0000-000000000008', 'b1000000-0000-0000-0001-000000000002', 'opinion', 'medium', 'Group projects teach more than working alone.', 8, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('b1000000-0000-0000-0001-000000000003', 'b1000000-0000-0000-0000-000000000001', 'tech-society', 'Technology & Society', 'Bigger questions about technology and how we live together.', '🌍', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('b1000000-0001-0003-0000-000000000001', 'b1000000-0000-0000-0001-000000000003', 'opinion', 'hard', 'Children under twelve should not have their own smartphone.', 1, false),
  ('b1000000-0001-0003-0000-000000000002', 'b1000000-0000-0000-0001-000000000003', 'opinion', 'hard', 'Social media does more harm than good.', 2, false),
  ('b1000000-0001-0003-0000-000000000003', 'b1000000-0000-0000-0001-000000000003', 'opinion', 'hard', 'AI will create more jobs than it takes away.', 3, false),
  ('b1000000-0001-0003-0000-000000000004', 'b1000000-0000-0000-0001-000000000003', 'opinion', 'hard', 'Cash will disappear in the next twenty years.', 4, false),
  ('b1000000-0001-0003-0000-000000000005', 'b1000000-0000-0000-0001-000000000003', 'opinion', 'hard', 'Cities should ban cars from their centers.', 5, false),
  ('b1000000-0001-0003-0000-000000000006', 'b1000000-0000-0000-0001-000000000003', 'opinion', 'hard', 'People should repair things instead of buying new ones.', 6, false),
  ('b1000000-0001-0003-0000-000000000007', 'b1000000-0000-0000-0001-000000000003', 'opinion', 'hard', 'Video games can be a good way to learn.', 7, false),
  ('b1000000-0001-0003-0000-000000000008', 'b1000000-0000-0000-0001-000000000003', 'opinion', 'hard', 'Every student should do community service before finishing school.', 8, false)
ON CONFLICT (id) DO NOTHING;
