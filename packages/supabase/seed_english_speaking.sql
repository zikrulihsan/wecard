-- ============================================================
-- SEED: seri premium pertama — English Speaking Practice
--   Vol. 1  Everyday English         (pemula)
--   Vol. 2  Stories & Opinions       (menengah)
--   Vol. 3  Speak with Confidence    (menengah atas)
--
-- 3 section × 8 kartu per volume. Kartu talk = prompt bicara,
-- kartu action = role-play/latihan. "💡 Try:" memberi pola kalimat
-- yang dilatih. 4 kartu per volume jadi preview gratis.
--
-- Harga: Rp 10.000 per volume, Rp 35.000 per seri (semua volume,
-- termasuk volume berikutnya).
--
-- WAJIB jalankan migration 00001–00011 lebih dulu.
-- Dibuat dari skrip; aman dijalankan ulang (ON CONFLICT DO NOTHING).
-- ============================================================

INSERT INTO series (id, slug, name, description, theme, language, price_idr, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'english-speaking-practice', 'English Speaking Practice', 'Speaking practice cards for learners of English — prompts, role-plays, and sentence patterns from everyday talk to confident discussion. Play with a partner, a class, or your tutor.', 'sky', 'en', 35000, 1)
ON CONFLICT (id) DO NOTHING;


-- Vol. 1
INSERT INTO categories (id, slug, name, description, is_free, price_idr, sort_order, theme, mode, language, series_id, volume) VALUES
  ('a1000000-0000-0000-0000-000000000011', 'english-speaking-vol-1', 'English Speaking Practice · Vol. 1: Everyday English', 'Beginner to pre-intermediate. Talk about yourself, your day, and everyday places — in simple, natural English.', false, 10000, 21, 'sky', 'ngobrol', 'en', 'a1000000-0000-0000-0000-000000000001', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('a1000000-0000-0000-0001-000000000001', 'a1000000-0000-0000-0000-000000000011', 'about-me', 'About Me', 'Introduce yourself and talk about what you like.', '👋', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('a1000000-0001-0001-0000-000000000001', 'a1000000-0000-0000-0001-000000000001', 'talk', 'easy', 'Introduce yourself in 30 seconds: your name, where you live, and one thing you do every weekend. 💡 Try: "I usually…", "On weekends, I…"', 1, true),
  ('a1000000-0001-0001-0000-000000000002', 'a1000000-0000-0000-0001-000000000001', 'talk', 'easy', 'What is your favorite food? Describe how it looks, smells, and tastes. 💡 Try: "It tastes…", "It smells like…"', 2, true),
  ('a1000000-0001-0001-0000-000000000003', 'a1000000-0000-0000-0001-000000000001', 'talk', 'easy', 'Describe a person in your family. What do they look like, and what are they like? 💡 Try: "She has…", "He is very…"', 3, false),
  ('a1000000-0001-0001-0000-000000000004', 'a1000000-0000-0000-0001-000000000001', 'talk', 'easy', 'What is one hobby you enjoy? When did you start, and why do you like it? 💡 Try: "I started… when I was…"', 4, false),
  ('a1000000-0001-0001-0000-000000000005', 'a1000000-0000-0000-0001-000000000001', 'talk', 'easy', 'Talk about your favorite place in your house and what you do there. 💡 Try: "My favorite place is… because…"', 5, false),
  ('a1000000-0001-0001-0000-000000000006', 'a1000000-0000-0000-0001-000000000001', 'action', 'easy', 'Your partner says three words about themselves. Make a question for each word and ask them. 💡 Try: "Why do you…?", "How often…?"', 6, false),
  ('a1000000-0001-0001-0000-000000000007', 'a1000000-0000-0000-0001-000000000001', 'talk', 'easy', 'What are you good at, and what do you want to get better at? 💡 Try: "I am good at…", "I want to improve my…"', 7, false),
  ('a1000000-0001-0001-0000-000000000008', 'a1000000-0000-0000-0001-000000000001', 'action', 'easy', 'Describe your partner in three sentences without saying their name. Everyone else guesses who it is.', 8, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('a1000000-0000-0000-0001-000000000002', 'a1000000-0000-0000-0000-000000000011', 'daily-life', 'Daily Life', 'Routines, habits, and the things you do every day.', '🏠', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('a1000000-0001-0002-0000-000000000001', 'a1000000-0000-0000-0001-000000000002', 'talk', 'easy', 'Describe your morning from waking up to leaving home. 💡 Try: "First…, then…, after that…, finally…"', 1, true),
  ('a1000000-0001-0002-0000-000000000002', 'a1000000-0000-0000-0001-000000000002', 'talk', 'easy', 'What did you do yesterday? Tell it in order using the past tense. 💡 Try: "Yesterday I went…, then I…"', 2, false),
  ('a1000000-0001-0002-0000-000000000003', 'a1000000-0000-0000-0001-000000000002', 'talk', 'easy', 'How do you usually get to school or work? How long does it take? 💡 Try: "It takes about… minutes by…"', 3, false),
  ('a1000000-0001-0002-0000-000000000004', 'a1000000-0000-0000-0001-000000000002', 'talk', 'easy', 'What do you usually eat for breakfast, lunch, and dinner? 💡 Try: "For breakfast, I usually have…"', 4, false),
  ('a1000000-0001-0002-0000-000000000005', 'a1000000-0000-0000-0001-000000000002', 'talk', 'easy', 'Which chore at home do you like the most, and which one the least? Why? 💡 Try: "I don''t mind…", "I can''t stand…"', 5, false),
  ('a1000000-0001-0002-0000-000000000006', 'a1000000-0000-0000-0001-000000000002', 'action', 'easy', 'Mime one daily activity for 15 seconds. The others describe what you are doing using "You are… -ing".', 6, false),
  ('a1000000-0001-0002-0000-000000000007', 'a1000000-0000-0000-0001-000000000002', 'talk', 'easy', 'What does a perfect weekend look like for you? 💡 Try: "On a perfect Saturday, I would…"', 7, false),
  ('a1000000-0001-0002-0000-000000000008', 'a1000000-0000-0000-0001-000000000002', 'talk', 'easy', 'How do you get ready for a busy day? Give three tips. 💡 Try: "You should…", "It helps to…"', 8, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('a1000000-0000-0000-0001-000000000003', 'a1000000-0000-0000-0000-000000000011', 'out-and-about', 'Out and About', 'Shopping, directions, and everyday places.', '🛒', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('a1000000-0001-0003-0000-000000000001', 'a1000000-0000-0000-0001-000000000003', 'action', 'easy', 'Role-play: you are buying fruit at a market. Your partner is the seller. Ask the price, bargain politely, and pay. 💡 Try: "How much is…?", "Could you make it…?"', 1, true),
  ('a1000000-0001-0003-0000-000000000002', 'a1000000-0000-0000-0001-000000000003', 'action', 'easy', 'Role-play: a tourist asks you how to get to the nearest mosque. Give clear directions. 💡 Try: "Go straight…", "Turn left at…"', 2, false),
  ('a1000000-0001-0003-0000-000000000003', 'a1000000-0000-0000-0001-000000000003', 'talk', 'easy', 'Describe the street where you live. What can you see, hear, and buy there? 💡 Try: "There is…", "There are…"', 3, false),
  ('a1000000-0001-0003-0000-000000000004', 'a1000000-0000-0000-0001-000000000003', 'action', 'easy', 'Role-play: order food at a restaurant and make one special request. Your partner is the waiter. 💡 Try: "Could I have…, please?", "Without…, please."', 4, false),
  ('a1000000-0001-0003-0000-000000000005', 'a1000000-0000-0000-0001-000000000003', 'talk', 'easy', 'What is your favorite shop or market? What do you usually buy there? 💡 Try: "I usually buy…"', 5, false),
  ('a1000000-0001-0003-0000-000000000006', 'a1000000-0000-0000-0001-000000000003', 'action', 'easy', 'Role-play: call a clinic to make an appointment. Say your name, your problem, and the time you want. 💡 Try: "I''d like to make an appointment…"', 6, false),
  ('a1000000-0001-0003-0000-000000000007', 'a1000000-0000-0000-0001-000000000003', 'talk', 'easy', 'Describe a trip you took to another city. How did you get there, and what did you see? 💡 Try: "We went by…", "We visited…"', 7, false),
  ('a1000000-0001-0003-0000-000000000008', 'a1000000-0000-0000-0001-000000000003', 'action', 'easy', 'Role-play: you bought a shirt that is too small. Ask the shop assistant to exchange it. 💡 Try: "I''m afraid…", "Is it possible to…?"', 8, false)
ON CONFLICT (id) DO NOTHING;

-- Vol. 2
INSERT INTO categories (id, slug, name, description, is_free, price_idr, sort_order, theme, mode, language, series_id, volume) VALUES
  ('a1000000-0000-0000-0000-000000000012', 'english-speaking-vol-2', 'English Speaking Practice · Vol. 2: Stories & Opinions', 'Intermediate. Tell stories with detail, give your opinion, and compare ideas with good reasons.', false, 10000, 22, 'indigo', 'ngobrol', 'en', 'a1000000-0000-0000-0000-000000000001', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('a1000000-0000-0000-0002-000000000001', 'a1000000-0000-0000-0000-000000000012', 'tell-a-story', 'Tell a Story', 'Past tenses, sequence, and detail.', '📖', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('a1000000-0002-0001-0000-000000000001', 'a1000000-0000-0000-0002-000000000001', 'talk', 'medium', 'Tell a story about a time you got lost. What happened, and how did you find your way? 💡 Try: "At first…", "Suddenly…", "In the end…"', 1, true),
  ('a1000000-0002-0001-0000-000000000002', 'a1000000-0000-0000-0002-000000000001', 'talk', 'medium', 'Describe the best day of your last holiday from morning to night. 💡 Try: "We had just… when…"', 2, true),
  ('a1000000-0002-0001-0000-000000000003', 'a1000000-0000-0000-0002-000000000001', 'talk', 'medium', 'Tell us about a time you helped someone. How did they feel, and how did you feel? 💡 Try: "I noticed that…, so I…"', 3, false),
  ('a1000000-0002-0001-0000-000000000004', 'a1000000-0000-0000-0002-000000000001', 'talk', 'medium', 'What is a mistake you learned something from? Tell the story and the lesson. 💡 Try: "If I had…, I would have…"', 4, false),
  ('a1000000-0002-0001-0000-000000000005', 'a1000000-0000-0000-0002-000000000001', 'action', 'medium', 'Tell a one-minute story that includes these three words: umbrella, train, grandmother.', 5, false),
  ('a1000000-0002-0001-0000-000000000006', 'a1000000-0000-0000-0002-000000000001', 'talk', 'medium', 'Describe a moment when you felt really proud of yourself. 💡 Try: "I had been working on… for…"', 6, false),
  ('a1000000-0002-0001-0000-000000000007', 'a1000000-0000-0000-0002-000000000001', 'action', 'medium', 'Start a story with one sentence. Each player adds one sentence. Keep going for three rounds and finish it together.', 7, false),
  ('a1000000-0002-0001-0000-000000000008', 'a1000000-0000-0000-0002-000000000001', 'talk', 'medium', 'Tell us about a teacher who influenced you. What did they do differently? 💡 Try: "What I remember most is…"', 8, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('a1000000-0000-0000-0002-000000000002', 'a1000000-0000-0000-0000-000000000012', 'what-do-you-think', 'What Do You Think?', 'Give an opinion and support it with reasons.', '💭', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('a1000000-0002-0002-0000-000000000001', 'a1000000-0000-0000-0002-000000000002', 'talk', 'medium', 'Should students wear uniforms? Give your opinion and two reasons. 💡 Try: "In my opinion…", "Firstly…, secondly…"', 1, true),
  ('a1000000-0002-0002-0000-000000000002', 'a1000000-0000-0000-0002-000000000002', 'talk', 'medium', 'Is it better to read books on paper or on a screen? Why? 💡 Try: "I prefer…, mainly because…"', 2, false),
  ('a1000000-0002-0002-0000-000000000003', 'a1000000-0000-0000-0002-000000000002', 'talk', 'medium', 'Should children have their own phone before age twelve? 💡 Try: "On the one hand…, on the other hand…"', 3, false),
  ('a1000000-0002-0002-0000-000000000004', 'a1000000-0000-0000-0002-000000000002', 'talk', 'medium', 'What is the most useful skill that schools do not teach? 💡 Try: "I believe… should be taught because…"', 4, false),
  ('a1000000-0002-0002-0000-000000000005', 'a1000000-0000-0000-0002-000000000002', 'action', 'medium', 'Your partner gives an opinion on any topic. Agree or disagree politely and add one new reason. 💡 Try: "I see your point, but…"', 5, false),
  ('a1000000-0002-0002-0000-000000000006', 'a1000000-0000-0000-0002-000000000002', 'talk', 'medium', 'Is it more important to be smart or to be kind? Explain. 💡 Try: "It depends on…", "For me, … matters more because…"', 6, false),
  ('a1000000-0002-0002-0000-000000000007', 'a1000000-0000-0000-0002-000000000002', 'talk', 'medium', 'Should people work from home or at the office? 💡 Try: "The main advantage is…", "The biggest drawback is…"', 7, false),
  ('a1000000-0002-0002-0000-000000000008', 'a1000000-0000-0000-0002-000000000002', 'action', 'medium', 'Give a 30-second opinion on "The best age to learn English". Use at least two linking words: however, therefore, moreover.', 8, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('a1000000-0000-0000-0002-000000000003', 'a1000000-0000-0000-0000-000000000012', 'compare-and-choose', 'Compare & Choose', 'Comparatives, preferences, and decisions.', '⚖️', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('a1000000-0002-0003-0000-000000000001', 'a1000000-0000-0000-0002-000000000003', 'talk', 'medium', 'City life or village life? Compare them and choose one. 💡 Try: "… is more… than…", "… is not as… as…"', 1, true),
  ('a1000000-0002-0003-0000-000000000002', 'a1000000-0000-0000-0002-000000000003', 'talk', 'medium', 'Compare traveling by plane and by train. Which do you prefer for a long trip? 💡 Try: "Although…, I would rather…"', 2, false),
  ('a1000000-0002-0003-0000-000000000003', 'a1000000-0000-0000-0002-000000000003', 'talk', 'medium', 'Cooking at home or eating out — which is better for a family? 💡 Try: "It''s cheaper/healthier to…"', 3, false),
  ('a1000000-0002-0003-0000-000000000004', 'a1000000-0000-0000-0002-000000000003', 'action', 'medium', 'Your group has Rp500,000 for a class event. Discuss three options and agree on one. 💡 Try: "What about…?", "Let''s go with…"', 4, false),
  ('a1000000-0002-0003-0000-000000000005', 'a1000000-0000-0000-0002-000000000003', 'talk', 'medium', 'Compare how your grandparents lived with how you live now. 💡 Try: "Back then…, whereas nowadays…"', 5, false),
  ('a1000000-0002-0003-0000-000000000006', 'a1000000-0000-0000-0002-000000000003', 'talk', 'medium', 'Studying alone or in a group — which works better for you? 💡 Try: "I find it easier to… when…"', 6, false),
  ('a1000000-0002-0003-0000-000000000007', 'a1000000-0000-0000-0002-000000000003', 'action', 'medium', 'Choose the better gift for a 10-year-old: a book or a board game. Each player argues for one for 30 seconds.', 7, false),
  ('a1000000-0002-0003-0000-000000000008', 'a1000000-0000-0000-0002-000000000003', 'talk', 'medium', 'Morning person or night person? Compare the two and explain which one you are. 💡 Try: "I tend to…"', 8, false)
ON CONFLICT (id) DO NOTHING;

-- Vol. 3
INSERT INTO categories (id, slug, name, description, is_free, price_idr, sort_order, theme, mode, language, series_id, volume) VALUES
  ('a1000000-0000-0000-0000-000000000013', 'english-speaking-vol-3', 'English Speaking Practice · Vol. 3: Speak with Confidence', 'Upper-intermediate. Explain clearly, persuade, and handle real-life conversations at work and in public.', false, 10000, 23, 'violet', 'ngobrol', 'en', 'a1000000-0000-0000-0000-000000000001', 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('a1000000-0000-0000-0003-000000000001', 'a1000000-0000-0000-0000-000000000013', 'explain-it-simply', 'Explain It Simply', 'Explain processes and ideas clearly.', '🧠', 1) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('a1000000-0003-0001-0000-000000000001', 'a1000000-0000-0000-0003-000000000001', 'talk', 'hard', 'Explain how to cook rice to someone who has never done it. 💡 Try: "The first thing you need to do is…", "Make sure you…"', 1, true),
  ('a1000000-0003-0001-0000-000000000002', 'a1000000-0000-0000-0003-000000000001', 'talk', 'hard', 'Explain how the internet reaches your phone, in simple words. 💡 Try: "Basically…", "In other words…"', 2, true),
  ('a1000000-0003-0001-0000-000000000003', 'a1000000-0000-0000-0003-000000000001', 'talk', 'hard', 'Explain the rules of a game you know to someone who has never played it. 💡 Try: "The goal of the game is…"', 3, false),
  ('a1000000-0003-0001-0000-000000000004', 'a1000000-0000-0000-0003-000000000001', 'action', 'hard', 'Explain a hard word (e.g. "inflation" or "photosynthesis") without using the word itself. Others guess it.', 4, false),
  ('a1000000-0003-0001-0000-000000000005', 'a1000000-0000-0000-0003-000000000001', 'talk', 'hard', 'Explain why it rains, as if you are talking to a seven-year-old. 💡 Try: "Imagine…", "It''s a bit like…"', 5, false),
  ('a1000000-0003-0001-0000-000000000006', 'a1000000-0000-0000-0003-000000000001', 'talk', 'hard', 'Give a short tutorial: how to send money safely with a mobile app. 💡 Try: "Before you…, always…"', 6, false),
  ('a1000000-0003-0001-0000-000000000007', 'a1000000-0000-0000-0003-000000000001', 'action', 'hard', 'In 60 seconds, explain your job or your school subjects to a visitor from another country.', 7, false),
  ('a1000000-0003-0001-0000-000000000008', 'a1000000-0000-0000-0003-000000000001', 'talk', 'hard', 'Explain one tradition from your region: what happens, and why it matters. 💡 Try: "It is held every…", "It symbolizes…"', 8, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('a1000000-0000-0000-0003-000000000002', 'a1000000-0000-0000-0000-000000000013', 'persuade-me', 'Persuade Me', 'Make a case, handle objections, close.', '🎤', 2) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('a1000000-0003-0002-0000-000000000001', 'a1000000-0000-0000-0003-000000000002', 'action', 'hard', 'Persuade your partner to start a morning walk habit. They must give two objections; answer both. 💡 Try: "I understand, but…"', 1, true),
  ('a1000000-0003-0002-0000-000000000002', 'a1000000-0000-0000-0003-000000000002', 'action', 'hard', 'Sell an ordinary object near you (a pen, a cup) in 45 seconds. Make it sound essential.', 2, false),
  ('a1000000-0003-0002-0000-000000000003', 'a1000000-0000-0000-0003-000000000002', 'talk', 'hard', 'Convince your community to plant more trees in your neighborhood. 💡 Try: "Imagine if…", "Not only…, but also…"', 3, false),
  ('a1000000-0003-0002-0000-000000000004', 'a1000000-0000-0000-0003-000000000002', 'action', 'hard', 'Ask your manager for one extra day off. Your partner is the manager and is not convinced at first.', 4, false),
  ('a1000000-0003-0002-0000-000000000005', 'a1000000-0000-0000-0003-000000000002', 'talk', 'hard', 'Persuade a friend to learn a new language this year. Use one personal example. 💡 Try: "Speaking from experience…"', 5, false),
  ('a1000000-0003-0002-0000-000000000006', 'a1000000-0000-0000-0003-000000000002', 'action', 'hard', 'Two players debate: "Homework should be banned." One for, one against. One minute each, then a 30-second reply.', 6, false),
  ('a1000000-0003-0002-0000-000000000007', 'a1000000-0000-0000-0003-000000000002', 'talk', 'hard', 'Convince your family to spend one evening a week without screens. 💡 Try: "What if we tried…?", "Just think about…"', 7, false),
  ('a1000000-0003-0002-0000-000000000008', 'a1000000-0000-0000-0003-000000000002', 'action', 'hard', 'Pitch a small business idea in 60 seconds: the problem, your solution, and why people will pay.', 8, false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO sections (id, category_id, slug, name, description, icon, sort_order) VALUES ('a1000000-0000-0000-0003-000000000003', 'a1000000-0000-0000-0000-000000000013', 'real-world', 'Real-World Conversations', 'Work, service, and polite problem-solving.', '💼', 3) ON CONFLICT (id) DO NOTHING;
INSERT INTO cards (id, section_id, card_type, difficulty, content_text, sort_order, is_free_preview) VALUES
  ('a1000000-0003-0003-0000-000000000001', 'a1000000-0000-0000-0003-000000000003', 'action', 'hard', 'Role-play: a job interview. Answer "Tell me about yourself" and "What is your biggest strength?" 💡 Try: "One example is when…"', 1, true),
  ('a1000000-0003-0003-0000-000000000002', 'a1000000-0000-0000-0003-000000000003', 'action', 'hard', 'Role-play: your order arrived late and damaged. Complain politely to customer service and ask for a solution.', 2, false),
  ('a1000000-0003-0003-0000-000000000003', 'a1000000-0000-0000-0003-000000000003', 'action', 'hard', 'Role-play: introduce yourself to a new colleague and find two things you have in common.', 3, false),
  ('a1000000-0003-0003-0000-000000000004', 'a1000000-0000-0000-0003-000000000003', 'talk', 'hard', 'Describe a problem at school or work and three possible solutions. Which one is best? 💡 Try: "One option would be…"', 4, false),
  ('a1000000-0003-0003-0000-000000000005', 'a1000000-0000-0000-0003-000000000003', 'action', 'hard', 'Role-play: your flight is cancelled. Talk to the airline staff and get a new flight for today.', 5, false),
  ('a1000000-0003-0003-0000-000000000006', 'a1000000-0000-0000-0003-000000000003', 'action', 'hard', 'Give a one-minute toast to thank a teacher or mentor at a farewell event.', 6, false),
  ('a1000000-0003-0003-0000-000000000007', 'a1000000-0000-0000-0003-000000000003', 'action', 'hard', 'Role-play: you must say "no" to a request from a friend without hurting their feelings. 💡 Try: "I''d love to, but…"', 7, false),
  ('a1000000-0003-0003-0000-000000000008', 'a1000000-0000-0000-0003-000000000003', 'talk', 'hard', 'Present your plans for the next five years in one minute, clearly and confidently. 💡 Try: "In the short term…, in the long term…"', 8, false)
ON CONFLICT (id) DO NOTHING;
