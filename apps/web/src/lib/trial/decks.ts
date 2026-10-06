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

export const TRIAL_DECKS: TrialDeck[] = [
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

export function findTrialDeck(slug: string | undefined): TrialDeck | undefined {
  return TRIAL_DECKS.find((item) => item.slug === slug);
}
