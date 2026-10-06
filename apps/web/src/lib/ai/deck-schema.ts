import { z } from "zod";
import { CARD_TYPES, DECK_THEMES, type DeckMode } from "@flipcard/types";

// ============================================================
// INPUT — field yang diisi user di form generate
// ============================================================

// Placeholder contoh per audience — dipakai form generate supaya contohnya
// nyambung sama pilihan "mau dimainkan sama siapa".
export type AudiencePlaceholders = {
  deckName: string;
  context: string;
  avoid: string;
};

export const AUDIENCES = [
  {
    value: "pasangan",
    modes: ["ngobrol", "tantangan"],
    label: "Pasangan",
    placeholders: {
      deckName: "Misal: Malam Jumat Berdua",
      context: "Misal: kami LDR sudah 2 tahun dan baru ketemu sebulan sekali",
      avoid: "Misal: mantan, kerjaan, politik",
    },
  },
  {
    value: "sahabat",
    modes: ["ngobrol", "tantangan", "kuis", "mendengar"],
    modeLabels: { kuis: "Bareng teman", mendengar: "Bareng teman" },
    label: "Sahabat / teman dekat",
    placeholders: {
      deckName: "Misal: Nongkrong Sampai Pagi",
      context:
        "Misal: kami sahabat dari SMA, sekarang beda kota dan jarang ketemu",
      avoid: "Misal: berat badan, gaji, drama grup",
    },
  },
  {
    value: "keluarga",
    modes: ["ngobrol", "tantangan", "kuis", "mendengar"],
    label: "Keluarga",
    placeholders: {
      deckName: "Misal: Kumpul Keluarga Besar",
      context:
        "Misal: dimainkan pas lebaran, ada om, tante, dan sepupu dari anak-anak sampai dewasa",
      avoid: "Misal: politik, warisan, kapan nikah",
    },
  },
  {
    value: "anak-orang-tua",
    modes: ["ngobrol", "tantangan", "kuis", "mendengar"],
    modeLabels: { mendengar: "Anak — dibacakan orang tua" },
    label: "Anak & orang tua",
    placeholders: {
      deckName: "Misal: Ngobrol Sebelum Tidur",
      context: "Misal: anak umur 9 tahun, biasanya main sebelum tidur",
      avoid: "Misal: nilai sekolah, dibanding-bandingkan sama saudara",
    },
  },
  {
    value: "rekan-kerja",
    modes: ["ngobrol", "tantangan", "kuis", "mendengar"],
    modeLabels: { kuis: "Tim / kelas", mendengar: "Tim / kelas" },
    label: "Rekan kerja / tim",
    placeholders: {
      deckName: "Misal: Icebreaker Senin Pagi",
      context:
        "Misal: tim 6 orang, setengahnya remote dan belum pernah ketemu langsung",
      avoid: "Misal: gaji, promosi, gosip kantor",
    },
  },
  {
    value: "kenalan-baru",
    modes: ["ngobrol", "tantangan"],
    label: "Kenalan baru",
    placeholders: {
      deckName: "Misal: Kenalan Tanpa Canggung",
      context:
        "Misal: acara komunitas, kebanyakan baru pertama kali ketemu hari itu",
      avoid: "Misal: agama, politik, status hubungan",
    },
  },
  {
    value: "belajar-sendiri",
    modes: ["kuis"],
    modeLabels: { kuis: "Sendiri — belajar & uji kemampuan" },
    label: "Diri sendiri — belajar & uji kemampuan",
    placeholders: {
      deckName: "Misal: Uji Diri AI Engineering",
      context:
        "Misal: aku software engineer, sudah paham dasar LLM, mau menguji RAG dan agents",
      avoid: "Misal: soal hafalan angka, nama produk tertentu",
    },
  },
  {
    value: "lainnya",
    modes: ["ngobrol", "tantangan", "kuis", "mendengar"],
    label: "Lainnya (jelaskan di konteks)",
    placeholders: {
      deckName: "Misal: Malam Seru Bareng",
      context: "Misal: dimainkan sama tetangga kompleks pas arisan bulanan",
      avoid: "Misal: politik, agama, uang",
    },
  },
] as const;

type AudienceOption = {
  value: string;
  label: string;
  /** Jenis deck yang masuk akal untuk pemain ini. */
  modes: readonly DeckMode[];
  /** Label pengganti di jenis tertentu, misal "Tim / kelas" untuk kuis. */
  modeLabels?: Partial<Record<DeckMode, string>>;
  placeholders: AudiencePlaceholders;
};

/**
 * Pilihan "dimainkan sama siapa" untuk satu jenis deck — kuis untuk pasangan
 * atau latihan mendengar sendirian tidak ditawarkan.
 */
export function audiencesForMode(mode: DeckMode) {
  return (AUDIENCES as readonly AudienceOption[])
    .filter((option) => option.modes.includes(mode))
    .map((option) => ({
      value: option.value,
      label: option.modeLabels?.[mode] ?? option.label,
    }));
}

export const DEFAULT_AUDIENCE_PLACEHOLDERS: AudiencePlaceholders =
  AUDIENCES[0].placeholders;

export function getAudiencePlaceholders(
  audience: string
): AudiencePlaceholders {
  return (
    AUDIENCES.find((option) => option.value === audience)?.placeholders ??
    DEFAULT_AUDIENCE_PLACEHOLDERS
  );
}

export const TONES = [
  { value: "santai", label: "Santai & ringan" },
  { value: "romantis", label: "Romantis & hangat" },
  { value: "reflektif", label: "Reflektif & jujur" },
  { value: "lucu", label: "Seru & kocak" },
  { value: "mendalam", label: "Mendalam & serius" },
] as const;

export const DEPTHS = [
  { value: "ringan", label: "Ringan — aman untuk siapa saja" },
  { value: "sedang", label: "Sedang — mulai personal" },
  { value: "dalam", label: "Dalam — pertanyaan berat & jujur" },
] as const;

export const CARD_MIXES = [
  {
    value: "campuran",
    label: "Campuran — pertanyaan & tantangan",
    hint: "Sekitar sepertiga kartu berupa tantangan.",
  },
  {
    value: "talk",
    label: "Pertanyaan saja",
    hint: "Semua kartu dijawab dengan cerita. Fokus ngobrol.",
  },
  {
    value: "action",
    label: "Tantangan saja",
    hint: "Semua kartu berupa tantangan yang langsung dikerjakan — tidak ada yang perlu dijawab.",
  },
  {
    value: "kuis",
    label: "Kuis pengetahuan — ada jawabannya",
    hint: "Campuran tanya jawab, pilihan ganda, mitos/fakta, tebak clue, dan urutkan. Jawaban ada di balik kartu.",
  },
  {
    value: "mendengar",
    label: "Latihan mendengar & konsentrasi",
    hint: "Satu orang membacakan teks pendek, yang lain menjawab pertanyaannya. Level naik bertahap.",
  },
] as const;

/** Jenis deck yang tersimpan di `categories.mode` untuk tiap isi kartu. */
export const CARD_MIX_MODE: Record<(typeof CARD_MIXES)[number]["value"], DeckMode> = {
  campuran: "ngobrol",
  talk: "ngobrol",
  action: "tantangan",
  kuis: "kuis",
  mendengar: "mendengar",
};

export function modeForCardMix(mix: string): DeckMode {
  return CARD_MIX_MODE[mix as keyof typeof CARD_MIX_MODE] ?? "ngobrol";
}

/** Mode deck yang isinya kuis/latihan dengan jawaban, bukan obrolan. */
export const KNOWLEDGE_MIXES = ["kuis", "mendengar"] as const;

export function isKnowledgeMix(mix: string) {
  return (KNOWLEDGE_MIXES as readonly string[]).includes(mix);
}

/**
 * Di deck kuis, pilihan "kedalaman" dibaca sebagai tingkat kesulitan —
 * labelnya ikut berganti di form, nilainya tetap sama.
 */
export const KNOWLEDGE_DEPTH_LABELS: Record<string, string> = {
  ringan: "Mudah — ⭐ sampai ⭐⭐",
  sedang: "Sedang — ⭐⭐ sampai ⭐⭐⭐⭐",
  dalam: "Menantang — naik bertahap sampai ⭐⭐⭐⭐⭐",
};

export const MIN_SECTIONS = 2;
export const MAX_SECTIONS = 5;
export const MIN_CARDS_PER_SECTION = 5;
export const MAX_CARDS_PER_SECTION = 15;

export const generateDeckInputSchema = z.object({
  audience: z.enum(AUDIENCES.map((a) => a.value) as [string, ...string[]]),
  deckName: z.string().trim().max(60).optional(),
  language: z.enum(["id", "en"]).default("id"),
  tone: z.enum(TONES.map((t) => t.value) as [string, ...string[]]),
  depth: z.enum(DEPTHS.map((d) => d.value) as [string, ...string[]]),
  sectionCount: z.coerce.number().int().min(MIN_SECTIONS).max(MAX_SECTIONS),
  cardsPerSection: z.coerce
    .number()
    .int()
    .min(MIN_CARDS_PER_SECTION)
    .max(MAX_CARDS_PER_SECTION),
  cardMix: z
    .enum(CARD_MIXES.map((m) => m.value) as [string, ...string[]])
    .default("campuran"),
  includeSpecial: z.boolean().default(false),
  /** Topik pengetahuan untuk deck kuis/mendengar, misal "AI Engineering". */
  topic: z.string().trim().max(120).optional(),
  context: z.string().trim().max(500).optional(),
  avoid: z.string().trim().max(300).optional(),
}).refine(
  (input) =>
    audiencesForMode(modeForCardMix(input.cardMix)).some(
      (option) => option.value === input.audience
    ),
  { path: ["audience"], message: "Pilihan pemain tidak cocok dengan jenis deck ini." }
);

export type GenerateDeckInput = z.infer<typeof generateDeckInputSchema>;

// ============================================================
// OUTPUT — bentuk JSON yang wajib dikembalikan model
// Constraint numerik/panjang divalidasi di sisi klien oleh SDK,
// jadi aman dipakai bareng structured outputs.
// ============================================================

/**
 * Field khas format kuis sengaja ditaruh rata di kartu (bukan objek `details`
 * bersarang) dan semuanya nullable: lebih mudah diikuti model, dan bentuknya
 * sama untuk semua provider. Dirapikan jadi `details` saat normalisasi.
 */
export const generatedCardSchema = z.object({
  content: z
    .string()
    .describe(
      "Isi kartu yang dibaca pemain: pertanyaan, pernyataan, atau teks yang dibacakan (untuk listening)."
    ),
  cardType: z
    .enum(CARD_TYPES)
    .describe(
      "talk = pertanyaan obrolan, action = tantangan, special = kartu mekanik, quiz = tanya jawab, multiple_choice = pilihan ganda, true_false = mitos/fakta, clue = tebak dari clue, ordering = urutkan, listening = teks dibacakan lalu dijawab"
    ),
  difficulty: z
    .enum(["easy", "medium", "hard"])
    .describe("Kartu obrolan: bobot emosional. Kartu kuis: easy/medium/hard sesuai level."),
  specialKind: z
    .enum(["free_pass", "switch", "double"])
    .nullable()
    .describe("Wajib diisi hanya jika cardType = special, selain itu null"),
  level: z
    .number()
    .int()
    .nullable()
    .describe("Kartu kuis & listening: tingkat kesulitan 1-5. Kartu obrolan: null"),
  answer: z
    .string()
    .nullable()
    .describe("quiz & clue: jawaban singkat yang benar. Lainnya null"),
  explanation: z
    .string()
    .nullable()
    .describe("Kartu kuis: 1-2 kalimat penjelasan kenapa jawabannya begitu. Boleh null"),
  options: z
    .array(z.string())
    .nullable()
    .describe("multiple_choice: 3-4 pilihan jawaban. Lainnya null"),
  correctIndex: z
    .number()
    .int()
    .nullable()
    .describe("multiple_choice: indeks (mulai 0) pilihan yang benar. Lainnya null"),
  isTrue: z
    .boolean()
    .nullable()
    .describe("true_false: true kalau pernyataannya fakta, false kalau mitos. Lainnya null"),
  clues: z
    .array(z.string())
    .nullable()
    .describe("clue: 3 clue dari yang paling samar ke yang paling jelas. Lainnya null"),
  items: z
    .array(z.string())
    .nullable()
    .describe("ordering: 3-6 langkah dalam urutan yang BENAR (aplikasi yang mengacak). Lainnya null"),
  questions: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .nullable()
    .describe("listening: 2-4 pertanyaan tentang teks beserta jawabannya. Lainnya null"),
});

export const generatedSectionSchema = z.object({
  name: z.string().describe("Nama section, maksimal 4 kata"),
  description: z.string().describe("Satu kalimat penjelasan isi section"),
  icon: z.string().describe("Satu emoji yang mewakili section"),
  cards: z.array(generatedCardSchema),
});

export const generatedDeckSchema = z.object({
  name: z.string().describe("Nama deck, maksimal 5 kata"),
  // Optional supaya model yang lupa mengisinya tidak menggagalkan generate —
  // temanya diisi dari audiens saat normalisasi.
  theme: z
    .enum(DECK_THEMES)
    .optional()
    .describe("Nama tema warna deck, dipilih dari daftar yang tersedia"),
  description: z
    .string()
    .describe("1-2 kalimat yang menjelaskan deck ini untuk siapa dan isinya"),
  sections: z.array(generatedSectionSchema),
});

export type GeneratedDeck = z.infer<typeof generatedDeckSchema>;
