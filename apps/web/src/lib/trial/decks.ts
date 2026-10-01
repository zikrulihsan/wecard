import type { CardDifficulty, CardType, DeckTheme, GameCard } from "@flipcard/types";

/**
 * Deck umum untuk dicoba tanpa akun.
 *
 * Sengaja ditulis statis di sini, bukan dibaca dari Supabase: pengunjung yang
 * belum login tidak boleh bergantung pada policy baca tabel, dan halaman coba
 * harus langsung jalan meski server sedang lambat. Isinya pendek (8 kartu)
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

type RawCard = [CardType, CardDifficulty, string];

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
    cards: raw.map(([cardType, difficulty, content], index) => ({
      id: `trial-${slug}-${index + 1}`,
      content,
      cardType,
      difficulty,
      specialKind: null,
      sectionName: name,
      sectionSlug: slug,
    })),
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
