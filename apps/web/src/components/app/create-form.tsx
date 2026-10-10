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
  MAX_CARDS_PER_SECTION,
  MAX_SECTIONS,
  MIN_CARDS_PER_SECTION,
  MIN_SECTIONS,
  audiencesForMode,
  isKnowledgeMix,
} from "@/lib/ai/deck-schema";
import { LANGUAGES, isLanguage, useI18n, type Language } from "@/lib/i18n";
import type { Messages } from "@/lib/i18n/messages/id";

type ErrorCode = keyof Messages["create"]["errors"];

/**
 * Pesan error server dalam bahasa aplikasi. Server tetap mengirim pesan
 * aslinya (bahasa Indonesia) — dipakai kalau kodenya belum dikenal versi ini.
 */
function errorMessage(
  t: Messages["create"],
  data: { error?: string; code?: string; limit?: number | null }
): string | undefined {
  const code = data.code as ErrorCode | undefined;
  if (code === "daily_limit") return t.errors.daily_limit(data.limit ?? null);
  if (code && code in t.errors) {
    const message = t.errors[code];
    if (typeof message === "string") return message;
  }
  return data.error;
}

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
  /** Saldo kredit akun ini; null berarti tanpa batas. */
  balance: number | null;
}

export function CreateForm({ balance }: CreateFormProps) {
  const { t: messages, language: appLanguage } = useI18n();
  const t = messages.create;
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [audience, setAudience] = useState<string>("pasangan");
  const [tone, setTone] = useState<string>("santai");
  const [depth, setDepth] = useState<string>("sedang");
  // Bawaannya ikut bahasa aplikasi, tapi bisa dipilih terpisah — orang
  // Indonesia bisa saja ingin deck kuis bahasa Inggris untuk belajar.
  const [language, setLanguage] = useState<Language>(appLanguage);
  const [deckName, setDeckName] = useState("");
  const [sectionCount, setSectionCount] = useState(3);
  const [cardsPerSection, setCardsPerSection] = useState(10);
  const [mode, setMode] = useState<DeckMode>("ngobrol");
  const [withChallenges, setWithChallenges] = useState(true);
  const cardMix = cardMixFor(mode, withChallenges);
  const audiences = audiencesForMode(mode).map((value) => ({
    value,
    label:
      t.audienceModeLabels[value]?.[mode] ??
      t.audiences.find((option) => option.value === value)?.label ??
      value,
  }));

  function chooseMode(next: DeckMode) {
    setMode(next);
    // Pemain yang tidak cocok dengan jenis baru (misal pasangan di kuis)
    // diganti pilihan pertama jenis itu.
    const options = audiencesForMode(next);
    if (!options.includes(audience)) setAudience(options[0]);
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

      if (response.status === 409 && data.code === "draft_open" && data.draftId) {
        navigate(`/create/${data.draftId}`);
        return;
      }

      if (!response.ok) {
        // `hint`/`detail` hanya dikirim server di luar production.
        setError(
          [errorMessage(t, data), data.hint, data.detail]
            .filter(Boolean)
            .join(" — ") || t.form.genericError
        );
        return;
      }

      // Ada draf terbuka sekarang; beranda & nav ikut diperbarui.
      invalidateAiAccess();
      navigate(`/create/${data.categoryId}`);
    } catch {
      setError(t.form.connectionError);
    } finally {
      setIsGenerating(false);
    }
  }

  const totalCards = sectionCount * cardsPerSection;
  const placeholders = t.placeholders[audience] ?? t.placeholders.pasangan;
  const knowledge = isKnowledgeMix(cardMix);
  const listening = cardMix === "mendengar";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="space-y-1.5" disabled={isGenerating}>
        <legend className="mb-1.5 text-sm font-medium">{t.form.modeLegend}</legend>
        <div role="radiogroup" aria-label={t.form.modeGroup} className="grid grid-cols-2 gap-2">
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
                <span className="block text-sm font-medium">{meta.emoji} {messages.modes[value].label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{messages.modes[value].hint}</span>
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
            {t.form.withChallenges}
          </span>
        </Label>
      )}

      {knowledge && (
        <Field
          label={listening ? t.form.storyTheme : t.form.topic}
          hint={listening ? t.form.storyHint : t.form.topicHint}
        >
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={120}
            placeholder={
              listening ? t.form.storyPlaceholder : t.form.topicPlaceholder
            }
            disabled={isGenerating}
          />
        </Field>
      )}

      <Field
        label={knowledge ? t.form.audienceKnowledge : t.form.audience}
        hint={knowledge ? t.form.audienceKnowledgeHint : t.form.audienceHint}
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

      <Field label={t.form.cardLanguage} hint={t.form.cardLanguageHint}>
        <Select
          value={language}
          onChange={(e) => {
            if (isLanguage(e.target.value)) setLanguage(e.target.value);
          }}
          disabled={isGenerating}
        >
          {LANGUAGES.map((option) => (
            <option key={option} value={option}>
              {t.languages[option]}
            </option>
          ))}
        </Select>
      </Field>

      {!knowledge && (
        <Field label={t.form.tone}>
          <Select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            disabled={isGenerating}
          >
            {t.tones.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field
        label={knowledge ? t.form.difficulty : t.form.depth}
        hint={knowledge ? t.form.difficultyHint : t.form.depthHint}
      >
        <Select
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
          disabled={isGenerating}
        >
          {t.depths.map((option) => (
            <option key={option.value} value={option.value}>
              {knowledge ? t.knowledgeDepths[option.value] : option.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t.form.sectionCount}>
          <Input
            type="number"
            min={MIN_SECTIONS}
            max={MAX_SECTIONS}
            value={sectionCount}
            onChange={(e) => setSectionCount(Number(e.target.value))}
            disabled={isGenerating}
          />
        </Field>
        <Field label={t.form.cardsPerSection}>
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
        {t.form.total(totalCards)}
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
              {t.form.specialLead} <strong>{t.form.specialStrong}</strong>{" "}
              {t.form.specialRest}
            </span>
          </Label>
        </div>
      )}

      <Field label={t.form.deckName} hint={t.form.deckNameHint}>
        <Input
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          maxLength={60}
          placeholder={placeholders.deckName}
          disabled={isGenerating}
        />
      </Field>

      <Field label={t.form.context} hint={t.form.contextHint}>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder={placeholders.context}
          disabled={isGenerating}
        />
      </Field>

      <Field label={t.form.avoid}>
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

      {/* Saldo ditaruh tepat di atas tombol — di sinilah keputusan
          "generate sekarang atau nanti" benar-benar diambil. */}
      <p className="text-sm text-muted-foreground text-center">
        {balance === null ? t.form.balanceUnlimited : (
          <>
            <strong>{t.form.balance(balance)}</strong> {t.form.balanceHint}
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
            {t.form.generating}
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            {t.form.generate}
          </>
        )}
      </Button>

      {isGenerating && (
        <p className="text-sm text-muted-foreground text-center">
          {t.form.waitHint}
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
