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
}

export interface GameStore extends GameSessionState {
  isActive: boolean;

  // Actions
  startSession: (
    deckId: string,
    deckName: string,
    deckTheme: DeckTheme,
    sections: string[],
    cards: GameCard[]
  ) => void;
  revealCard: () => void;
  nextCard: () => void;
  previousCard: () => void;
  skipCard: () => void;
  endSession: () => void;
  reset: () => void;
}
