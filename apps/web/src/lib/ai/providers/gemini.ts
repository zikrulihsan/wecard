import { GoogleGenAI } from "@google/genai";
import { CARD_TYPES, DECK_THEMES } from "@flipcard/types";
import { generatedDeckSchema, type GenerateDeckInput } from "../deck-schema";
import { SYSTEM_PROMPT, buildPrompt } from "../prompt";
import {
  GenerationFailed,
  GenerationRefused,
  type DeckProvider,
  type GenerateOptions,
  type ProviderResult,
} from "../provider";

const DEFAULT_MODEL = "gemini-3.5-flash";

/**
 * Model cadangan saat model utama penuh. Generasi sebelumnya punya kapasitas
 * dan kuota sendiri, jadi biasanya masih tersedia ketika model terbaru sedang
 * ramai. Bisa diganti (atau dimatikan dengan "none") lewat env.
 */
const DEFAULT_FALLBACK_MODEL = "gemini-2.5-flash";

/**
 * Status yang berarti "server sedang penuh/sibuk", bukan salah permintaan:
 * 429 kuota/rate limit, 500/503/504 overload di sisi Google.
 */
const RETRY_STATUSES = new Set([429, 500, 503, 504]);
/** Jeda sebelum percobaan ke-2 dan ke-3 di model yang sama. */
const RETRY_DELAYS_MS = [1500, 4000];

/**
 * Skema JSON untuk `responseJsonSchema` Gemini. Ditulis manual (bukan hasil
 * konversi dari zod) karena Gemini hanya menerima sebagian keyword JSON Schema
 * — `null` type dan `$schema` termasuk yang tidak didukung. Validasi sebenarnya
 * tetap dilakukan zod setelah respons di-parse.
 */
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    name: { type: "string", description: "Nama deck, maksimal 5 kata" },
    description: {
      type: "string",
      description: "1-2 kalimat: deck ini untuk siapa dan isinya apa",
    },
    theme: {
      type: "string",
      enum: [...DECK_THEMES],
      description: "Tema warna deck, dipilih dari daftar di prompt",
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Nama section, maksimal 4 kata" },
          description: {
            type: "string",
            description: "Satu kalimat penjelasan isi section",
          },
          icon: { type: "string", description: "Satu emoji" },
          cards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                content: {
                  type: "string",
                  description:
                    "Isi kartu: pertanyaan, pernyataan, atau teks yang dibacakan (listening)",
                },
                cardType: {
                  type: "string",
                  enum: [...CARD_TYPES],
                },
                difficulty: {
                  type: "string",
                  enum: ["easy", "medium", "hard"],
                },
                specialKind: {
                  type: "string",
                  enum: ["free_pass", "switch", "double"],
                  description:
                    "Isi hanya jika cardType = special. Untuk tipe lain, hilangkan field ini.",
                },
                // Field kartu kuis — semuanya opsional; isi hanya yang dipakai
                // format kartunya (lihat aturan di prompt sistem).
                level: { type: "integer", description: "Kartu kuis/listening: 1-5" },
                answer: { type: "string", description: "quiz & clue: jawaban" },
                explanation: { type: "string", description: "Penjelasan singkat" },
                options: {
                  type: "array",
                  items: { type: "string" },
                  description: "multiple_choice: 3-4 pilihan",
                },
                correctIndex: {
                  type: "integer",
                  description: "multiple_choice: indeks pilihan benar, mulai 0",
                },
                isTrue: { type: "boolean", description: "true_false: fakta?" },
                clues: {
                  type: "array",
                  items: { type: "string" },
                  description: "clue: 3 clue dari samar ke jelas",
                },
                items: {
                  type: "array",
                  items: { type: "string" },
                  description: "ordering: langkah dalam urutan benar",
                },
                questions: {
                  type: "array",
                  description: "listening: pertanyaan & jawabannya",
                  items: {
                    type: "object",
                    properties: {
                      question: { type: "string" },
                      answer: { type: "string" },
                    },
                    required: ["question", "answer"],
                  },
                },
              },
              required: ["content", "cardType", "difficulty"],
              propertyOrdering: [
                "content",
                "cardType",
                "difficulty",
                "specialKind",
                "level",
                "answer",
                "explanation",
                "options",
                "correctIndex",
                "isTrue",
                "clues",
                "items",
                "questions",
              ],
            },
          },
        },
        required: ["name", "description", "icon", "cards"],
        propertyOrdering: ["name", "description", "icon", "cards"],
      },
    },
  },
  required: ["name", "description", "theme", "sections"],
  propertyOrdering: ["name", "description", "theme", "sections"],
};

let client: GoogleGenAI | null = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY belum diset");
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

function fallbackModels(primary: string): string[] {
  const raw = process.env.GEMINI_FALLBACK_MODEL ?? DEFAULT_FALLBACK_MODEL;
  if (raw.trim().toLowerCase() === "none") return [];
  return raw
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m && m !== primary);
}

export function createGeminiProvider(): DeckProvider {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const models = [model, ...fallbackModels(model)];

  return {
    name: "gemini",
    model,
    async generate(input: GenerateDeckInput, options?: GenerateOptions): Promise<ProviderResult> {
      const request = {
        contents: buildPrompt(input, options?.instruction),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: RESPONSE_SCHEMA,
          maxOutputTokens: 16000,
        },
      };

      const { response, model: usedModel } = await withFallback(models, (m) =>
        getClient().models.generateContent({ ...request, model: m })
      );

      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new GenerationRefused(
          "Permintaan ini ditolak oleh filter keamanan model. Coba ubah konteks atau topiknya."
        );
      }

      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === "SAFETY" || finishReason === "PROHIBITED_CONTENT") {
        throw new GenerationRefused(
          "Isi kartu yang dihasilkan tertahan filter keamanan model. Coba ubah konteks atau topiknya."
        );
      }
      if (finishReason === "MAX_TOKENS") {
        throw new GenerationFailed(
          "Hasil generate terpotong. Coba kurangi jumlah section atau kartu.",
          "truncated"
        );
      }

      const text = response.text;
      if (!text) {
        throw new GenerationFailed("Model tidak mengembalikan deck yang valid.");
      }

      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        throw new GenerationFailed("Model mengembalikan JSON yang rusak.");
      }

      const parsed = generatedDeckSchema.safeParse(withOptionalNulls(raw));
      if (!parsed.success) {
        throw new GenerationFailed(
          "Bentuk deck dari model tidak sesuai skema yang diminta."
        );
      }

      return {
        deck: parsed.data,
        model: usedModel,
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
        },
      };
    },
  };
}

function isBusy(error: unknown): boolean {
  const status = (error as { status?: number })?.status;
  return typeof status === "number" && RETRY_STATUSES.has(status);
}

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 500));

/**
 * Coba model utama sampai 3 kali dengan jeda bertahap. Kalau tetap penuh,
 * pindah ke model cadangan (sekali coba ulang). Error selain "penuh"
 * (key salah, permintaan tidak valid) langsung dilempar tanpa diulang.
 */
async function withFallback<T>(
  models: string[],
  call: (model: string) => Promise<T>
): Promise<{ response: T; model: string }> {
  let lastBusy: unknown;

  for (const [index, model] of models.entries()) {
    const delays = index === 0 ? RETRY_DELAYS_MS : RETRY_DELAYS_MS.slice(0, 1);
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        return { response: await call(model), model };
      } catch (error) {
        // Model cadangan yang tidak bisa dipakai (mis. namanya sudah tidak
        // ada) jangan menutupi penyebab aslinya: model utama penuh.
        if (!isBusy(error)) {
          if (index === 0) throw error;
          console.warn(`[gemini] model cadangan ${model} gagal`, error);
          break;
        }
        lastBusy = error;
        if (attempt < delays.length) await sleep(delays[attempt]);
      }
    }
  }

  const status = (lastBusy as { status?: number })?.status;
  throw new GenerationFailed(
    "Model AI sedang penuh. Coba lagi beberapa saat lagi.",
    "busy",
    { cause: `gemini ${models.join(" → ")} status ${status ?? "?"}` }
  );
}

/** Field kartu yang opsional di skema Gemini tapi wajib ada (nullable) di zod. */
const OPTIONAL_CARD_FIELDS = {
  specialKind: null,
  level: null,
  answer: null,
  explanation: null,
  options: null,
  correctIndex: null,
  isTrue: null,
  clues: null,
  items: null,
  questions: null,
};

/**
 * Field-field di atas sengaja dibuat opsional di skema Gemini (nullable tidak
 * didukung penuh), sementara skema zod mewajibkan key-nya ada. Isi null dulu.
 */
function withOptionalNulls(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const deck = raw as { sections?: unknown };
  if (!Array.isArray(deck.sections)) return raw;

  return {
    ...deck,
    sections: deck.sections.map((section) => {
      if (!section || typeof section !== "object") return section;
      const { cards } = section as { cards?: unknown };
      if (!Array.isArray(cards)) return section;
      return {
        ...section,
        cards: cards.map((card) =>
          card && typeof card === "object"
            ? { ...OPTIONAL_CARD_FIELDS, ...card }
            : card
        ),
      };
    }),
  };
}
