import { Link } from "react-router-dom";
import { ChevronRight, FilePen, Sparkles } from "lucide-react";
import { useAiAccess } from "@/lib/ai/access-client";
import { useT } from "@/lib/i18n";

/**
 * Tombol "Buat dengan AI" di beranda. Tombolnya tampil sejak render pertama
 * — dengan saldo tersimpan kalau ada, atau tanpa angka saldo selagi dibaca —
 * supaya tidak ada ruang kosong yang tiba-tiba terisi. Varian lain (draf
 * terbuka, saldo habis) menggantikannya begitu statusnya diketahui.
 */
export function AiDeckCta() {
  const t = useT();
  const { access } = useAiAccess();
  if (access && !access.enabled) return null;
  if (access?.openDraftId) return (
    <Link to={`/create/${access.openDraftId}`} className="mb-6 flex min-h-[74px] items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 transition-shadow hover:shadow-md">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm"><FilePen className="size-4" /></span>
      <div className="min-w-0 flex-1"><p className="font-medium text-sm">{t.home.draftTitle}</p><p className="text-sm text-muted-foreground">{t.home.draftBody}</p></div>
      <ChevronRight className="size-4 shrink-0 text-neutral-400" />
    </Link>
  );
  if (access && !access.canGenerate) return (
    <Link to="/store" className="mb-6 flex min-h-[74px] items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-shadow hover:shadow-md">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500"><Sparkles className="size-4" /></span>
      <div className="min-w-0 flex-1"><p className="font-medium text-sm">{t.home.aiSpentTitle}</p><p className="text-sm text-muted-foreground">{t.home.aiSpentBody}</p></div>
      <ChevronRight className="size-4 shrink-0 text-neutral-400" />
    </Link>
  );
  return (
    <Link to="/create" className="mb-6 flex min-h-[74px] items-center gap-3 rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-4 transition-shadow hover:shadow-md">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm"><Sparkles className="size-4" /></span>
      <div className="min-w-0 flex-1"><p className="font-medium text-sm">{t.home.aiCtaTitle}</p><p className="text-sm text-muted-foreground">{!access ? t.home.aiCtaSubtitle : access.unlimited ? t.home.aiCtaUnlimited : t.home.aiCtaBalance(access.balance)}</p></div>
      <ChevronRight className="size-4 shrink-0 text-neutral-400" />
    </Link>
  );
}
