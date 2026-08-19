"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useGameStore } from "@/stores/game-store";
import { shuffle } from "@/lib/game/shuffle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import type { GameCard, CardType, CardDifficulty, SpecialCardKind } from "@flipcard/types";

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
  sections,
}: {
  deckId: string;
  deckName: string;
  sections: Section[];
}) {
  const router = useRouter();
  const startSession = useGameStore((s) => s.startSession);

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id))
  );
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

    if (fetchError || !cards || cards.length === 0) {
      setError(fetchError?.message ?? "Tidak ada kartu tersedia.");
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

    startSession(deckId, deckName, selectedSlugs, shuffled);
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
          className="w-full rounded-full shadow-lg"
        >
          {loading
            ? "Menyiapkan kartu..."
            : `Mulai Main (${totalCards} kartu)`}
        </Button>
      </div>
    </div>
  );
}
