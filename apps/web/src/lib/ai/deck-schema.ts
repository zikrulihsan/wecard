import { z } from "zod";
import { CARD_TYPES, DECK_THEMES } from "@flipcard/types";

// ============================================================
// INPUT — field yang diisi user di form generate
// ============================================================

// Label di sini dipakai prompt generate (selalu bahasa Indonesia, di server).
// Teks yang tampil di form — label, contoh placeholder, petunjuk — ada di
// kamus i18n (`create.*`), dicocokkan lewat `value`.
export const AUDIENCES = [
  { value: "pasangan", label: "Pasangan" },
  { value: "sahabat", label: "Sahabat / teman dekat" },
  { value: "keluarga", label: "Keluarga" },
  { value: "anak-orang-tua", label: "Anak & orang tua" },
  { value: "rekan-kerja", label: "Rekan kerja / tim" },
  { value: "kenalan-baru", label: "Kenalan baru" },
  { value: "belajar-sendiri", label: "Diri sendiri — belajar & uji kemampuan" },
  { value: "lainnya", label: "Lainnya (jelaskan di konteks)" },
] as const;

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
  },
  {
    value: "talk",
    label: "Pertanyaan saja",
  },
  {
    value: "action",
    label: "Tantangan saja",
  },
  {
    value: "kuis",
    label: "Kuis pengetahuan — ada jawabannya",
  },
  {
    value: "mendengar",
    label: "Latihan mendengar & konsentrasi",
  },
] as const;

/** Mode deck yang isinya kuis/latihan dengan jawaban, bukan obrolan. */
export const KNOWLEDGE_MIXES = ["kuis", "mendengar"] as const;

export function isKnowledgeMix(mix: string) {
  return (KNOWLEDGE_MIXES as readonly string[]).includes(mix);
}

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
});

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
