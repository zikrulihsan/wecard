import { GoogleGenAI } from "@google/genai";
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
                  description: "Isi kartu yang dibaca pemain, satu kalimat",
                },
                cardType: {
                  type: "string",
                  enum: ["talk", "action", "special"],
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
              },
              required: ["content", "cardType", "difficulty"],
              propertyOrdering: [
                "content",
                "cardType",
                "difficulty",
                "specialKind",
              ],
            },
          },
        },
        required: ["name", "description", "icon", "cards"],
        propertyOrdering: ["name", "description", "icon", "cards"],
      },
    },
  },
  required: ["name", "description", "sections"],
  propertyOrdering: ["name", "description", "sections"],
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

      const parsed = generatedDeckSchema.safeParse(withSpecialKindNulls(raw));
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

/**
 * `specialKind` sengaja dibuat opsional di skema Gemini (nullable tidak
 * didukung penuh), sementara skema zod mewajibkan key-nya ada. Isi null dulu.
 */
function withSpecialKindNulls(raw: unknown): unknown {
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
            ? { specialKind: null, ...card }
            : card
        ),
      };
    }),
  };
}
