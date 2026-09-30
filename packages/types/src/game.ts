import type {
  CardType,
  CardDifficulty,
  DeckTheme,
  SpecialCardKind,
} from "./database";

export interface GameCard {
  id: string;
  content: string;
  cardType: CardType;
  difficulty: CardDifficulty;
  specialKind: SpecialCardKind | null;
  sectionName: string;
  sectionSlug: string;
}

/**
 * Aturan timer per kartu, dipilih sebelum permainan dimulai. `seconds` 0
 * berarti timer mati.
 */
export interface CardTimerSettings {
  seconds: number;
  /** Langsung pindah ke kartu berikutnya begitu waktunya habis. */
  autoAdvance: boolean;
}

export interface GameSessionState {
  deckId: string;
  deckName: string;
  /** Warna deck yang sedang dimainkan, dipakai layar main & layar selesai. */
  deckTheme: DeckTheme;
  selectedSections: string[];
  cards: GameCard[];
  currentIndex: number;
  isCardRevealed: boolean;
  skippedCardIds: string[];
  completedCardIds: string[];
  startedAt: string;
  timer: CardTimerSettings;
}

export interface GameStore extends GameSessionState {
  isActive: boolean;

  // Actions
  startSession: (
    deckId: string,
    deckName: string,
    deckTheme: DeckTheme,
    sections: string[],
    cards: GameCard[],
    timer: CardTimerSettings
  ) => void;
  revealCard: () => void;
  nextCard: () => void;
  previousCard: () => void;
  skipCard: () => void;
  endSession: () => void;
  reset: () => void;
}
