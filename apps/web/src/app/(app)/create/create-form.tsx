"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AUDIENCES,
  DEPTHS,
  MAX_CARDS_PER_SECTION,
  MAX_SECTIONS,
  MIN_CARDS_PER_SECTION,
  MIN_SECTIONS,
  TONES,
} from "@/lib/ai/deck-schema";

export function CreateForm() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [audience, setAudience] = useState<string>("pasangan");
  const [tone, setTone] = useState<string>("santai");
  const [depth, setDepth] = useState<string>("sedang");
  const [language, setLanguage] = useState<string>("id");
  const [deckName, setDeckName] = useState("");
  const [sectionCount, setSectionCount] = useState(3);
  const [cardsPerSection, setCardsPerSection] = useState(10);
  const [includeAction, setIncludeAction] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(false);
  const [context, setContext] = useState("");
  const [avoid, setAvoid] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/decks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience,
          tone,
          depth,
          language,
          deckName: deckName.trim() || undefined,
          sectionCount,
          cardsPerSection,
          includeAction,
          includeSpecial,
          context: context.trim() || undefined,
          avoid: avoid.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // `hint`/`detail` hanya dikirim server di luar production.
        setError(
          [data.error, data.hint, data.detail]
            .filter(Boolean)
            .join(" — ") || "Gagal membuat deck. Coba lagi."
        );
        return;
      }

      router.push(`/play/${data.categoryId}`);
      router.refresh();
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  }

  const totalCards = sectionCount * cardsPerSection;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field
        label="Mau dimainkan sama siapa?"
        hint="Menentukan sudut pandang dan gaya pertanyaannya."
      >
        <Select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          disabled={isGenerating}
        >
          {AUDIENCES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Nuansa kartu">
        <Select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          disabled={isGenerating}
        >
          {TONES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Kedalaman"
        hint="Seberapa personal pertanyaannya boleh masuk."
      >
        <Select
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
          disabled={isGenerating}
        >
          {DEPTHS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Jumlah section">
          <Input
            type="number"
            min={MIN_SECTIONS}
            max={MAX_SECTIONS}
            value={sectionCount}
            onChange={(e) => setSectionCount(Number(e.target.value))}
            disabled={isGenerating}
          />
        </Field>
        <Field label="Kartu per section">
          <Input
            type="number"
            min={MIN_CARDS_PER_SECTION}
            max={MAX_CARDS_PER_SECTION}
            value={cardsPerSection}
            onChange={(e) => setCardsPerSection(Number(e.target.value))}
            disabled={isGenerating}
          />
        </Field>
      </div>

      <p className="text-sm text-muted-foreground -mt-3">
        Total {totalCards} kartu.
      </p>

      <div className="space-y-3">
        <Label className="items-start gap-3">
          <Checkbox
            checked={includeAction}
            onCheckedChange={(checked) => setIncludeAction(checked === true)}
            disabled={isGenerating}
          />
          <span className="font-normal">
            Sertakan kartu <strong>Action</strong> — tantangan yang dikerjakan
            langsung, bukan cuma dijawab.
          </span>
        </Label>
        <Label className="items-start gap-3">
          <Checkbox
            checked={includeSpecial}
            onCheckedChange={(checked) => setIncludeSpecial(checked === true)}
            disabled={isGenerating}
          />
          <span className="font-normal">
            Sertakan kartu <strong>Special</strong> — Free Pass, Switch, Double.
          </span>
        </Label>
      </div>

      <Field label="Nama deck" hint="Kosongkan kalau mau dibuatkan AI.">
        <Input
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          maxLength={60}
          placeholder="Misal: Malam Jumat Berdua"
          disabled={isGenerating}
        />
      </Field>

      <Field
        label="Konteks tambahan"
        hint="Situasi spesifik yang bikin kartunya lebih pas. Jangan isi data pribadi."
      >
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Misal: kami LDR sudah 2 tahun dan baru ketemu sebulan sekali"
          disabled={isGenerating}
        />
      </Field>

      <Field label="Topik yang dihindari">
        <Textarea
          value={avoid}
          onChange={(e) => setAvoid(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="Misal: mantan, kerjaan, politik"
          disabled={isGenerating}
        />
      </Field>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Lagi bikin kartunya…
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            Generate deck
          </>
        )}
      </Button>

      {isGenerating && (
        <p className="text-sm text-muted-foreground text-center">
          Butuh sekitar 20–40 detik. Jangan tutup halaman ini.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
