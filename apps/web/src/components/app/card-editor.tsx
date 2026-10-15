import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import type { CardDetails, CardType, ListeningQuestion } from "@flipcard/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OPTION_LETTERS, hasAnswerSide, parseCardDetails } from "@/lib/cards/formats";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Batas isian, sama dengan yang dirapikan parseCardDetails. */
const LIMITS = { options: 6, clues: 5, items: 8, questions: 5 } as const;

type Draft = {
  content: string;
  answer: string;
  explanation: string;
  options: string[];
  correctIndex: number;
  isTrue: boolean;
  clues: string[];
  items: string[];
  questions: ListeningQuestion[];
};

function toDraft(type: CardType, content: string, raw: unknown): Draft {
  const details = parseCardDetails(type, raw) ?? {};
  return {
    content,
    answer: details.answer ?? "",
    explanation: details.explanation ?? "",
    options: details.options ?? ["", ""],
    correctIndex: details.correctIndex ?? 0,
    isTrue: details.isTrue ?? true,
    clues: details.clues ?? [""],
    items: details.items ?? ["", ""],
    questions: details.questions ?? [{ question: "", answer: "" }],
  };
}

/** Isian per format kembali ke bentuk `details`; field kosong dibuang parseCardDetails. */
function fromDraft(type: CardType, draft: Draft): unknown {
  const base = { explanation: draft.explanation };
  switch (type) {
    case "quiz": return { ...base, answer: draft.answer };
    case "multiple_choice": {
      // Pilihan kosong dibuang, jadi indeks jawaban ikut digeser.
      const kept = draft.options.map((text, index) => ({ text, index })).filter((item) => item.text.trim());
      return { ...base, options: kept.map((item) => item.text), correctIndex: kept.findIndex((item) => item.index === draft.correctIndex) };
    }
    case "true_false": return { ...base, isTrue: draft.isTrue };
    case "clue": return { ...base, clues: draft.clues, answer: draft.answer };
    case "ordering": return { ...base, items: draft.items };
    case "listening": return { ...base, questions: draft.questions };
    default: return null;
  }
}

/**
 * Edit manual satu kartu di halaman revisi. Format kartunya tetap — yang
 * diubah hanya teks dan isi jawabannya — supaya deck tetap sesuai jenisnya.
 */
export function CardEditor({
  type,
  content,
  details,
  onCancel,
  onSave,
}: {
  type: CardType;
  content: string;
  details: unknown;
  onCancel: () => void;
  onSave: (value: { content_text: string; details: CardDetails | null }) => Promise<void>;
}) {
  const t = useT();
  const e = t.review.editor;
  const [draft, setDraft] = useState(() => toDraft(type, content, details));
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setInvalid(false);
    setDraft((previous) => ({ ...previous, [key]: value }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.content.trim();
    const parsed = hasAnswerSide(type) ? parseCardDetails(type, fromDraft(type, draft)) : null;
    if (!text || (hasAnswerSide(type) && !parsed)) {
      setInvalid(true);
      return;
    }
    setBusy(true);
    await onSave({ content_text: text, details: parsed });
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1">
        <Label>{type === "listening" ? e.passage : type === "true_false" ? e.statement : e.content}</Label>
        <Textarea value={draft.content} onChange={(ev) => set("content", ev.target.value)} maxLength={type === "listening" ? 1200 : 400} rows={3} disabled={busy} autoFocus />
      </div>

      {type === "clue" && (
        <ListField label={e.clues} values={draft.clues} max={LIMITS.clues} addLabel={e.addClue} disabled={busy} onChange={(value) => set("clues", value)} />
      )}

      {(type === "quiz" || type === "clue") && (
        <div className="space-y-1">
          <Label>{e.answer}</Label>
          <Input value={draft.answer} onChange={(ev) => set("answer", ev.target.value)} maxLength={200} disabled={busy} />
        </div>
      )}

      {type === "multiple_choice" && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">{e.options}</legend>
          {draft.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => set("correctIndex", index)}
                aria-pressed={draft.correctIndex === index}
                aria-label={e.markCorrect(OPTION_LETTERS[index])}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  draft.correctIndex === index ? "border-emerald-500 bg-emerald-500 text-white" : "border-neutral-300 text-muted-foreground",
                )}
              >
                {OPTION_LETTERS[index]}
              </button>
              <Input value={option} maxLength={150} disabled={busy} onChange={(ev) => set("options", draft.options.map((item, i) => i === index ? ev.target.value : item))} />
              {draft.options.length > 2 && (
                <RemoveButton label={e.remove} disabled={busy} onClick={() => {
                  setInvalid(false);
                  setDraft((previous) => ({
                    ...previous,
                    options: previous.options.filter((_, i) => i !== index),
                    correctIndex: previous.correctIndex === index ? 0 : previous.correctIndex > index ? previous.correctIndex - 1 : previous.correctIndex,
                  }));
                }} />
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">{e.correctHint}</p>
          {draft.options.length < LIMITS.options && (
            <AddButton label={e.addOption} disabled={busy} onClick={() => set("options", [...draft.options, ""])} />
          )}
        </fieldset>
      )}

      {type === "true_false" && (
        <div className="space-y-1">
          <Label>{e.answer}</Label>
          <div className="flex gap-2">
            {[true, false].map((value) => (
              <Button key={String(value)} type="button" size="sm" variant={draft.isTrue === value ? "default" : "outline"} className="rounded-full" disabled={busy} onClick={() => set("isTrue", value)}>
                {value ? t.card.fact : t.card.myth}
              </Button>
            ))}
          </div>
        </div>
      )}

      {type === "ordering" && (
        <ListField label={e.items} hint={e.itemsHint} values={draft.items} max={LIMITS.items} min={2} numbered addLabel={e.addItem} disabled={busy} onChange={(value) => set("items", value)} />
      )}

      {type === "listening" && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">{e.questions}</legend>
          {draft.questions.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1 space-y-1.5 rounded-lg border border-neutral-200 p-2">
                <Input value={item.question} placeholder={e.question} maxLength={200} disabled={busy} onChange={(ev) => set("questions", draft.questions.map((q, i) => i === index ? { ...q, question: ev.target.value } : q))} />
                <Input value={item.answer} placeholder={e.answer} maxLength={200} disabled={busy} onChange={(ev) => set("questions", draft.questions.map((q, i) => i === index ? { ...q, answer: ev.target.value } : q))} />
              </div>
              {draft.questions.length > 1 && (
                <RemoveButton label={e.remove} disabled={busy} onClick={() => set("questions", draft.questions.filter((_, i) => i !== index))} />
              )}
            </div>
          ))}
          {draft.questions.length < LIMITS.questions && (
            <AddButton label={e.addQuestion} disabled={busy} onClick={() => set("questions", [...draft.questions, { question: "", answer: "" }])} />
          )}
        </fieldset>
      )}

      {hasAnswerSide(type) && (
        <div className="space-y-1">
          <Label>{e.explanation}</Label>
          <Textarea value={draft.explanation} onChange={(ev) => set("explanation", ev.target.value)} maxLength={400} rows={2} disabled={busy} placeholder={e.optional} />
        </div>
      )}

      {invalid && <p role="alert" className="text-sm text-destructive">{hasAnswerSide(type) ? e.invalidAnswer : e.invalidContent}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" className="rounded-full" disabled={busy} onClick={onCancel}>{e.cancel}</Button>
        <Button type="submit" size="sm" className="rounded-full" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy ? e.saving : e.save}
        </Button>
      </div>
    </form>
  );
}

function ListField({
  label, hint, values, max, min = 1, numbered, addLabel, disabled, onChange,
}: {
  label: string;
  hint?: string;
  values: string[];
  max: number;
  min?: number;
  numbered?: boolean;
  addLabel: string;
  disabled: boolean;
  onChange: (values: string[]) => void;
}) {
  const t = useT();
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-medium">{label}</legend>
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          {numbered && <span className="w-5 shrink-0 text-right text-xs font-semibold text-muted-foreground">{index + 1}.</span>}
          <Input value={value} maxLength={200} disabled={disabled} onChange={(ev) => onChange(values.map((item, i) => i === index ? ev.target.value : item))} />
          {values.length > min && <RemoveButton label={t.review.editor.remove} disabled={disabled} onClick={() => onChange(values.filter((_, i) => i !== index))} />}
        </div>
      ))}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {values.length < max && <AddButton label={addLabel} disabled={disabled} onClick={() => onChange([...values, ""])} />}
    </fieldset>
  );
}

function AddButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="flex items-center gap-1 text-sm font-medium text-primary disabled:opacity-50">
      <Plus className="size-3.5" />{label}
    </button>
  );
}

function RemoveButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} aria-label={label} className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-destructive disabled:opacity-50">
      <X className="size-4" />
    </button>
  );
}
