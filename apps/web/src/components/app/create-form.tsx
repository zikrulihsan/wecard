import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { invalidateAiAccess } from "@/lib/ai/access-client";
import { DECK_MODES, type DeckMode } from "@flipcard/types";
import { DECK_MODE_META } from "@/lib/deck-mode";
import { cn } from "@/lib/utils";
import {
  DEPTHS,
  KNOWLEDGE_DEPTH_LABELS,
  MAX_CARDS_PER_SECTION,
  MAX_SECTIONS,
  MIN_CARDS_PER_SECTION,
  MIN_SECTIONS,
  TONES,
  audiencesForMode,
  getAudiencePlaceholders,
  isKnowledgeMix,
} from "@/lib/ai/deck-schema";

/** Isi kartu (`cardMix` di API) untuk tiap jenis deck. */
function cardMixFor(mode: DeckMode, withChallenges: boolean) {
  switch (mode) {
    case "ngobrol": return withChallenges ? "campuran" : "talk";
    case "tantangan": return "action";
    case "kuis": return "kuis";
    case "mendengar": return "mendengar";
  }
}

interface CreateFormProps {
  /** Sisa jatah akun ini; null berarti tanpa batas. */
  remaining: number | null;
  limit: number | null;
}

export function CreateForm({ remaining, limit }: CreateFormProps) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [audience, setAudience] = useState<string>("pasangan");
  const [tone, setTone] = useState<string>("santai");
  const [depth, setDepth] = useState<string>("sedang");
  const language = "id";
  const [deckName, setDeckName] = useState("");
  const [sectionCount, setSectionCount] = useState(3);
  const [cardsPerSection, setCardsPerSection] = useState(10);
  const [mode, setMode] = useState<DeckMode>("ngobrol");
  const [withChallenges, setWithChallenges] = useState(true);
  const cardMix = cardMixFor(mode, withChallenges);
  const audiences = audiencesForMode(mode);

  function chooseMode(next: DeckMode) {
    setMode(next);
    // Pemain yang tidak cocok dengan jenis baru (misal pasangan di kuis)
    // diganti pilihan pertama jenis itu.
    const options = audiencesForMode(next);
    if (!options.some((option) => option.value === audience)) {
      setAudience(options[0].value);
    }
  }
  const [includeSpecial, setIncludeSpecial] = useState(false);
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [avoid, setAvoid] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) throw new Error("Belum login");
      const response = await fetch("/api/decks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          audience,
          tone,
          depth,
          language,
          deckName: deckName.trim() || undefined,
          sectionCount,
          cardsPerSection,
          cardMix,
          // Kartu special dan topik hanya berlaku di jenis deck masing-masing.
          includeSpecial: knowledge ? false : includeSpecial,
          topic: knowledge ? topic.trim() || undefined : undefined,
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

      // Jatah baru saja berkurang; status di nav ikut diperbarui.
      invalidateAiAccess();
      navigate(`/play/${data.categoryId}`);
    } catch {
      setError("Koneksi bermasalah. Coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  }

  const totalCards = sectionCount * cardsPerSection;
  const placeholders = getAudiencePlaceholders(audience);
  const knowledge = isKnowledgeMix(cardMix);
  const listening = cardMix === "mendengar";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-1.5" disabled={isGenerating}>
        <legend className="mb-1.5 text-sm font-medium">Mau main apa?</legend>
        <div role="radiogroup" aria-label="Jenis deck" className="grid grid-cols-2 gap-2">
          {DECK_MODES.map((value) => {
            const meta = DECK_MODE_META[value];
            const selected = mode === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => chooseMode(value)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors disabled:opacity-50",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-neutral-200 hover:bg-neutral-50",
                )}
              >
                <span className="block text-sm font-medium">{meta.emoji} {meta.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{meta.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {mode === "ngobrol" && (
        <Label className="items-start gap-3 -mt-2">
          <Checkbox
            checked={withChallenges}
            onCheckedChange={(checked) => setWithChallenges(checked === true)}
            disabled={isGenerating}
          />
          <span className="font-normal">
            Selipkan tantangan — sekitar sepertiga kartu.
          </span>
        </Label>
      )}

      {knowledge && (
        <Field
          label={listening ? "Tema cerita (opsional)" : "Topik"}
          hint={
            listening
              ? "Kosongkan untuk cerita sehari-hari di rumah dan sekolah."
              : "Bidang yang mau diuji. Kosongkan untuk pengetahuan umum."
          }
        >
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={120}
            placeholder={
              listening
                ? "Misal: hewan di kebun binatang"
                : "Misal: AI Engineering, tata surya, sejarah Islam"
            }
            disabled={isGenerating}
          />
        </Field>
      )}

      <Field
        label={knowledge ? "Siapa yang main?" : "Mau dimainkan sama siapa?"}
        hint={
          knowledge
            ? "Menentukan kosakata dan tingkat soalnya."
            : "Menentukan sudut pandang dan gaya pertanyaannya."
        }
      >
        <Select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          disabled={isGenerating}
        >
          {audiences.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      {!knowledge && (
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
      )}

      <Field
        label={knowledge ? "Tingkat kesulitan" : "Kedalaman"}
        hint={
          knowledge
            ? "Level bintang kartunya. Section berikutnya makin sulit."
            : "Seberapa personal pertanyaannya boleh masuk."
        }
      >
        <Select
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
          disabled={isGenerating}
        >
          {DEPTHS.map((option) => (
            <option key={option.value} value={option.value}>
              {knowledge ? KNOWLEDGE_DEPTH_LABELS[option.value] : option.label}
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

      {!knowledge && (
        <div className="space-y-3">
          <Label className="items-start gap-3">
            <Checkbox
              checked={includeSpecial}
              onCheckedChange={(checked) => setIncludeSpecial(checked === true)}
              disabled={isGenerating}
            />
            <span className="font-normal">
              Sertakan kartu <strong>Special</strong> — Free Pass, Switch,
              Double.
            </span>
          </Label>
        </div>
      )}

      <Field label="Nama deck" hint="Kosongkan kalau mau dibuatkan AI.">
        <Input
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          maxLength={60}
          placeholder={placeholders.deckName}
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
          placeholder={placeholders.context}
          disabled={isGenerating}
        />
      </Field>

      <Field label="Topik yang dihindari">
        <Textarea
          value={avoid}
          onChange={(e) => setAvoid(e.target.value)}
          maxLength={300}
          rows={2}
          placeholder={placeholders.avoid}
          disabled={isGenerating}
        />
      </Field>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {/* Sisa jatah ditaruh tepat di atas tombol — di sinilah keputusan
          "generate sekarang atau nanti" benar-benar diambil. */}
      <p className="text-sm text-muted-foreground text-center">
        {remaining === null ? (
          "Kamu bisa membuat deck AI tanpa batas."
        ) : (
          <>
            Sisa jatah: <strong>{remaining}</strong> dari {limit} deck AI.
            {remaining === 1 && " Ini kesempatan terakhirmu, pikirkan baik-baik."}
          </>
        )}
      </p>

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
