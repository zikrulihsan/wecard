import type {
  AnswerCardType,
  CardDetails,
  CardDifficulty,
  CardLevel,
  CardType,
  DeckTheme,
  GameCard,
} from "@flipcard/types";
import { difficultyForLevel } from "@/lib/cards/formats";
import type { Language } from "@/lib/i18n";

/**
 * Deck umum untuk dicoba tanpa akun.
 *
 * Sengaja ditulis statis di sini, bukan dibaca dari Supabase: pengunjung yang
 * belum login tidak boleh bergantung pada policy baca tabel, dan halaman coba
 * harus langsung jalan meski server sedang lambat. Isinya pendek (5–8 kartu)
 * — cukup untuk merasakan alurnya, bukan pengganti deck lengkap.
 */
export type TrialDeck = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  theme: DeckTheme;
  cards: GameCard[];
};

type TalkCard = [CardType, CardDifficulty, string];

/** Kartu kuis/mendengar: format, level bintang, isi, lalu isi khasnya. */
type QuizCard = [AnswerCardType, CardLevel, string, CardDetails];

type RawCard = TalkCard | QuizCard;

function toGameCard(raw: RawCard, slug: string, name: string, index: number): GameCard {
  const base = {
    id: `trial-${slug}-${index + 1}`,
    content: raw[2],
    cardType: raw[0],
    specialKind: null,
    sectionName: name,
    sectionSlug: slug,
  };
  if (typeof raw[1] === "number") {
    const quiz = raw as QuizCard;
    return {
      ...base,
      difficulty: difficultyForLevel(quiz[1]),
      level: quiz[1],
      details: quiz[3],
    };
  }
  return { ...base, difficulty: raw[1] };
}

function deck(
  slug: string,
  name: string,
  emoji: string,
  description: string,
  theme: DeckTheme,
  raw: RawCard[]
): TrialDeck {
  return {
    slug,
    name,
    emoji,
    description,
    theme,
    cards: raw.map((card, index) => toGameCard(card, slug, name, index)),
  };
}

const TRIAL_DECKS_ID: TrialDeck[] = [
  deck(
    "kenalan",
    "Kenalan Baru",
    "👋",
    "Pecah suasana sama orang yang baru ketemu — ringan, nggak kepo berlebihan.",
    "violet",
    [
      ["talk", "easy", "Kalau hari ini bisa diulang, bagian mana yang mau kamu ulang?"],
      ["talk", "easy", "Makanan apa yang selalu kamu pesan kalau bingung mau makan apa?"],
      ["talk", "easy", "Apa hal kecil yang bikin harimu langsung membaik?"],
      ["action", "easy", "Tunjukkan foto terakhir di galerimu yang boleh dilihat, lalu ceritakan konteksnya"],
      ["talk", "medium", "Apa hal yang orang sering salah kira tentang kamu?"],
      ["talk", "easy", "Kalau punya satu hari libur tambahan tiap minggu, mau dipakai buat apa?"],
      ["action", "easy", "Sebutkan 3 lagu yang lagi sering kamu putar"],
      ["talk", "medium", "Apa satu hal yang lagi kamu pelajari atau ingin kamu kuasai tahun ini?"],
    ]
  ),
  deck(
    "kuis-pengetahuan",
    "Kuis Pengetahuan",
    "🧠",
    "Uji wawasan bareng — jawab dulu, lalu balik kartu untuk lihat jawabannya.",
    "teal",
    [
      ["quiz", 1, "Planet apa yang paling dekat dengan Matahari?", {
        answer: "Merkurius",
        explanation: "Satu tahun di Merkurius hanya 88 hari Bumi.",
      }],
      ["true_false", 2, "Kelelawar itu buta.", {
        isTrue: false,
        explanation: "Kelelawar bisa melihat. Banyak jenisnya juga memakai ekolokasi — memantulkan suara — untuk berburu dalam gelap.",
      }],
      ["multiple_choice", 2, "Pulau terbesar di Indonesia adalah…", {
        options: ["Sumatra", "Kalimantan", "Papua", "Sulawesi"],
        correctIndex: 2,
        explanation: "Pulau Papua (Nugini) adalah pulau terbesar kedua di dunia setelah Greenland. Kalimantan ada di urutan ketiga dunia.",
      }],
      ["clue", 3, "Aku ini apa?", {
        clues: [
          "Aku bisa ditemukan di dapur dan di laut.",
          "Tanpa aku, masakan terasa hambar.",
          "Petani di pesisir memanenku dari air laut yang dijemur.",
        ],
        answer: "Garam",
      }],
      ["ordering", 3, "Urutkan proses hujan dari awal sampai akhir.", {
        items: [
          "Matahari memanaskan air laut",
          "Air menguap jadi uap air",
          "Uap air mendingin dan membentuk awan",
          "Titik air di awan makin berat lalu turun sebagai hujan",
        ],
      }],
      ["quiz", 4, "Kenapa langit terlihat biru di siang hari?", {
        answer: "Karena cahaya biru paling banyak dihamburkan udara.",
        explanation: "Cahaya matahari berisi semua warna. Gelombang biru yang pendek lebih mudah dipantulkan ke segala arah oleh molekul udara, jadi itulah yang paling banyak sampai ke mata kita.",
      }],
    ]
  ),
  deck(
    "latihan-mendengar",
    "Latihan Mendengar",
    "👂",
    "Satu orang membacakan, yang lain menyimak lalu menjawab. Level naik dari ⭐ sampai ⭐⭐⭐⭐⭐.",
    "sky",
    [
      ["listening", 1, "Budi makan apel merah.", {
        questions: [
          { question: "Siapa yang makan?", answer: "Budi" },
          { question: "Apa yang dimakan?", answer: "Apel merah" },
        ],
      }],
      ["listening", 2, "Pagi ini Sari menyiram bunga di halaman rumah.", {
        questions: [
          { question: "Kapan Sari menyiram bunga?", answer: "Pagi ini" },
          { question: "Di mana Sari menyiram bunga?", answer: "Di halaman rumah" },
          { question: "Apa yang dilakukan Sari?", answer: "Menyiram bunga" },
        ],
      }],
      ["listening", 3, "Dodi memakai sepatu biru, mengambil tas, lalu berjalan ke sekolah bersama dua temannya.", {
        questions: [
          { question: "Apa warna sepatu Dodi?", answer: "Biru" },
          { question: "Apa yang Dodi lakukan setelah memakai sepatu?", answer: "Mengambil tas" },
          { question: "Dodi berjalan bersama berapa teman?", answer: "Dua teman" },
        ],
      }],
      ["listening", 4, "Karena ban sepeda kempis, Rara memutuskan untuk naik bus, lalu pergi ke pusat kegiatan anak.", {
        questions: [
          { question: "Apa yang terjadi?", answer: "Ban sepeda Rara kempis" },
          { question: "Siapa yang membuat keputusan?", answer: "Rara" },
          { question: "Apa yang diputuskan Rara?", answer: "Naik bus" },
          { question: "Mengapa Rara melakukan itu?", answer: "Karena ban sepedanya kempis" },
        ],
      }],
      ["listening", 5, "Hujan turun deras sore itu. Nina menunggu di depan sekolah, tapi ayahnya belum datang. Bu Guru lalu meminjamkan payung dan menemani Nina sampai ayahnya tiba. Nina tersenyum dan berterima kasih.", {
        questions: [
          { question: "Kenapa Nina harus menunggu?", answer: "Ayahnya belum datang menjemput" },
          { question: "Apa yang dilakukan Bu Guru?", answer: "Meminjamkan payung dan menemani Nina" },
          { question: "Bagaimana perasaan Nina di akhir cerita? Dari mana kamu tahu?", answer: "Senang/lega — Nina tersenyum dan berterima kasih" },
        ],
        explanation: "Pertanyaan terakhir jawabannya tersirat: tidak disebut langsung, harus disimpulkan dari tindakan Nina.",
      }],
    ]
  ),
  deck(
    "sahabat",
    "Sahabat",
    "🤝",
    "Buat tongkrongan yang udah akrab tapi ngobrolnya itu-itu aja.",
    "amber",
    [
      ["talk", "easy", "Momen paling memalukan yang pernah kita alami bareng?"],
      ["talk", "easy", "Kalau persahabatan kita jadi film, judulnya apa?"],
      ["action", "easy", "Tiru gaya ngomong salah satu orang di sini sampai yang lain bisa nebak"],
      ["talk", "medium", "Kapan terakhir kali kamu merasa benar-benar ditolong sama teman?"],
      ["talk", "medium", "Apa yang berubah dari dirimu sejak kita pertama kenal?"],
      ["action", "easy", "Kasih julukan baru ke orang di sebelah kananmu, lengkap dengan alasannya"],
      ["talk", "hard", "Ada hal yang sebenarnya ingin kamu ceritakan tapi belum sempat?"],
      ["talk", "medium", "Apa satu hal dari sahabatmu yang diam-diam kamu tiru?"],
    ]
  ),
  deck(
    "keluarga",
    "Keluarga",
    "🏡",
    "Obrolan di meja makan yang lebih dari sekadar \"gimana sekolah/kerjaan?\"",
    "emerald",
    [
      ["talk", "easy", "Masakan rumah apa yang paling bikin kangen kalau lagi jauh?"],
      ["talk", "easy", "Liburan keluarga mana yang paling berkesan buatmu?"],
      ["action", "easy", "Ceritakan kebiasaan unik salah satu anggota keluarga — yang lain tebak siapa"],
      ["talk", "medium", "Nilai apa dari keluarga ini yang ingin kamu teruskan?"],
      ["talk", "medium", "Kapan kamu merasa paling bangga jadi bagian keluarga ini?"],
      ["action", "easy", "Ucapkan terima kasih untuk satu hal spesifik ke orang di sebelahmu"],
      ["talk", "medium", "Cerita keluarga apa yang menurutmu wajib diwariskan ke generasi berikutnya?"],
      ["talk", "hard", "Ada hal yang ingin kamu dengar lebih sering dari keluarga ini?"],
    ]
  ),
  deck(
    "pasangan",
    "Pasangan",
    "💞",
    "Buat date night atau ngobrol santai sebelum tidur.",
    "pink",
    [
      ["talk", "easy", "Apa hal paling menyenangkan hari ini?"],
      ["talk", "easy", "Apa kebiasaan kecil aku yang kamu suka?"],
      ["action", "easy", "Ceritakan 1 hal lucu hari ini dengan gaya lebay 😄"],
      ["talk", "medium", "Hal apa dari aku yang bikin kamu merasa dicintai?"],
      ["action", "easy", "Ucapkan \"terima kasih\" untuk 3 hal ke pasanganmu"],
      ["talk", "medium", "Apa arti \"rumah\" buat kamu?"],
      ["talk", "medium", "Momen paling romantis kita menurut kamu?"],
      ["talk", "medium", "Apa harapan kamu untuk hubungan ini?"],
    ]
  ),
  deck(
    "rekan-kerja",
    "Rekan Kerja",
    "💼",
    "Ice breaker buat tim — aman dibawa ke rapat atau makan siang bareng.",
    "indigo",
    [
      ["talk", "easy", "Pekerjaan pertama yang pernah kamu jalani apa?"],
      ["talk", "easy", "Kalau nggak kerja di bidang ini, kamu mungkin jadi apa?"],
      ["action", "easy", "Jelaskan pekerjaanmu dalam 10 kata ke anak umur 7 tahun"],
      ["talk", "medium", "Apa satu hal yang bikin kamu semangat kerja minggu ini?"],
      ["talk", "medium", "Siapa orang yang paling banyak mengajarimu soal kerja?"],
      ["action", "easy", "Sebutkan satu bantuan rekan di sini yang belum sempat kamu apresiasi"],
      ["talk", "medium", "Cara kerja seperti apa yang bikin kamu paling produktif?"],
      ["talk", "easy", "Kebiasaan kecil apa yang bikin harimu di kantor lebih enak?"],
    ]
  ),
];

/**
 * Versi Inggris deck coba. Slug-nya sama dengan versi Indonesia, jadi jatah
 * coba yang sudah terpakai tetap terhitung saat bahasa aplikasi diganti, dan
 * urutan deck-nya pun sama.
 */
const TRIAL_DECKS_EN: TrialDeck[] = [
  deck(
    "kenalan",
    "New Acquaintances",
    "👋",
    "Break the ice with people you just met — light, never too nosy.",
    "violet",
    [
      ["talk", "easy", "If you could replay one part of today, which part would it be?"],
      ["talk", "easy", "What do you always order when you can't decide what to eat?"],
      ["talk", "easy", "What's a small thing that instantly makes your day better?"],
      ["action", "easy", "Show the most recent photo in your gallery that's okay to share, then explain the story behind it"],
      ["talk", "medium", "What's something people often get wrong about you?"],
      ["talk", "easy", "If you got one extra day off every week, what would you do with it?"],
      ["action", "easy", "Name 3 songs you've been playing a lot lately"],
      ["talk", "medium", "What's one thing you're learning or want to master this year?"],
    ]
  ),
  deck(
    "kuis-pengetahuan",
    "Trivia Quiz",
    "🧠",
    "Test what you know together — answer first, then flip the card to see the answer.",
    "teal",
    [
      ["quiz", 1, "Which planet is closest to the Sun?", {
        answer: "Mercury",
        explanation: "A year on Mercury lasts only 88 Earth days.",
      }],
      ["true_false", 2, "Bats are blind.", {
        isTrue: false,
        explanation: "Bats can see. Many species also use echolocation — bouncing sound off things — to hunt in the dark.",
      }],
      ["multiple_choice", 2, "The largest island in Indonesia is…", {
        options: ["Sumatra", "Borneo", "New Guinea", "Sulawesi"],
        correctIndex: 2,
        explanation: "New Guinea (home to Indonesia's Papua) is the second-largest island in the world after Greenland. Borneo is third.",
      }],
      ["clue", 3, "What am I?", {
        clues: [
          "You can find me in the kitchen and in the sea.",
          "Without me, food tastes bland.",
          "Coastal farmers harvest me from seawater dried in the sun.",
        ],
        answer: "Salt",
      }],
      ["ordering", 3, "Put the steps of rain in order, from start to finish.", {
        items: [
          "The Sun heats the seawater",
          "The water evaporates into water vapor",
          "The vapor cools and forms clouds",
          "Droplets in the clouds get heavier and fall as rain",
        ],
      }],
      ["quiz", 4, "Why does the sky look blue during the day?", {
        answer: "Because air scatters blue light the most.",
        explanation: "Sunlight contains every color. Blue light's short wavelengths are scattered in all directions by air molecules more easily, so that's the color that reaches our eyes most.",
      }],
    ]
  ),
  deck(
    "latihan-mendengar",
    "Listening Practice",
    "👂",
    "One person reads aloud, the others listen and answer. Levels go from ⭐ to ⭐⭐⭐⭐⭐.",
    "sky",
    [
      ["listening", 1, "Ben is eating a red apple.", {
        questions: [
          { question: "Who is eating?", answer: "Ben" },
          { question: "What is he eating?", answer: "A red apple" },
        ],
      }],
      ["listening", 2, "This morning Sarah watered the flowers in the front yard.", {
        questions: [
          { question: "When did Sarah water the flowers?", answer: "This morning" },
          { question: "Where did Sarah water the flowers?", answer: "In the front yard" },
          { question: "What did Sarah do?", answer: "She watered the flowers" },
        ],
      }],
      ["listening", 3, "Danny put on his blue shoes, picked up his bag, and then walked to school with two of his friends.", {
        questions: [
          { question: "What color were Danny's shoes?", answer: "Blue" },
          { question: "What did Danny do after putting on his shoes?", answer: "He picked up his bag" },
          { question: "How many friends did Danny walk with?", answer: "Two friends" },
        ],
      }],
      ["listening", 4, "Because her bike tire was flat, Rachel decided to take the bus, and then went to the kids' activity center.", {
        questions: [
          { question: "What happened?", answer: "Rachel's bike tire was flat" },
          { question: "Who made the decision?", answer: "Rachel" },
          { question: "What did Rachel decide?", answer: "To take the bus" },
          { question: "Why did Rachel do that?", answer: "Because her bike tire was flat" },
        ],
      }],
      ["listening", 5, "It rained hard that afternoon. Nina waited in front of the school, but her father hadn't arrived yet. Her teacher lent her an umbrella and stayed with Nina until her father came. Nina smiled and said thank you.", {
        questions: [
          { question: "Why did Nina have to wait?", answer: "Her father hadn't come to pick her up yet" },
          { question: "What did the teacher do?", answer: "Lent her an umbrella and stayed with Nina" },
          { question: "How did Nina feel at the end of the story? How do you know?", answer: "Happy/relieved — Nina smiled and said thank you" },
        ],
        explanation: "The last answer is implied: it isn't said directly, so you have to infer it from what Nina does.",
      }],
    ]
  ),
  deck(
    "sahabat",
    "Best Friends",
    "🤝",
    "For the close crew whose conversations keep going in circles.",
    "amber",
    [
      ["talk", "easy", "What's the most embarrassing moment we've been through together?"],
      ["talk", "easy", "If our friendship were a movie, what would it be called?"],
      ["action", "easy", "Imitate how someone here talks until the others can guess who it is"],
      ["talk", "medium", "When was the last time a friend really came through for you?"],
      ["talk", "medium", "What's changed about you since we first met?"],
      ["action", "easy", "Give the person on your right a new nickname, and explain why"],
      ["talk", "hard", "Is there something you've wanted to tell us but haven't had the chance?"],
      ["talk", "medium", "What's one thing about your best friend that you secretly copy?"],
    ]
  ),
  deck(
    "keluarga",
    "Family",
    "🏡",
    "Dinner-table talk that goes beyond \"how was school/work?\"",
    "emerald",
    [
      ["talk", "easy", "Which home-cooked dish do you miss most when you're away?"],
      ["talk", "easy", "Which family vacation stuck with you the most?"],
      ["action", "easy", "Describe a quirky habit of someone in the family — everyone else guesses who"],
      ["talk", "medium", "What value from this family do you want to carry on?"],
      ["talk", "medium", "When have you felt proudest to be part of this family?"],
      ["action", "easy", "Thank the person next to you for one specific thing"],
      ["talk", "medium", "Which family story do you think must be passed on to the next generation?"],
      ["talk", "hard", "Is there something you'd like to hear more often from this family?"],
    ]
  ),
  deck(
    "pasangan",
    "Couples",
    "💞",
    "For date night or a cozy chat before bed.",
    "pink",
    [
      ["talk", "easy", "What was the best part of today?"],
      ["talk", "easy", "What's one little habit of mine that you love?"],
      ["action", "easy", "Tell one funny thing from today in the most dramatic way possible 😄"],
      ["talk", "medium", "What do I do that makes you feel loved?"],
      ["action", "easy", "Say \"thank you\" to your partner for 3 things"],
      ["talk", "medium", "What does \"home\" mean to you?"],
      ["talk", "medium", "What's our most romantic moment, in your opinion?"],
      ["talk", "medium", "What are your hopes for our relationship?"],
    ]
  ),
  deck(
    "rekan-kerja",
    "Coworkers",
    "💼",
    "Icebreakers for teams — safe for a meeting or a lunch together.",
    "indigo",
    [
      ["talk", "easy", "What was the very first job you ever had?"],
      ["talk", "easy", "If you didn't work in this field, what might you be doing?"],
      ["action", "easy", "Explain your job in 10 words to a 7-year-old"],
      ["talk", "medium", "What's one thing that got you excited about work this week?"],
      ["talk", "medium", "Who has taught you the most about work?"],
      ["action", "easy", "Name one thing a colleague here helped you with that you haven't thanked them for yet"],
      ["talk", "medium", "What way of working makes you most productive?"],
      ["talk", "easy", "What small habit makes your day at the office better?"],
    ]
  ),
];

const TRIAL_DECKS: Record<Language, TrialDeck[]> = {
  id: TRIAL_DECKS_ID,
  en: TRIAL_DECKS_EN,
};

export function trialDecks(language: Language): TrialDeck[] {
  return TRIAL_DECKS[language];
}

export function findTrialDeck(
  slug: string | undefined,
  language: Language
): TrialDeck | undefined {
  return TRIAL_DECKS[language].find((item) => item.slug === slug);
}
