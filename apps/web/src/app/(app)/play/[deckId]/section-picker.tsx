"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/stores/game-store";
import { shuffle } from "@/lib/game/shuffle";
import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import type {
  CardTimerSettings,
  GameCard,
  CardType,
  CardDifficulty,
  DeckTheme,
  SpecialCardKind,
} from "@flipcard/types";

// Pilihan durasi timer per kartu, dalam detik. 0 = tanpa timer.
const TIMER_OPTIONS = [0, 30, 60, 90, 120, 180] as const;

// Pilihan terakhir diingat di perangkat ini supaya tidak perlu diatur ulang
// setiap main. Gagal baca/tulis (mode privat, storage diblokir) tidak apa-apa.
const TIMER_STORAGE_KEY = "flipcard-timer-settings";

const DEFAULT_TIMER: CardTimerSettings = { seconds: 0, autoAdvance: false };

// Dibaca lewat useSyncExternalStore supaya render server (tanpa localStorage)
// dan hidrasi tetap sama; nilai tersimpan baru dipakai setelahnya. Snapshot-nya
// string mentah agar stabil antar-render.
const noopSubscribe = () => () => {};

function readStoredTimer(): string | null {
  try {
    return localStorage.getItem(TIMER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function parseTimerSettings(raw: string | null): CardTimerSettings {
  if (!raw) return DEFAULT_TIMER;
  try {
    const parsed = JSON.parse(raw) as Partial<CardTimerSettings>;
    return {
      seconds: TIMER_OPTIONS.includes(
        parsed.seconds as (typeof TIMER_OPTIONS)[number]
      )
        ? (parsed.seconds as number)
        : 0,
      autoAdvance: parsed.autoAdvance === true,
    };
  } catch {
    return DEFAULT_TIMER;
  }
}

function saveTimerSettings(settings: CardTimerSettings) {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // abaikan
  }
}

function timerLabel(seconds: number) {
  if (seconds === 0) return "Mati";
  if (seconds < 60) return `${seconds} dtk`;
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? `${minutes} mnt` : `${seconds} dtk`;
}

interface Section {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  cardCount: number;
}

export function SectionPicker({
  deckId,
  deckName,
  deckTheme,
  sections,
}: {
  deckId: string;
  deckName: string;
  deckTheme: DeckTheme;
  sections: Section[];
}) {
  const router = useRouter();
  const startSession = useGameStore((s) => s.startSession);

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id))
  );
  const storedTimer = useSyncExternalStore(
    noopSubscribe,
    readStoredTimer,
    () => null
  );
  // null = belum diubah di halaman ini, pakai pilihan terakhir yang tersimpan.
  const [timerOverride, setTimerOverride] = useState<CardTimerSettings | null>(
    null
  );
  const timer = timerOverride ?? parseTimerSettings(storedTimer);
  const setTimer = (update: (t: CardTimerSettings) => CardTimerSettings) =>
    setTimerOverride(update(timer));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCards = useMemo(() => {
    return sections
      .filter((s) => selected.has(s.id))
      .reduce((sum, s) => sum + s.cardCount, 0);
  }, [selected, sections]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function onStart() {
    if (selected.size === 0) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const sectionIds = Array.from(selected);
    const selectedSlugs = sections
      .filter((s) => selected.has(s.id))
      .map((s) => s.slug);

    const { data: cards, error: fetchError } = await supabase
      .from("cards")
      .select(
        `
        id,
        content_text,
        card_type,
        difficulty,
        special_kind,
        sort_order,
        section:sections(name, slug)
      `
      )
      .in("section_id", sectionIds)
      .order("sort_order", { ascending: true });

    if (fetchError) {
      // Pesan mentah PostgREST pernah tampil apa adanya di layar pemain —
      // termasuk "TypeError: Failed to fetch" saat jaringan putus, yang tidak
      // berarti apa-apa bagi mereka. Aslinya tetap ada di konsol browser
      // untuk ditelusuri.
      console.error("[play] gagal mengambil kartu", fetchError);
      setError("Kartunya gagal diambil. Cek sambunganmu, lalu coba lagi.");
      setLoading(false);
      return;
    }

    if (!cards || cards.length === 0) {
      setError("Level ini belum ada kartunya. Coba pilih level lain.");
      setLoading(false);
      return;
    }

    const gameCards: GameCard[] = cards.map((c) => {
      const section = Array.isArray(c.section) ? c.section[0] : c.section;
      return {
        id: c.id,
        content: c.content_text,
        cardType: c.card_type as CardType,
        difficulty: c.difficulty as CardDifficulty,
        specialKind: c.special_kind as SpecialCardKind | null,
        sectionName: section?.name ?? "",
        sectionSlug: section?.slug ?? "",
      };
    });

    const shuffled = shuffle(gameCards);

    saveTimerSettings(timer);
    startSession(deckId, deckName, deckTheme, selectedSlugs, shuffled, timer);
    router.push(`/play/${deckId}/session`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-3">Pilih Level</h2>
        <div className="space-y-2">
          {sections.map((section) => {
            const isSelected = selected.has(section.id);
            return (
              <Card
                key={section.id}
                className="p-4 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => toggle(section.id)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggle(section.id)}
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {section.cardCount} kartu
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-1.5">
          <Timer className="size-4" />
          Timer per Kartu
        </h2>
        <Card className="p-4 space-y-4">
          <div
            role="radiogroup"
            aria-label="Durasi timer per kartu"
            className="grid grid-cols-3 gap-2"
          >
            {TIMER_OPTIONS.map((seconds) => {
              const active = timer.seconds === seconds;
              return (
                <button
                  key={seconds}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTimer((t) => ({ ...t, seconds }))}
                  className={cn(
                    "h-9 rounded-full border text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:border-primary/40"
                  )}
                >
                  {timerLabel(seconds)}
                </button>
              );
            })}
          </div>

          {timer.seconds > 0 && (
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={timer.autoAdvance}
                onCheckedChange={(checked) =>
                  setTimer((t) => ({ ...t, autoAdvance: checked === true }))
                }
                className="mt-0.5"
              />
              <span className="text-sm">
                <span className="font-medium">Otomatis lanjut</span>
                <span className="block text-xs text-muted-foreground">
                  Pindah ke kartu berikutnya begitu waktunya habis.
                </span>
              </span>
            </label>
          )}

          <p className="text-xs text-muted-foreground">
            {timer.seconds > 0
              ? "Timer mulai berjalan saat kartu dibuka. Ketuk timernya untuk jeda."
              : "Tanpa batas waktu — ngobrol sepuasnya."}
          </p>
        </Card>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      <div className="sticky bottom-24 pt-4">
        <Button
          onClick={onStart}
          disabled={selected.size === 0 || loading || totalCards === 0}
          size="lg"
          className={cn(
            // Warna deck dibawa sampai ke tombol mulai supaya halaman ini
            // tidak terasa lepas dari sampulnya di beranda.
            "w-full rounded-full shadow-lg bg-gradient-to-r text-white hover:opacity-95",
            DECK_THEME_STYLES[deckTheme].card
          )}
        >
          {loading
            ? "Menyiapkan kartu..."
            : `Mulai Main (${totalCards} kartu)`}
        </Button>
      </div>
    </div>
  );
}
