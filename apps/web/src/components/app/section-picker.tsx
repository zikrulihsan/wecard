import { useState, useMemo, useSyncExternalStore } from "react";
import { Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/stores/game-store";
import { shuffle } from "@/lib/game/shuffle";
import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import { cn } from "@/lib/utils";
import { toGameCards } from "@/lib/cards/to-game-cards";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { markDeckPlayed } from "@/lib/recent-decks";
import { useT } from "@/lib/i18n";
import { TimerFields } from "@/components/game/timer-fields";
import {
  parseTimerSettings,
  readStoredTimer,
  saveTimerSettings,
} from "@/lib/game/timer-settings";
import type {
  CardTimerSettings,
  DeckLanguage,
  DeckTheme,
} from "@flipcard/types";

// Dibaca lewat useSyncExternalStore supaya render server (tanpa localStorage)
// dan hidrasi tetap sama; nilai tersimpan baru dipakai setelahnya. Snapshot-nya
// string mentah agar stabil antar-render.
const noopSubscribe = () => () => {};

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
  deckLanguage,
  sections,
}: {
  deckId: string;
  deckName: string;
  deckTheme: DeckTheme;
  deckLanguage: DeckLanguage;
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
      .eq("is_hidden", false)
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

    const gameCards = toGameCards(cards.map((c) => {
      const section = Array.isArray(c.section) ? c.section[0] : c.section;
      return { ...c, section_name: section?.name ?? "", section_slug: section?.slug ?? "" };
    }));

    if (gameCards.length === 0) {
      setError(t.picker.unsupported);
      setLoading(false);
      return;
    }

    const shuffled = shuffle(gameCards);

    saveTimerSettings(timer);
    startSession(deckId, deckName, deckTheme, deckLanguage, selectedSlugs, shuffled, timer);
    markDeckPlayed(deckId);
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
          <TimerFields value={timer} onChange={setTimerOverride} />

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
