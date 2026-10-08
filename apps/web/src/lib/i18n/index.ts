import { useEffect } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { en } from "./messages/en";
import { id, type Messages } from "./messages/id";

/**
 * Bahasa antarmuka. Isi deck (kartu dari database) tidak ikut diterjemahkan —
 * deck punya bahasanya sendiri; yang diatur di sini hanya teks aplikasi.
 */
export const LANGUAGES = ["id", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<Language, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

const MESSAGES: Record<Language, Messages> = { id, en };

/** Locale untuk Intl / Web Speech per bahasa. */
export const LOCALES: Record<Language, string> = { id: "id-ID", en: "en-US" };

export function isLanguage(value: unknown): value is Language {
  return (LANGUAGES as readonly unknown[]).includes(value);
}

/**
 * Tebakan pertama dari pengaturan browser. Mayoritas pemain dari Indonesia,
 * tapi banyak HP di sini disetel ke bahasa Inggris — jadi cukup ada "id" (atau
 * Melayu, yang dekat) di daftar bahasa mana pun untuk memilih Indonesia.
 */
function detectLanguage(): Language {
  if (typeof navigator === "undefined") return "id";
  const preferred = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  return preferred.some((tag) => /^(id|in|ms)\b/i.test(tag ?? ""))
    ? "id"
    : "en";
}

type LanguageStore = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: detectLanguage(),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "flipcard-language",
      storage: createJSONStorage(() => {
        try {
          return localStorage;
        } catch {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
      }),
      merge: (persisted, current) => {
        const language = (persisted as Partial<LanguageStore> | undefined)
          ?.language;
        return isLanguage(language) ? { ...current, language } : current;
      },
    }
  )
);

/** Bahasa aktif saja — untuk kode di luar React (mis. error fetch). */
export function currentLanguage(): Language {
  return useLanguageStore.getState().language;
}

export function messagesFor(language: Language): Messages {
  return MESSAGES[language];
}

/** Teks aplikasi dalam bahasa aktif, plus bahasanya dan pengubahnya. */
export function useI18n() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  return { t: MESSAGES[language], language, setLanguage };
}

export function useT(): Messages {
  return MESSAGES[useLanguageStore((state) => state.language)];
}

/**
 * Menyelaraskan `<html lang>`, judul tab, dan meta description dengan bahasa
 * aktif. Dipasang sekali di akar aplikasi.
 */
export function useDocumentLanguage() {
  const language = useLanguageStore((state) => state.language);
  useEffect(() => {
    const meta = MESSAGES[language].meta;
    document.documentElement.lang = language;
    document.title = meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", meta.description);
  }, [language]);
}

/**
 * Tebakan kasar bahasa teks kartu, untuk memilih suara pembaca Web Speech.
 * Deck bawaan berbahasa Indonesia, deck AI bisa Inggris — dan suara Inggris
 * yang membacakan teks Indonesia (atau sebaliknya) nyaris tidak bisa dipahami.
 */
const INDONESIAN_WORDS = new Set([
  "yang", "dan", "di", "ke", "dari", "itu", "ini", "apa", "aku", "kamu",
  "tidak", "nggak", "dengan", "untuk", "adalah", "karena", "lalu", "ada",
  "sedang", "akan", "sudah", "bisa", "siapa", "mengapa", "kenapa", "bersama",
  "rumah", "pagi", "sore", "makan", "pergi", "dia", "mereka", "kami", "kita",
]);
const ENGLISH_WORDS = new Set([
  "the", "and", "is", "are", "was", "were", "to", "of", "in", "on", "at",
  "what", "who", "why", "how", "you", "your", "he", "she", "they", "with",
  "for", "because", "then", "has", "have", "a", "an", "it", "this", "that",
]);

export function guessTextLanguage(text: string): Language {
  let indonesian = 0;
  let english = 0;
  for (const word of text.toLowerCase().match(/[a-z]+/g) ?? []) {
    if (INDONESIAN_WORDS.has(word)) indonesian++;
    if (ENGLISH_WORDS.has(word)) english++;
  }
  return english > indonesian ? "en" : "id";
}
