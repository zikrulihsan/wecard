import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { generatedDeckSchema, type GenerateDeckInput } from "../deck-schema";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompt";
import {
  GenerationFailed,
  GenerationRefused,
  type DeckProvider,
  type ProviderResult,
} from "../provider";

const DEFAULT_MODEL = "claude-opus-5";

let client: Anthropic | null = null;

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY belum diset");
  client ??= new Anthropic({ apiKey });
  return client;
}

export function createAnthropicProvider(): DeckProvider {
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  return {
    name: "anthropic",
    model,
    async generate(input: GenerateDeckInput): Promise<ProviderResult> {
      const message = await getClient().messages.parse({
        model,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        output_config: {
          format: zodOutputFormat(generatedDeckSchema),
          effort: "medium",
        },
        messages: [{ role: "user", content: buildUserPrompt(input) }],
      });

      if (message.stop_reason === "refusal") {
        throw new GenerationRefused(
          "Permintaan ini ditolak oleh filter keamanan model. Coba ubah konteks atau topiknya."
        );
      }

      if (message.stop_reason === "max_tokens") {
        throw new GenerationFailed(
          "Hasil generate terpotong. Coba kurangi jumlah section atau kartu."
        );
      }

      if (!message.parsed_output) {
        throw new GenerationFailed("Model tidak mengembalikan deck yang valid.");
      }

      return {
        deck: message.parsed_output,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        },
      };
    },
  };
}
