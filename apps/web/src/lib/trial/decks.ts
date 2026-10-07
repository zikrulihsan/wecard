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

export const TRIAL_DECKS: TrialDeck[] = [
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

export function findTrialDeck(slug: string | undefined): TrialDeck | undefined {
  return TRIAL_DECKS.find((item) => item.slug === slug);
}
