import { GoogleGenAI } from "@google/genai";
import { CARD_TYPES, DECK_THEMES } from "@flipcard/types";
import { generatedDeckSchema, type GenerateDeckInput } from "../deck-schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompt";
import {
  GenerationFailed,
  GenerationRefused,
  type DeckProvider,
  type ProviderResult,
} from "../provider";

const DEFAULT_MODEL = "gemini-3.5-flash";

/** Model terbaru sering balas 503 saat ramai — sekali ulang biasanya cukup. */
const RETRY_STATUSES = new Set([429, 503]);
const RETRY_DELAY_MS = 2000;

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

export function createGeminiProvider(): DeckProvider {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  return {
    name: "gemini",
    model,
    async generate(input: GenerateDeckInput): Promise<ProviderResult> {
      const request = {
        model,
        contents: buildUserPrompt(input),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: RESPONSE_SCHEMA,
          maxOutputTokens: 16000,
        },
      };

      const response = await withRetry(() =>
        getClient().models.generateContent(request)
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
          "Hasil generate terpotong. Coba kurangi jumlah section atau kartu."
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
        usage: {
          inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
          outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
        },
      };
    },
  };
}

async function withRetry<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    const status = (error as { status?: number })?.status;
    if (!status || !RETRY_STATUSES.has(status)) throw error;

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    try {
      return await call();
    } catch (retryError) {
      const retryStatus = (retryError as { status?: number })?.status;
      if (retryStatus && RETRY_STATUSES.has(retryStatus)) {
        throw new GenerationFailed(
          "Model AI sedang penuh. Coba lagi beberapa saat lagi."
        );
      }
      throw retryError;
    }
  }
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
