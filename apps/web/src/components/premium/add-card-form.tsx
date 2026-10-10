import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n";

/**
 * Tambah kartu sendiri ke deck milik sendiri (versi pribadi deck premium,
 * salinan, atau hadiah). Ditulis langsung lewat RLS "Insert cards in own
 * categories" — tidak memakai kredit.
 */
export function AddCardForm({
  sections,
  onAdded,
}: {
  sections: { id: string; name: string; cardCount: number }[];
  onAdded: () => void;
}) {
  const t = useT();
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? "");
  const [cardType, setCardType] = useState<"talk" | "action">("talk");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (sections.length === 0) return null;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = content.trim();
    if (!text || !sectionId) return;
    setBusy(true);
    setMessage(null);
    const section = sections.find((item) => item.id === sectionId);
    const { error } = await createClient().from("cards").insert({
      section_id: sectionId,
      card_type: cardType,
      difficulty: "medium",
      content_text: text,
      is_free_preview: true,
      sort_order: (section?.cardCount ?? 0) + 1,
    });
    setBusy(false);
    if (error) {
      console.error("[deck] gagal menambah kartu", error);
      setMessage({ ok: false, text: t.premium.addCardFailed });
      return;
    }
    setContent("");
    setMessage({ ok: true, text: t.premium.addCardDone });
    onAdded();
  }

  return (
    <form onSubmit={submit} className="mb-6 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-2 font-semibold"><Plus className="size-4 text-primary" />{t.premium.addCardTitle}</p>
      <Textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={300} rows={2} placeholder={t.premium.addCardPlaceholder} disabled={busy} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>{t.premium.addCardSection}</Label>
          <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={busy}>
            {sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
          </Select>
        </div>
        <div className="space-y-1">
          <Label>{t.premium.addCardType}</Label>
          <Select value={cardType} onChange={(e) => setCardType(e.target.value === "action" ? "action" : "talk")} disabled={busy}>
            <option value="talk">{t.formats.talk.label}</option>
            <option value="action">{t.formats.action.label}</option>
          </Select>
        </div>
      </div>
      <Button type="submit" variant="outline" className="w-full rounded-full" disabled={busy || !content.trim()}>{t.premium.addCard}</Button>
      {message && <p role="status" className={message.ok ? "text-sm text-emerald-700" : "text-sm text-destructive"}>{message.text}</p>}
    </form>
  );
}
