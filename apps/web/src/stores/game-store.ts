"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GameCard, GameStore } from "@flipcard/types";
import { DEFAULT_DECK_THEME } from "@/lib/deck-theme";

const initialState = {
  deckId: "",
  deckName: "",
  deckTheme: DEFAULT_DECK_THEME,
  selectedSections: [],
  cards: [] as GameCard[],
  currentIndex: 0,
  isCardRevealed: false,
  skippedCardIds: [] as string[],
  completedCardIds: [] as string[],
  startedAt: "",
  isActive: false,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: (deckId, deckName, deckTheme, sections, cards) => {
        set({
          deckId,
          deckName,
          deckTheme,
          selectedSections: sections,
          cards,
          currentIndex: 0,
          isCardRevealed: false,
          skippedCardIds: [],
          completedCardIds: [],
          startedAt: new Date().toISOString(),
          isActive: true,
        });
      },

      revealCard: () => set({ isCardRevealed: true }),

      nextCard: () => {
        const { currentIndex, cards, completedCardIds } = get();
        const current = cards[currentIndex];
        if (!current) return;

        set({
          currentIndex: currentIndex + 1,
          isCardRevealed: false,
          completedCardIds: completedCardIds.includes(current.id)
            ? completedCardIds
            : [...completedCardIds, current.id],
        });
      },

      previousCard: () => {
        const { currentIndex } = get();
        if (currentIndex === 0) return;
        set({
          currentIndex: currentIndex - 1,
          isCardRevealed: false,
        });
      },

      skipCard: () => {
        const { currentIndex, cards, skippedCardIds } = get();
        const current = cards[currentIndex];
        if (!current) return;

        set({
          currentIndex: currentIndex + 1,
          isCardRevealed: false,
          skippedCardIds: [...skippedCardIds, current.id],
        });
      },

      endSession: () => {
        set({ ...initialState });
      },

      reset: () => {
        set({ ...initialState });
      },
    }),
    {
      // Sengaja dipertahankan setelah rebrand ke FlipCard: mengganti kunci
      // ini akan menghapus sesi yang sedang berjalan di perangkat pemain.
      name: "wecard-game-session",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
    }
  )
);
