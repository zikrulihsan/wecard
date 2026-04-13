import type { CardType, CardDifficulty, SpecialCardKind } from "./database";

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
