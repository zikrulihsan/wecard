import { useEffect, useState } from "react";
import { Check, Copy, Link2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareActions } from "@/components/share/share-actions";
import {
  countSharedPlays,
  fetchDeckShare,
  setDeckShare,
  shareUrl,
  type DeckShare,
} from "@/lib/share/api";
import { useT } from "@/lib/i18n";

/**
 * Panel pemilik deck custom: buat link main, salin/bagikan ke grup, dan
 * matikan kapan saja. Mematikan tidak menghapus link — menyalakannya lagi
 * memakai token yang sama, jadi link yang sudah tersebar di grup hidup lagi.
 */
export function DeckSharePanel({ deckId, deckName }: { deckId: string; deckName: string }) {
  const t = useT().share;
  // undefined = masih dibaca, null = belum pernah dibuat.
  const [share, setShare] = useState<DeckShare | null | undefined>(undefined);
  const [unavailable, setUnavailable] = useState(false);
  const [plays, setPlays] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetchDeckShare(deckId)
      .then((value) => { if (active) setShare(value); })
      .catch((err) => {
        // Tabelnya belum ada (migration 00009 belum jalan) atau jaringan
        // putus: panelnya disembunyikan, halaman deck tetap jalan.
        console.error("[share] gagal membaca link main", err);
        if (active) setUnavailable(true);
      });
    countSharedPlays(deckId)
      .then((value) => { if (active) setPlays(value); })
      .catch(() => {});
    return () => { active = false; };
  }, [deckId]);

  if (unavailable) return null;
  if (share === undefined) return <div aria-hidden className="mb-6 h-[124px]" />;

  async function toggle(enabled: boolean) {
    setBusy(true);
    setError(false);
    try {
      setShare(await setDeckShare(deckId, enabled));
    } catch (err) {
      console.error("[share] gagal mengubah link main", err);
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t.linkLabel, url);
    }
  }

  const url = share ? shareUrl(share.token) : "";

  return (
    <section aria-labelledby="share-panel-title" className="mb-6 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 id="share-panel-title" className="font-semibold">{t.panelTitle}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {!share ? t.panelBodyNew : share.enabled ? t.panelBodyOn : t.panelBodyOff}
          </p>
          {plays !== null && plays > 0 && <p className="text-xs font-medium text-primary">{t.plays(plays)}</p>}
        </div>
      </div>

      {share?.enabled ? (
        <>
          <div className="flex items-center gap-2 rounded-xl bg-neutral-50 py-1 pr-1 pl-3">
            <Link2 aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-sm" aria-label={t.linkLabel}>{url.replace(/^https?:\/\//, "")}</span>
            <Button type="button" size="sm" variant="ghost" className="shrink-0 rounded-full" onClick={() => copy(url)}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? t.copiedShort : t.copyLink}
            </Button>
          </div>
          <ShareActions text={t.inviteText(deckName)} url={url} label={t.inviteFriends} />
          <button
            type="button"
            disabled={busy}
            onClick={() => toggle(false)}
            className="w-full text-center text-sm text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
          >
            {t.turnOff}
          </button>
        </>
      ) : (
        <Button type="button" size="lg" variant="outline" disabled={busy} className="w-full rounded-full" onClick={() => toggle(true)}>
          {share ? t.turnOnAgain : t.turnOn}
        </Button>
      )}

      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{t.saveFailed}</p>}
    </section>
  );
}
