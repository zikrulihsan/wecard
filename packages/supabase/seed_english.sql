-- ============================================================
-- SEED: versi English deck bawaan
--   1. Couples                      (padanan "Pasangan")
--   2. Kids & Parents               (padanan "Anak & Orang Tua")
--   3. Listening Practice           (padanan "Latihan Mendengar")
--   4. Self-Test: AI Engineering    (padanan "Uji Diri: AI Engineering")
--
-- Deck terpisah dengan language = 'en', bukan terjemahan di dalam
-- deck yang sama: pembelian, riwayat main, dan jumlah kartu tiap
-- bahasa jadi berdiri sendiri. Beranda menampilkan deck yang
-- bahasanya sama dengan bahasa aplikasi lebih dulu.
--
-- WAJIB jalankan migration 00006, 00007, lalu 00008 lebih dulu
-- (kolom mode & language, format kartu kuis & mendengar).
-- Dibuat dari skrip; jalankan sekali saja (id-nya tetap).
-- ============================================================


-- Couples
INSERT INTO categories (id, slug, name, description, is_free, sort_order, theme, mode, language) VALUES
  ('55555555-5555-5555-5555-555555555555', 'couples', 'Couples', 'Cards for couples — deep questions and fun challenges to bring you closer.', true, 1, 'pink', 'ngobrol', 'en');
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES
  ('eeee0001-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'warm-up', 'Warm Up', NULL, '🌱', 1),
  ('eeee0002-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'appreciation', 'Appreciation', NULL, '❤️', 2),
  ('eeee0003-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'deep-talk', 'Deep Talk', NULL, '💬', 3),
  ('eeee0004-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', 'intimate', 'Intimate', NULL, '🔥', 4),
  ('eeee0005-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 'future-dreams', 'Future & Dreams', NULL, '🎯', 5);
INSERT INTO cards (section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('eeee0001-0000-0000-0000-000000000001', 'talk', 'easy', 'What was the best part of today?', 1, true),
  ('eeee0001-0000-0000-0000-000000000001', 'talk', 'easy', 'What''s one little habit of mine that you love?', 2, true),
  ('eeee0001-0000-0000-0000-000000000001', 'talk', 'easy', 'If we went out right now, where would you want to go?', 3, false),
  ('eeee0001-0000-0000-0000-000000000001', 'talk', 'easy', 'What''s our favorite food to share?', 4, false),
  ('eeee0001-0000-0000-0000-000000000001', 'action', 'easy', 'Tell one funny thing from today in the most dramatic way possible 😄', 5, true),
  ('eeee0001-0000-0000-0000-000000000001', 'action', 'easy', 'Look at your partner for 10 seconds without saying a word', 6, false),
  ('eeee0001-0000-0000-0000-000000000001', 'action', 'easy', 'Imitate your partner when they''re annoyed 😆', 7, false),
  ('eeee0001-0000-0000-0000-000000000001', 'action', 'easy', 'Hug your partner for 20 seconds', 8, false),
  ('eeee0002-0000-0000-0000-000000000002', 'talk', 'easy', 'Name 3 things about me you''re grateful for', 1, false),
  ('eeee0002-0000-0000-0000-000000000002', 'talk', 'easy', 'What makes you proud to have me?', 2, false),
  ('eeee0002-0000-0000-0000-000000000002', 'talk', 'medium', 'What do I do that makes you feel loved?', 3, false),
  ('eeee0002-0000-0000-0000-000000000002', 'talk', 'easy', 'What''s a strength of mine that I rarely notice?', 4, false),
  ('eeee0002-0000-0000-0000-000000000002', 'action', 'easy', 'Say "thank you" to your partner for 3 things', 5, false),
  ('eeee0002-0000-0000-0000-000000000002', 'action', 'medium', 'Whisper one sweet sentence in your partner''s ear', 6, false),
  ('eeee0002-0000-0000-0000-000000000002', 'action', 'easy', 'Write (or say) one spontaneous loving sentence right now', 7, false),
  ('eeee0002-0000-0000-0000-000000000002', 'action', 'easy', 'Hold your partner''s hand for 1 minute', 8, false),
  ('eeee0003-0000-0000-0000-000000000003', 'talk', 'hard', 'What''s your biggest fear right now?', 1, false),
  ('eeee0003-0000-0000-0000-000000000003', 'talk', 'medium', 'What does happiness in a relationship mean to you?', 2, false),
  ('eeee0003-0000-0000-0000-000000000003', 'talk', 'medium', 'What''s something we''d like to improve together?', 3, false),
  ('eeee0003-0000-0000-0000-000000000003', 'talk', 'hard', 'What makes you feel misunderstood?', 4, false),
  ('eeee0003-0000-0000-0000-000000000003', 'talk', 'medium', 'What do you need when you''re sad?', 5, false),
  ('eeee0003-0000-0000-0000-000000000003', 'talk', 'medium', 'What does "home" mean to you?', 6, false),
  ('eeee0003-0000-0000-0000-000000000003', 'talk', 'medium', 'What are your hopes for our relationship?', 7, false),
  ('eeee0003-0000-0000-0000-000000000003', 'action', 'hard', 'Share something you''ve been keeping to yourself', 8, false),
  ('eeee0003-0000-0000-0000-000000000003', 'action', 'medium', 'Listen to your partner for 2 minutes without interrupting', 9, false),
  ('eeee0003-0000-0000-0000-000000000003', 'action', 'medium', 'Hold hands, look at each other, and stay silent for 30 seconds', 10, false),
  ('eeee0003-0000-0000-0000-000000000003', 'action', 'medium', 'Sincerely say "I''m here for you"', 11, false),
  ('eeee0004-0000-0000-0000-000000000004', 'talk', 'medium', 'What''s our most romantic moment, in your opinion?', 1, false),
  ('eeee0004-0000-0000-0000-000000000004', 'talk', 'medium', 'What makes you feel close to me?', 2, false),
  ('eeee0004-0000-0000-0000-000000000004', 'talk', 'hard', 'What do you miss from our early days?', 3, false),
  ('eeee0004-0000-0000-0000-000000000004', 'talk', 'medium', 'What makes you fall in love all over again?', 4, false),
  ('eeee0004-0000-0000-0000-000000000004', 'talk', 'medium', 'What''s your favorite way to show love?', 5, false),
  ('eeee0004-0000-0000-0000-000000000004', 'talk', 'hard', 'If we started over, would you still choose me?', 6, false),
  ('eeee0004-0000-0000-0000-000000000004', 'action', 'hard', 'Hug your partner from behind', 7, false),
  ('eeee0004-0000-0000-0000-000000000004', 'action', 'medium', 'Give one very specific compliment', 8, false),
  ('eeee0004-0000-0000-0000-000000000004', 'action', 'hard', 'Kiss your partner on the forehead', 9, false),
  ('eeee0004-0000-0000-0000-000000000004', 'action', 'hard', 'Look into your partner''s eyes and say "I love you"', 10, false),
  ('eeee0004-0000-0000-0000-000000000004', 'action', 'medium', 'Make your partner smile within 10 seconds', 11, false),
  ('eeee0005-0000-0000-0000-000000000005', 'talk', 'medium', 'What will we be like 5 years from now?', 1, false),
  ('eeee0005-0000-0000-0000-000000000005', 'talk', 'easy', 'Where''s our dream place to go?', 2, false),
  ('eeee0005-0000-0000-0000-000000000005', 'talk', 'medium', 'What''s our biggest goal as a couple?', 3, false),
  ('eeee0005-0000-0000-0000-000000000005', 'talk', 'easy', 'What would we like to make happen soon?', 4, false),
  ('eeee0005-0000-0000-0000-000000000005', 'talk', 'medium', 'What does the best version of "us" look like?', 5, false),
  ('eeee0005-0000-0000-0000-000000000005', 'action', 'easy', 'Plan one simple date together right now', 6, false),
  ('eeee0005-0000-0000-0000-000000000005', 'action', 'easy', 'Share one dream and ask your partner to support it', 7, false),
  ('eeee0005-0000-0000-0000-000000000005', 'action', 'easy', 'Make a small promise you can keep this week', 8, false),
  ('eeee0005-0000-0000-0000-000000000005', 'action', 'medium', 'Imagine our future and describe it with lots of excitement', 9, false);
INSERT INTO cards (section_id, card_type, difficulty, content_text, special_kind, sort_order) VALUES
  ('eeee0001-0000-0000-0000-000000000001', 'special', 'easy', 'Free Pass — You may skip 1 question', 'free_pass', 100),
  ('eeee0001-0000-0000-0000-000000000001', 'special', 'easy', 'Switch — Swap the question with your partner', 'switch', 101),
  ('eeee0001-0000-0000-0000-000000000001', 'special', 'easy', 'Double — Answer + do 1 extra action', 'double', 102);

-- Kids & Parents
INSERT INTO categories (id, slug, name, description, is_free, sort_order, theme, mode, language) VALUES
  ('66666666-6666-6666-6666-666666666666', 'kids-parents', 'Kids & Parents', 'Cards for parents to play with their kids — warm questions about your relationship, plus role play and case studies from your child''s everyday life at school.', true, 2, 'sky', 'ngobrol', 'en');
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES
  ('eeee0011-0000-0000-0000-000000000011', '66666666-6666-6666-6666-666666666666', 'parents-kids', 'Parents & Kids', 'Questions both ways: kids ask parents, parents ask kids.', '👨‍👩‍👧', 1),
  ('eeee0012-0000-0000-0000-000000000012', '66666666-6666-6666-6666-666666666666', 'kids-and-life', 'Kids & Life', 'Role play and case studies about kids'' stories and experiences at school.', '🎒', 2);
INSERT INTO cards (section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'easy', 'What activity together do you look forward to most?', 1, true),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'easy', 'When was the last time you felt proud of me?', 2, true),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'easy', 'What memory of us do you still remember the most?', 3, false),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'easy', 'If you could ask one thing of me this week, what would it be?', 4, false),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'easy', 'What do you think makes me smile the biggest?', 5, false),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'medium', 'Is there a story you''ve wanted to tell me but haven''t yet? Tell it now.', 6, false),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'medium', 'What makes you feel loved in this home?', 7, false),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'medium', 'When do you feel like I don''t listen to you enough?', 8, false),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'medium', 'Which house rule is the hardest for you to follow? Why?', 9, false),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'medium', 'If you were head of the family for a day, what would you change?', 10, false),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'medium', 'What''s been worrying you lately that you haven''t told anyone?', 11, false),
  ('eeee0011-0000-0000-0000-000000000011', 'talk', 'medium', 'What''s one thing you''d like to learn from me?', 12, false),
  ('eeee0011-0000-0000-0000-000000000011', 'action', 'easy', 'Hug the person in front of you for 10 seconds 🤗', 13, true),
  ('eeee0011-0000-0000-0000-000000000011', 'action', 'easy', 'Name 3 things you''re grateful for about the person in front of you', 14, false),
  ('eeee0011-0000-0000-0000-000000000011', 'action', 'easy', 'Imitate how the person in front of you talks when they''re happy 😄', 15, false),
  ('eeee0011-0000-0000-0000-000000000011', 'action', 'easy', 'Take turns saying "thank you for…" and finish the sentence', 16, false),
  ('eeee0011-0000-0000-0000-000000000011', 'action', 'easy', 'Tell the story of our family your way in 1 minute', 17, false),
  ('eeee0011-0000-0000-0000-000000000011', 'action', 'easy', 'High-five, then say one encouraging sentence for tomorrow', 18, false),
  ('eeee0011-0000-0000-0000-000000000011', 'action', 'medium', 'Apologize for one small thing you haven''t apologized for yet', 19, false),
  ('eeee0011-0000-0000-0000-000000000011', 'action', 'medium', 'Make one small promise together for this week, then shake hands', 20, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'easy', 'Tell one fun thing that happened at school today', 1, true),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'easy', 'Which friend makes you feel most comfortable in class? Why?', 2, true),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'easy', 'Which subject is the hardest? What part makes it hard?', 3, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'easy', 'When was the last time you felt proud of yourself at school?', 4, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'medium', 'If you could redo one day at school, which day and why?', 5, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'medium', 'Have you ever felt alone at school? Tell me about it.', 6, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'easy', 'Case study: A new kid is sitting alone at recess. What do you do?', 7, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'medium', 'Case study: Your friend is being teased in front of the class. What do you do?', 8, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'medium', 'Case study: You forgot your homework and the teacher asks about it. What do you say?', 9, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'medium', 'Case study: A friend asks you to cheat on a test. What''s your answer?', 10, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'medium', 'Case study: You accidentally broke a friend''s things. What''s your first step?', 11, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'medium', 'Case study: Someone took your lunch without asking. How do you feel and what do you do?', 12, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'medium', 'Case study: Your group won''t listen to your idea. What do you try?', 13, false),
  ('eeee0012-0000-0000-0000-000000000012', 'talk', 'medium', 'Case study: A stranger offers you a ride home. What do you do?', 14, false),
  ('eeee0012-0000-0000-0000-000000000012', 'action', 'easy', 'Role play: You''re the teacher, I''m a student who''s late to class. Go!', 15, true),
  ('eeee0012-0000-0000-0000-000000000012', 'action', 'easy', 'Role play: You''re the new student and I come say hi. Act out how you introduce yourself!', 16, false),
  ('eeee0012-0000-0000-0000-000000000012', 'action', 'easy', 'Role play: You''re the parent, I''m the kid who won''t get up in the morning', 17, false),
  ('eeee0012-0000-0000-0000-000000000012', 'action', 'easy', 'Role play: Give a 30-second presentation about your favorite thing in front of the "class"', 18, false),
  ('eeee0012-0000-0000-0000-000000000012', 'action', 'medium', 'Role play: We both want the same turn. Sort it out without fighting', 19, false),
  ('eeee0012-0000-0000-0000-000000000012', 'action', 'medium', 'Role play: Apologize to a friend you upset. Say the actual words', 20, false),
  ('eeee0012-0000-0000-0000-000000000012', 'action', 'medium', 'Role play: A friend is crying in the corner of the classroom. Comfort them now', 21, false),
  ('eeee0012-0000-0000-0000-000000000012', 'action', 'medium', 'Role play: Politely turn down a friend''s invitation. Act out what you''d say', 22, false),
  ('eeee0012-0000-0000-0000-000000000012', 'action', 'medium', 'Role play: Ask a teacher for help when you feel unsafe. Act it out', 23, false);
INSERT INTO cards (section_id, card_type, difficulty, content_text, special_kind, sort_order) VALUES
  ('eeee0011-0000-0000-0000-000000000011', 'special', 'easy', 'Free Pass — You may skip 1 question', 'free_pass', 100),
  ('eeee0011-0000-0000-0000-000000000011', 'special', 'easy', 'Switch — Swap the question with the other player', 'switch', 101),
  ('eeee0011-0000-0000-0000-000000000011', 'special', 'easy', 'Double — Answer + do 1 extra action', 'double', 102);

-- Listening Practice
INSERT INTO categories (id, slug, name, description, is_free, sort_order, theme, mode, language) VALUES
  ('77777777-7777-7777-7777-777777777777', 'listening-practice', 'Listening Practice', 'Build kids'' concentration and listening skills. One person reads aloud, the others answer — levels go from one simple sentence up to a short story.', true, 3, 'sky', 'mendengar', 'en');
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES
  ('eeee0021-0000-0000-0000-000000000021', '77777777-7777-7777-7777-777777777777', 'level-1', 'Level 1 — Who & What', 'One sentence, one character, one event.', '1️⃣', 1),
  ('eeee0022-0000-0000-0000-000000000022', '77777777-7777-7777-7777-777777777777', 'level-2', 'Level 2 — Where & When', 'Includes a place and a time.', '2️⃣', 2),
  ('eeee0023-0000-0000-0000-000000000023', '77777777-7777-7777-7777-777777777777', 'level-3', 'Level 3 — Order & Details', 'Two or three events in order, plus details like color or number.', '3️⃣', 3),
  ('eeee0024-0000-0000-0000-000000000024', '77777777-7777-7777-7777-777777777777', 'level-4', 'Level 4 — Cause & Effect', 'Uses words like "because", "then", or "so". Always includes a why question.', '4️⃣', 4),
  ('eeee0025-0000-0000-0000-000000000025', '77777777-7777-7777-7777-777777777777', 'level-5', 'Level 5 — Story & Inference', 'A short story with several characters. Some answers have to be inferred.', '5️⃣', 5);
INSERT INTO cards (section_id, card_type, difficulty, level, content_text, details, sort_order, is_free_preview) VALUES
  ('eeee0021-0000-0000-0000-000000000021', 'listening', 'easy', 1, 'Ben is eating a red apple.', '{"questions": [{"question": "Who is eating?", "answer": "Ben"}, {"question": "What is Ben eating?", "answer": "A red apple"}]}'::jsonb, 1, true),
  ('eeee0021-0000-0000-0000-000000000021', 'listening', 'easy', 1, 'The cat is sleeping on the chair.', '{"questions": [{"question": "Which animal is sleeping?", "answer": "The cat"}, {"question": "Where is the cat sleeping?", "answer": "On the chair"}]}'::jsonb, 2, true),
  ('eeee0021-0000-0000-0000-000000000021', 'listening', 'easy', 1, 'Mom is cooking fried rice.', '{"questions": [{"question": "Who is cooking?", "answer": "Mom"}, {"question": "What is Mom cooking?", "answer": "Fried rice"}]}'::jsonb, 3, false),
  ('eeee0022-0000-0000-0000-000000000022', 'listening', 'easy', 2, 'This morning Sarah watered the flowers in the front yard.', '{"questions": [{"question": "When did Sarah water the flowers?", "answer": "This morning"}, {"question": "Where did Sarah water the flowers?", "answer": "In the front yard"}, {"question": "What did Sarah do?", "answer": "She watered the flowers"}]}'::jsonb, 1, true),
  ('eeee0022-0000-0000-0000-000000000022', 'listening', 'easy', 2, 'Every afternoon Dad plays soccer with Adam at the field.', '{"questions": [{"question": "When do they play soccer?", "answer": "Every afternoon"}, {"question": "Where do they play?", "answer": "At the field"}, {"question": "Who does Dad play with?", "answer": "Adam"}]}'::jsonb, 2, true),
  ('eeee0022-0000-0000-0000-000000000022', 'listening', 'easy', 2, 'On Friday, Grandma came to our house with some cake.', '{"questions": [{"question": "What day did Grandma come?", "answer": "Friday"}, {"question": "What did Grandma bring?", "answer": "Cake"}]}'::jsonb, 3, false),
  ('eeee0023-0000-0000-0000-000000000023', 'listening', 'medium', 3, 'Danny put on his blue shoes, picked up his bag, and then walked to school with two of his friends.', '{"questions": [{"question": "What color were Danny''s shoes?", "answer": "Blue"}, {"question": "What did Danny do after putting on his shoes?", "answer": "He picked up his bag"}, {"question": "How many friends did Danny walk with?", "answer": "Two friends"}]}'::jsonb, 1, true),
  ('eeee0023-0000-0000-0000-000000000023', 'listening', 'medium', 3, 'Lily bought three books and one green pencil, and then paid at the cashier.', '{"questions": [{"question": "How many books did Lily buy?", "answer": "Three books"}, {"question": "What color was the pencil?", "answer": "Green"}, {"question": "What did Lily do last?", "answer": "She paid at the cashier"}]}'::jsonb, 2, true),
  ('eeee0023-0000-0000-0000-000000000023', 'listening', 'medium', 3, 'After the dawn prayer, Fajar made his bed, took a shower, and then ate bread and milk for breakfast.', '{"questions": [{"question": "What did Fajar do first after praying?", "answer": "He made his bed"}, {"question": "What did Fajar eat for breakfast?", "answer": "Bread and milk"}, {"question": "Did Fajar shower before or after breakfast?", "answer": "Before breakfast"}]}'::jsonb, 3, false),
  ('eeee0024-0000-0000-0000-000000000024', 'listening', 'hard', 4, 'Because her bike tire was flat, Rachel decided to take the bus, and then went to the kids'' activity center.', '{"questions": [{"question": "What happened?", "answer": "Rachel''s bike tire was flat"}, {"question": "Who made the decision?", "answer": "Rachel"}, {"question": "What did Rachel decide?", "answer": "To take the bus"}, {"question": "Why did Rachel do that?", "answer": "Because her bike tire was flat"}]}'::jsonb, 1, true),
  ('eeee0024-0000-0000-0000-000000000024', 'listening', 'hard', 4, 'It rained so hard that the field got muddy, so the teacher moved gym class to the hall.', '{"questions": [{"question": "Why did the field get muddy?", "answer": "Because it rained hard"}, {"question": "Where was gym class moved?", "answer": "To the hall"}, {"question": "Why was gym class moved?", "answer": "Because the field was muddy"}]}'::jsonb, 2, true),
  ('eeee0024-0000-0000-0000-000000000024', 'listening', 'hard', 4, 'Andy forgot his lunch, so Ben shared half of his sandwich because he felt sorry seeing Andy hungry.', '{"questions": [{"question": "What did Andy forget?", "answer": "His lunch"}, {"question": "What did Ben do?", "answer": "Shared half of his sandwich"}, {"question": "Why did Ben do that?", "answer": "Because he felt sorry seeing Andy hungry"}]}'::jsonb, 3, false),
  ('eeee0025-0000-0000-0000-000000000025', 'listening', 'hard', 5, 'It rained hard that afternoon. Nina waited in front of the school, but her father hadn''t arrived yet. Her teacher lent her an umbrella and stayed with Nina until her father came. Nina smiled and said thank you.', '{"questions": [{"question": "Why did Nina have to wait?", "answer": "Her father hadn''t come to pick her up yet"}, {"question": "What did the teacher do?", "answer": "Lent her an umbrella and stayed with Nina"}, {"question": "How did Nina feel at the end of the story? How do you know?", "answer": "Happy or relieved — Nina smiled and said thank you"}], "explanation": "The last answer is implied: it isn''t said directly, so you have to infer it from what Nina does."}'::jsonb, 1, true),
  ('eeee0025-0000-0000-0000-000000000025', 'listening', 'hard', 5, 'Ray and Tim both wanted to use the swing. Ray said, "You go first, then we''ll take turns." Tim nodded. After counting to ten, Tim got off and Ray got on. They played until the afternoon.', '{"questions": [{"question": "What was Ray and Tim''s problem?", "answer": "They both wanted to use the swing"}, {"question": "How did they solve it?", "answer": "They took turns, with Tim going first"}, {"question": "What good quality did Ray show?", "answer": "He was willing to give way and share"}], "explanation": "Ray''s quality isn''t stated directly — it''s inferred from what he says."}'::jsonb, 2, true),
  ('eeee0025-0000-0000-0000-000000000025', 'listening', 'hard', 5, 'Mom put some cake on the table for the guests. Little brother saw it and wanted to take a piece. Big sister said, "Wait, ask Mom first." So he asked. Mom smiled and gave him a piece of cake from the kitchen.', '{"questions": [{"question": "Who was the cake on the table for?", "answer": "For the guests"}, {"question": "What did little brother do after his sister''s advice?", "answer": "He asked Mom first"}, {"question": "Why do you think Mom gave cake from the kitchen, not the table?", "answer": "Because the cake on the table was for the guests"}], "explanation": "The third question practices drawing a conclusion from a detail at the start of the story."}'::jsonb, 3, false);

-- Self-Test: AI Engineering
INSERT INTO categories (id, slug, name, description, is_free, sort_order, theme, mode, language) VALUES
  ('88888888-8888-8888-8888-888888888888', 'ai-engineering-self-test', 'Self-Test: AI Engineering', 'A quiz to test your understanding of building LLM-powered apps — from the basics and RAG to agents and evaluation. Answer first, then flip the card.', true, 4, 'indigo', 'kuis', 'en');
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES
  ('eeee0031-0000-0000-0000-000000000031', '88888888-8888-8888-8888-888888888888', 'llm-basics', 'LLM Basics', 'Tokens, context windows, prompts, and sampling parameters.', '🧩', 1),
  ('eeee0032-0000-0000-0000-000000000032', '88888888-8888-8888-8888-888888888888', 'rag', 'RAG & Retrieval', 'Making the model answer from your own documents.', '📚', 2),
  ('eeee0033-0000-0000-0000-000000000033', '88888888-8888-8888-8888-888888888888', 'agents-evaluation', 'Agents, Security & Evaluation', 'Tool use, prompt injection, and how to measure quality.', '🛠️', 3);
INSERT INTO cards (section_id, card_type, difficulty, level, content_text, details, sort_order, is_free_preview) VALUES
  ('eeee0031-0000-0000-0000-000000000031', 'quiz', 'easy', 1, 'What is a token in the context of LLMs?', '{"answer": "A chunk of text — a word, part of a word, or punctuation — that the model processes.", "explanation": "Input length, output length, and API cost are measured in tokens, not words or characters."}'::jsonb, 1, true),
  ('eeee0031-0000-0000-0000-000000000031', 'quiz', 'easy', 1, 'What does “context window” mean?', '{"answer": "The maximum number of tokens a model can process in one call, including both input and output."}'::jsonb, 2, true),
  ('eeee0031-0000-0000-0000-000000000031', 'true_false', 'easy', 2, 'Raising the temperature makes a model''s answers more accurate.', '{"isTrue": false, "explanation": "Temperature controls how random token selection is. Low values make output more consistent; high values make it more varied, not more accurate."}'::jsonb, 3, false),
  ('eeee0031-0000-0000-0000-000000000031', 'multiple_choice', 'easy', 2, 'Why can LLMs “hallucinate”?', '{"options": ["Because the server is overloaded", "Because the model predicts plausible-sounding text rather than checking facts", "Because the prompt is too short", "Because the temperature is always zero"], "correctIndex": 1, "explanation": "Models are trained to produce the most likely continuation of text. Without a source to refer to, they can construct answers that sound convincing but are wrong."}'::jsonb, 4, false),
  ('eeee0031-0000-0000-0000-000000000031', 'clue', 'easy', 2, 'Which prompting technique is this?', '{"clues": ["I''m used inside the prompt.", "I contain several example input–output pairs.", "The model copies the pattern from my examples."], "answer": "Few-shot prompting"}'::jsonb, 5, false),
  ('eeee0031-0000-0000-0000-000000000031', 'multiple_choice', 'medium', 3, 'You need the model to always return valid JSON. What''s the most reliable way?', '{"options": ["Write “please reply in JSON” at the end of the prompt", "Lower the temperature to 0", "Use the API''s structured output / JSON schema feature", "Make the system prompt longer"], "correctIndex": 2, "explanation": "Structured output constrains the model to only produce JSON that matches the schema — text instructions alone can still be ignored."}'::jsonb, 6, false),
  ('eeee0032-0000-0000-0000-000000000032', 'quiz', 'easy', 2, 'What does RAG stand for, and what''s the core idea?', '{"answer": "Retrieval-Augmented Generation: fetch relevant documents first, then include them in the prompt so the model answers based on them."}'::jsonb, 1, true),
  ('eeee0032-0000-0000-0000-000000000032', 'quiz', 'easy', 2, 'What is an embedding?', '{"answer": "A representation of text as a vector of numbers, where texts with similar meaning have vectors close together.", "explanation": "This is what makes meaning-based (semantic) search possible."}'::jsonb, 2, true),
  ('eeee0032-0000-0000-0000-000000000032', 'ordering', 'medium', 3, 'Put the steps of a typical RAG pipeline in order.', '{"items": ["Split documents into chunks", "Turn each chunk into an embedding", "Store the embeddings in a vector database", "Find the chunks most similar to the user''s question", "Put those chunks in the prompt and ask the model to answer"]}'::jsonb, 3, false),
  ('eeee0032-0000-0000-0000-000000000032', 'multiple_choice', 'medium', 3, 'A model must answer from internal company documents that change every week. Which approach fits best?', '{"options": ["Re-fine-tune every week", "RAG", "A longer prompt without the documents", "Raise the temperature"], "correctIndex": 1, "explanation": "With RAG you just update the document index. Fine-tuning is better for changing style or behavior, not for injecting knowledge that changes often."}'::jsonb, 4, false),
  ('eeee0032-0000-0000-0000-000000000032', 'true_false', 'hard', 4, 'In RAG, bigger chunks always produce better answers.', '{"isTrue": false, "explanation": "Chunks that are too big make retrieval less precise and fill the context window; chunks that are too small lose context. The size needs testing."}'::jsonb, 5, false),
  ('eeee0032-0000-0000-0000-000000000032', 'quiz', 'hard', 4, 'Your RAG chatbot often quotes irrelevant passages. Name at least three things you''d check.', '{"answer": "Chunk size and chunking method, embedding model quality, the top-k value, whether a reranker is used, and whether the user''s query should be rewritten first.", "explanation": "This is a retrieval problem, not a generation problem — fix the search step before changing the prompt."}'::jsonb, 6, false),
  ('eeee0033-0000-0000-0000-000000000033', 'quiz', 'easy', 2, 'What is tool use (function calling)?', '{"answer": "The model''s ability to ask the app to run a specific function — like looking up data or sending an email — and then use the result to continue its answer."}'::jsonb, 1, true),
  ('eeee0033-0000-0000-0000-000000000033', 'clue', 'medium', 3, 'Which attack is this?', '{"clues": ["I hide in text the model reads.", "I can be in a web page, an email, or a document.", "I tell the model to ignore its original instructions."], "answer": "Prompt injection", "explanation": "The defense is layered: treat outside content as data, limit tool permissions, and require confirmation for risky actions."}'::jsonb, 2, true),
  ('eeee0033-0000-0000-0000-000000000033', 'ordering', 'medium', 3, 'Put one turn of an agent loop in order.', '{"items": ["The model receives the task and context", "The model decides to call a tool", "The app runs the tool and returns the result", "The model reads the result and decides the next step or answers"]}'::jsonb, 3, false),
  ('eeee0033-0000-0000-0000-000000000033', 'true_false', 'medium', 3, 'The best way to judge an LLM app''s quality is to try a few prompts by hand.', '{"isTrue": false, "explanation": "Manual testing helps early on, but you need an evaluation set: test cases with clear criteria, re-run every time the prompt or model changes."}'::jsonb, 4, false),
  ('eeee0033-0000-0000-0000-000000000033', 'multiple_choice', 'hard', 4, 'Your agent keeps calling the same tool over and over. What''s the most likely cause?', '{"options": ["The temperature is too low", "The tool''s result doesn''t give the model the information it needs to move on", "The context window is too big", "The model is too new"], "correctIndex": 1, "explanation": "Check what the tool returns: clear error messages and informative results help the model change strategy. Also cap the maximum number of steps."}'::jsonb, 5, false),
  ('eeee0033-0000-0000-0000-000000000033', 'quiz', 'hard', 5, 'You''re designing a support bot for thousands of users. Name three trade-offs you need to weigh.', '{"answer": "Quality vs. cost per conversation, latency vs. depth of reasoning, and automation vs. when to hand off to a human — plus user data security.", "explanation": "There''s no single answer; what matters is naming the trade-offs and how you''d measure them."}'::jsonb, 6, false);
