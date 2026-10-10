import type { GeneratedDeck, GenerateDeckInput } from "./deck-schema";

export type ProviderName = "gemini" | "anthropic";

export type ProviderResult = {
  deck: GeneratedDeck;
  usage: { inputTokens: number; outputTokens: number };
};

export type GenerateOptions = {
  /**
   * Tugas tambahan di akhir prompt user — dipakai untuk ganti kartu satuan
   * ("buat satu kartu pengganti, jangan mirip kartu-kartu ini").
   */
  instruction?: string;
};

export interface DeckProvider {
  name: ProviderName;
  model: string;
  generate(input: GenerateDeckInput, options?: GenerateOptions): Promise<ProviderResult>;
}

/** Model menolak permintaan karena filter keamanan — input user perlu diubah. */
export class GenerationRefused extends Error {
  readonly code = "safety_blocked";
}

/** Model dipanggil tapi hasilnya tidak bisa dipakai. */
export class GenerationFailed extends Error {
  /**
   * Kode stabil yang dikirim ke klien bersama pesannya, supaya klien bisa
   * menampilkan pesan dalam bahasa aplikasinya sendiri.
   */
  constructor(
    message: string,
    readonly code: "truncated" | "invalid_output" | "empty_deck" | "busy" = "invalid_output"
  ) {
    super(message);
  }
}
