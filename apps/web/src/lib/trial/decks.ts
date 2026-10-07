import type {
  AnswerCardType,
  CardDetails,
  CardDifficulty,
  CardLevel,
  CardType,
  DeckMode,
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
 * harus langsung jalan meski server sedang lambat. Isinya pendek (5–8 kartu).
 * Tamu memainkan beberapa kartu pertama (`TRIAL_FREE_CARDS`), jadi urutan di
 * sini adalah urutan main: taruh kartu yang paling menggambarkan deck di depan.
 * Tiap jenis deck (`mode`) sebaiknya punya paling tidak satu deck coba.
 */
export type TrialDeck = {
  slug: string;
  /** Jenis deck — halaman coba memisahkan deck per jenis. */
  mode: DeckMode;
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
  mode: DeckMode,
  name: string,
  emoji: string,
  description: string,
  theme: DeckTheme,
  raw: RawCard[]
): TrialDeck {
  return {
    slug,
    mode,
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
    "ngobrol",
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
    "kuis",
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
    "mendengar",
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
    "ngobrol",
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
    "ngobrol",
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
    "ngobrol",
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
    "ngobrol",
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
  deck(
    "tantangan-tongkrongan",
    "tantangan",
    "Tantangan Tongkrongan",
    "🔥",
    "Langsung dikerjakan, bukan dijawab — biar nongkrong nggak cuma scroll HP.",
    "amber",
    [
      ["action", "easy", "Tirukan suara hewan favoritmu sampai ada yang bisa menebak"],
      ["action", "easy", "Ceritakan kejadian hari ini dalam 3 kata saja — yang lain menebak ceritanya"],
      ["action", "easy", "Peragakan film terkenal tanpa bicara, yang lain menebak judulnya"],
      ["action", "medium", "Pilih satu orang di sini, lalu puji dia selama 20 detik tanpa berhenti"],
      ["action", "easy", "Nyanyikan reff lagu yang lagi viral dengan gaya dangdut"],
      ["action", "medium", "Bacakan pesan terakhir yang kamu kirim — boleh disensor seperlunya"],
      ["action", "easy", "Buat pose foto grup dalam 10 detik, lalu foto beneran"],
      ["action", "medium", "Kasih tahu satu kebiasaan aneh kamu yang belum pernah diceritakan ke siapa pun di sini"],
    ]
  ),
  deck(
    "tantangan-keluarga",
    "tantangan",
    "Tantangan Keluarga",
    "🎲",
    "Tantangan ringan buat main bareng anak, kakak, adik, sampai kakek-nenek.",
    "emerald",
    [
      ["action", "easy", "Peluk anggota keluarga yang paling dekat denganmu selama 5 detik"],
      ["action", "easy", "Tirukan cara bicara salah satu anggota keluarga — yang lain menebak siapa"],
      ["action", "easy", "Sebutkan 5 masakan rumah secepat mungkin"],
      ["action", "medium", "Ceritakan kenangan masa kecil dalam 30 detik, tanpa jeda"],
      ["action", "easy", "Buat gerakan tari 4 langkah, lalu semua orang menirukannya"],
      ["action", "easy", "Gambar wajah orang di sebelahmu dengan mata tertutup"],
      ["action", "medium", "Ucapkan satu hal yang kamu kagumi dari tiap orang di sini"],
      ["action", "easy", "Kalahkan siapa saja dalam suit jari — yang kalah memilih kartu berikutnya"],
    ]
  ),
  deck(
    "kuis-nusantara",
    "kuis",
    "Kuis Nusantara",
    "🗺️",
    "Seberapa kenal kamu sama Indonesia? Dari makanan, budaya, sampai peta.",
    "emerald",
    [
      ["multiple_choice", 1, "Rendang berasal dari daerah mana?", {
        options: ["Sumatra Barat", "Jawa Tengah", "Sulawesi Selatan", "Bali"],
        correctIndex: 0,
        explanation: "Rendang adalah masakan Minangkabau dari Sumatra Barat. Dimasak berjam-jam sampai bumbunya kering dan meresap.",
      }],
      ["true_false", 2, "Komodo hanya hidup liar di Indonesia.", {
        isTrue: true,
        explanation: "Komodo liar hanya ada di beberapa pulau di Nusa Tenggara Timur, seperti Pulau Komodo, Rinca, dan Flores.",
      }],
      ["quiz", 2, "Apa nama alat musik dari bambu asal Jawa Barat yang dimainkan dengan digoyangkan?", {
        answer: "Angklung",
        explanation: "Angklung diakui UNESCO sebagai Warisan Budaya Takbenda sejak 2010.",
      }],
      ["clue", 3, "Aku ini apa?", {
        clues: [
          "Aku dibuat dengan lilin malam dan canting.",
          "Motifku bisa berbeda di tiap kota, dari Pekalongan sampai Solo.",
          "Tanggal 2 Oktober diperingati sebagai hariku.",
        ],
        answer: "Batik",
      }],
      ["ordering", 3, "Urutkan pulau-pulau ini dari barat ke timur.", {
        items: ["Sumatra", "Jawa", "Bali", "Sulawesi", "Papua"],
      }],
      ["quiz", 4, "Selat apa yang memisahkan Pulau Jawa dan Pulau Sumatra?", {
        answer: "Selat Sunda",
        explanation: "Di Selat Sunda ada Gunung Anak Krakatau, yang muncul dari laut setelah letusan besar Krakatau tahun 1883.",
      }],
    ]
  ),
  deck(
    "dengar-cerita",
    "mendengar",
    "Dengar & Ceritakan",
    "📖",
    "Cerita pendek sehari-hari. Simak sekali, lalu jawab tanpa mengintip.",
    "violet",
    [
      ["listening", 1, "Ayah membeli roti di toko dekat rumah.", {
        questions: [
          { question: "Siapa yang membeli roti?", answer: "Ayah" },
          { question: "Di mana Ayah membeli roti?", answer: "Di toko dekat rumah" },
        ],
      }],
      ["listening", 2, "Setiap Minggu pagi, Tono dan adiknya bersepeda ke taman kota.", {
        questions: [
          { question: "Kapan Tono bersepeda?", answer: "Setiap Minggu pagi" },
          { question: "Dengan siapa Tono bersepeda?", answer: "Dengan adiknya" },
          { question: "Ke mana mereka pergi?", answer: "Ke taman kota" },
        ],
      }],
      ["listening", 3, "Lina lupa membawa bekal, jadi teman sebangkunya membagi setengah nasi gorengnya.", {
        questions: [
          { question: "Apa yang dilupakan Lina?", answer: "Bekal" },
          { question: "Siapa yang menolong Lina?", answer: "Teman sebangkunya" },
          { question: "Makanan apa yang dibagi?", answer: "Nasi goreng" },
        ],
      }],
      ["listening", 3, "Sebelum tidur, Ibu membacakan dongeng kancil, lalu mematikan lampu kamar.", {
        questions: [
          { question: "Kapan Ibu membacakan dongeng?", answer: "Sebelum tidur" },
          { question: "Dongeng apa yang dibacakan?", answer: "Dongeng kancil" },
          { question: "Apa yang Ibu lakukan setelah itu?", answer: "Mematikan lampu kamar" },
        ],
      }],
      ["listening", 4, "Kucing tetangga terjebak di atas pohon. Andi mengambil tangga, sementara kakaknya memegangi tangga itu supaya tidak goyang.", {
        questions: [
          { question: "Apa masalahnya?", answer: "Kucing tetangga terjebak di atas pohon" },
          { question: "Apa yang diambil Andi?", answer: "Tangga" },
          { question: "Apa tugas kakak Andi?", answer: "Memegangi tangga supaya tidak goyang" },
        ],
      }],
      ["listening", 5, "Pak Joko menanam cabai di halaman. Setiap pagi ia menyiramnya, tapi suatu hari daunnya menguning. Ternyata pot-potnya terlalu dekat dengan atap sehingga jarang terkena matahari. Pak Joko pun memindahkannya ke tempat terbuka.", {
        questions: [
          { question: "Apa yang ditanam Pak Joko?", answer: "Cabai" },
          { question: "Apa yang terjadi pada daunnya?", answer: "Menguning" },
          { question: "Kenapa daunnya menguning?", answer: "Jarang terkena matahari karena terlalu dekat dengan atap" },
          { question: "Apa yang dilakukan Pak Joko untuk mengatasinya?", answer: "Memindahkan pot ke tempat terbuka" },
        ],
      }],
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
    "ngobrol",
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
    "kuis",
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
    "mendengar",
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
    "ngobrol",
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
    "ngobrol",
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
    "ngobrol",
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
    "ngobrol",
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
  deck(
    "tantangan-tongkrongan",
    "tantangan",
    "Hangout Challenges",
    "🔥",
    "Do it, don't just answer it — so hanging out isn't just scrolling your phone.",
    "amber",
    [
      ["action", "easy", "Imitate your favorite animal's sound until someone guesses it"],
      ["action", "easy", "Tell what happened today in just 3 words — the others guess the story"],
      ["action", "easy", "Act out a famous movie without speaking while the others guess the title"],
      ["action", "medium", "Pick someone here and compliment them for 20 seconds without stopping"],
      ["action", "easy", "Sing the chorus of a viral song in a totally different style"],
      ["action", "medium", "Read out the last message you sent — censor it as needed"],
      ["action", "easy", "Strike a group photo pose in 10 seconds, then take the photo for real"],
      ["action", "medium", "Share one odd habit you've never told anyone here about"],
    ]
  ),
  deck(
    "tantangan-keluarga",
    "tantangan",
    "Family Challenges",
    "🎲",
    "Light challenges to play with kids, siblings, all the way up to grandparents.",
    "emerald",
    [
      ["action", "easy", "Hug the family member closest to you for 5 seconds"],
      ["action", "easy", "Imitate how a family member talks — the others guess who"],
      ["action", "easy", "Name 5 home-cooked dishes as fast as you can"],
      ["action", "medium", "Tell a childhood memory in 30 seconds without pausing"],
      ["action", "easy", "Make up a 4-step dance move, then everyone copies it"],
      ["action", "easy", "Draw the face of the person next to you with your eyes closed"],
      ["action", "medium", "Say one thing you admire about each person here"],
      ["action", "easy", "Beat anyone at rock-paper-scissors — the loser picks the next card"],
    ]
  ),
  deck(
    "kuis-nusantara",
    "kuis",
    "Indonesia Quiz",
    "🗺️",
    "How well do you know Indonesia? From food and culture to the map.",
    "emerald",
    [
      ["multiple_choice", 1, "Which region does rendang come from?", {
        options: ["West Sumatra", "Central Java", "South Sulawesi", "Bali"],
        correctIndex: 0,
        explanation: "Rendang is a Minangkabau dish from West Sumatra. It's cooked for hours until the spices dry out and soak in.",
      }],
      ["true_false", 2, "Komodo dragons only live in the wild in Indonesia.", {
        isTrue: true,
        explanation: "Wild Komodo dragons are found only on a few islands in East Nusa Tenggara, such as Komodo, Rinca, and Flores.",
      }],
      ["quiz", 2, "What is the bamboo musical instrument from West Java that's played by shaking it?", {
        answer: "Angklung",
        explanation: "UNESCO recognized the angklung as Intangible Cultural Heritage in 2010.",
      }],
      ["clue", 3, "What am I?", {
        clues: [
          "I'm made with wax and a tool called a canting.",
          "My patterns differ from city to city, from Pekalongan to Solo.",
          "October 2 is celebrated as my day.",
        ],
        answer: "Batik",
      }],
      ["ordering", 3, "Put these islands in order from west to east.", {
        items: ["Sumatra", "Java", "Bali", "Sulawesi", "Papua"],
      }],
      ["quiz", 4, "Which strait separates Java from Sumatra?", {
        answer: "The Sunda Strait",
        explanation: "The Sunda Strait is home to Anak Krakatau, a volcano that rose from the sea after Krakatoa's massive eruption in 1883.",
      }],
    ]
  ),
  deck(
    "dengar-cerita",
    "mendengar",
    "Listen & Retell",
    "📖",
    "Short everyday stories. Listen once, then answer without peeking.",
    "violet",
    [
      ["listening", 1, "Dad bought bread at the shop near our house.", {
        questions: [
          { question: "Who bought bread?", answer: "Dad" },
          { question: "Where did Dad buy the bread?", answer: "At the shop near the house" },
        ],
      }],
      ["listening", 2, "Every Sunday morning, Tom and his little sister ride their bikes to the city park.", {
        questions: [
          { question: "When does Tom ride his bike?", answer: "Every Sunday morning" },
          { question: "Who does Tom ride with?", answer: "His little sister" },
          { question: "Where do they go?", answer: "To the city park" },
        ],
      }],
      ["listening", 3, "Lily forgot her lunch, so her deskmate shared half of her fried rice.", {
        questions: [
          { question: "What did Lily forget?", answer: "Her lunch" },
          { question: "Who helped Lily?", answer: "Her deskmate" },
          { question: "What food was shared?", answer: "Fried rice" },
        ],
      }],
      ["listening", 3, "Before bed, Mom read a mouse-deer fable, then turned off the bedroom light.", {
        questions: [
          { question: "When did Mom read the story?", answer: "Before bed" },
          { question: "What story did she read?", answer: "A mouse-deer fable" },
          { question: "What did Mom do after that?", answer: "Turned off the bedroom light" },
        ],
      }],
      ["listening", 4, "The neighbor's cat was stuck up a tree. Andy fetched a ladder, while his older brother held it steady so it wouldn't wobble.", {
        questions: [
          { question: "What was the problem?", answer: "The neighbor's cat was stuck up a tree" },
          { question: "What did Andy fetch?", answer: "A ladder" },
          { question: "What was Andy's brother's job?", answer: "Holding the ladder steady so it wouldn't wobble" },
        ],
      }],
      ["listening", 5, "Mr. Joe planted chili peppers in his yard. He watered them every morning, but one day the leaves turned yellow. It turned out the pots were too close to the roof, so they rarely got sunlight. Mr. Joe moved them to an open spot.", {
        questions: [
          { question: "What did Mr. Joe plant?", answer: "Chili peppers" },
          { question: "What happened to the leaves?", answer: "They turned yellow" },
          { question: "Why did the leaves turn yellow?", answer: "They rarely got sunlight because they were too close to the roof" },
          { question: "What did Mr. Joe do to fix it?", answer: "Moved the pots to an open spot" },
        ],
      }],
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
