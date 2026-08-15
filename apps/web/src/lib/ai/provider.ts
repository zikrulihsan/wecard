import type { GeneratedDeck, GenerateDeckInput } from "./deck-schema";

export type ProviderName = "gemini" | "anthropic";

export type ProviderResult = {
  deck: GeneratedDeck;
  usage: { inputTokens: number; outputTokens: number };
};

export interface DeckProvider {
  name: ProviderName;
  model: string;
  generate(input: GenerateDeckInput): Promise<ProviderResult>;
}

/** Model menolak permintaan karena filter keamanan — input user perlu diubah. */
export class GenerationRefused extends Error {}

/** Model dipanggil tapi hasilnya tidak bisa dipakai. */
export class GenerationFailed extends Error {}
