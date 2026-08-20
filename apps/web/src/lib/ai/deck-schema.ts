import { z } from "zod";
import { DECK_THEMES } from "@flipcard/types";

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
    label: "Pasangan",
    placeholders: {
      deckName: "Misal: Malam Jumat Berdua",
      context: "Misal: kami LDR sudah 2 tahun dan baru ketemu sebulan sekali",
      avoid: "Misal: mantan, kerjaan, politik",
    },
  },
  {
    value: "sahabat",
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
    label: "Anak & orang tua",
    placeholders: {
      deckName: "Misal: Ngobrol Sebelum Tidur",
      context: "Misal: anak umur 9 tahun, biasanya main sebelum tidur",
      avoid: "Misal: nilai sekolah, dibanding-bandingkan sama saudara",
    },
  },
  {
    value: "rekan-kerja",
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
    label: "Kenalan baru",
    placeholders: {
      deckName: "Misal: Kenalan Tanpa Canggung",
      context:
        "Misal: acara komunitas, kebanyakan baru pertama kali ketemu hari itu",
      avoid: "Misal: agama, politik, status hubungan",
    },
  },
  {
    value: "lainnya",
    label: "Lainnya (jelaskan di konteks)",
    placeholders: {
      deckName: "Misal: Malam Seru Bareng",
      context: "Misal: dimainkan sama tetangga kompleks pas arisan bulanan",
      avoid: "Misal: politik, agama, uang",
    },
  },
] as const;

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
] as const;

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
  context: z.string().trim().max(500).optional(),
  avoid: z.string().trim().max(300).optional(),
});

export type GenerateDeckInput = z.infer<typeof generateDeckInputSchema>;

// ============================================================
// OUTPUT — bentuk JSON yang wajib dikembalikan model
// Constraint numerik/panjang divalidasi di sisi klien oleh SDK,
// jadi aman dipakai bareng structured outputs.
// ============================================================

export const generatedCardSchema = z.object({
  content: z
    .string()
    .describe(
      "Isi kartu yang dibaca pemain. Satu kalimat, langsung ke intinya."
    ),
  cardType: z
    .enum(["talk", "action", "special"])
    .describe(
      "talk = pertanyaan untuk dijawab, action = tantangan untuk dilakukan, special = kartu mekanik permainan"
    ),
  difficulty: z
    .enum(["easy", "medium", "hard"])
    .describe("Seberapa berat kartu ini secara emosional"),
  specialKind: z
    .enum(["free_pass", "switch", "double"])
    .nullable()
    .describe("Wajib diisi hanya jika cardType = special, selain itu null"),
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
