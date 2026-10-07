import { useState, useMemo, useSyncExternalStore } from "react";
import { Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/stores/game-store";
import { shuffle } from "@/lib/game/shuffle";
import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import { cn } from "@/lib/utils";
import {
  hasAnswerSide,
  isCardType,
  parseCardDetails,
  toCardLevel,
} from "@/lib/cards/formats";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import type { Messages } from "@/lib/i18n/messages/id";
import type {
  CardTimerSettings,
  GameCard,
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

function timerLabel(seconds: number, t: Messages["picker"]) {
  if (seconds === 0) return t.timerOff;
  if (seconds < 60) return t.seconds(seconds);
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? t.minutes(minutes) : t.seconds(seconds);
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
  const t = useT();
  const navigate = useNavigate();
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
        details,
        level,
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
      setError(t.picker.fetchFailed);
      setLoading(false);
      return;
    }

    if (!cards || cards.length === 0) {
      setError(t.picker.emptyLevel);
      setLoading(false);
      return;
    }

    const gameCards: GameCard[] = cards.flatMap((c) => {
      const section = Array.isArray(c.section) ? c.section[0] : c.section;
      // Format yang belum dikenal versi aplikasi ini dilewati, begitu juga
      // kartu kuis yang isinya tidak lengkap — keduanya tidak bisa dimainkan.
      if (!isCardType(c.card_type)) return [];
      const cardType = c.card_type;
      const details = parseCardDetails(cardType, c.details);
      if (hasAnswerSide(cardType) && !details) return [];
      return [
        {
          id: c.id,
          content: c.content_text,
          cardType,
          difficulty: c.difficulty as CardDifficulty,
          specialKind: c.special_kind as SpecialCardKind | null,
          details,
          level: toCardLevel(c.level),
          sectionName: section?.name ?? "",
          sectionSlug: section?.slug ?? "",
        },
      ];
    });

    if (gameCards.length === 0) {
      setError(t.picker.unsupported);
      setLoading(false);
      return;
    }

    const shuffled = shuffle(gameCards);

    saveTimerSettings(timer);
    startSession(deckId, deckName, deckTheme, selectedSlugs, shuffled, timer);
    navigate(`/play/${deckId}/session`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold mb-3">{t.picker.chooseLevel}</h2>
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
                        {t.common.cards(section.cardCount)}
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
          {t.picker.timerTitle}
        </h2>
        <Card className="p-4 space-y-4">
          <div
            role="radiogroup"
            aria-label={t.picker.timerGroup}
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
                  {timerLabel(seconds, t.picker)}
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
                <span className="font-medium">{t.picker.autoAdvance}</span>
                <span className="block text-xs text-muted-foreground">
                  {t.picker.autoAdvanceHint}
                </span>
              </span>
            </label>
          )}

          <p className="text-xs text-muted-foreground">
            {timer.seconds > 0
              ? t.picker.timerOnHint
              : t.picker.timerOffHint}
          </p>
        </Card>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* Menempel tepat di atas bottom nav dengan latar solid + gradasi di
          atasnya, supaya isi yang ter-scroll di belakangnya (daftar level,
          pilihan timer) memudar alih-alih tampil tumpang tindih. */}
      <div
        className="sticky z-10 -mx-4 px-4 pt-6 pb-3 bg-gradient-to-t from-background from-70% to-transparent"
        style={{ bottom: "var(--bottom-nav-h)" }}
      >
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
            ? t.picker.preparing
            : t.picker.start(totalCards)}
        </Button>
      </div>
    </div>
  );
}
