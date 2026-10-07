import { Link, useSearchParams } from "react-router-dom";
import { Check, Lock, Play, RotateCcw } from "lucide-react";
import { DECK_MODES, type DeckMode } from "@flipcard/types";
import { BackLink } from "@/components/nav/back-link";
import { buttonVariants } from "@/components/ui/button";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { DECK_MODE_META, isDeckMode } from "@/lib/deck-mode";
import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import { AI_TOPUP_PACK, formatIdr } from "@/lib/pricing";
import { useSignedIn } from "@/lib/supabase/use-signed-in";
import { TRIAL_DECKS, type TrialDeck } from "@/lib/trial/decks";
import { TRIAL_FREE_CARDS, freeCardCount, useTrialProgress } from "@/lib/trial/progress";
import { cn } from "@/lib/utils";

const MODES = DECK_MODES.filter((mode) => TRIAL_DECKS.some((deck) => deck.mode === mode));

/**
 * Pintu masuk "Coba gratis". Semua deck coba bisa dibuka tanpa akun, tapi
 * hanya {TRIAL_FREE_CARDS} kartu pertamanya; kartu sesudahnya terkunci di
 * dalam sesi dan membawa ke login. Deck dipisah per jenis (tab), sama seperti
 * beranda pemain yang sudah masuk.
 *
 * Bagian bawah menunjukkan tangganya terang-terangan: coba → akun gratis →
 * top-up, supaya tamu tahu apa yang didapat di tiap langkah.
 */
export default function TryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const signedIn = useSignedIn();
  const { seen } = useTrialProgress();

  const requested = searchParams.get("jenis");
  const activeMode: DeckMode =
    isDeckMode(requested) && MODES.includes(requested) ? requested : MODES[0];
  const decks = TRIAL_DECKS.filter((deck) => deck.mode === activeMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="mx-auto max-w-screen-sm px-4 py-6">
        <BackLink href={signedIn ? "/home" : "/"}>Beranda</BackLink>

        <header className="mb-5 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {signedIn ? "Deck coba, terbuka penuh" : "Coba semua deck, gratis"}
          </h1>
          <p className="text-neutral-600">
            {signedIn ? (
              "Kamu sudah masuk, jadi semua kartu di sini bisa dimainkan sampai habis."
            ) : (
              <>
                Pilih jenisnya, lalu mainkan{" "}
                <strong className="font-semibold text-neutral-800">
                  {TRIAL_FREE_CARDS} kartu pertama
                </strong>{" "}
                tiap deck tanpa daftar. Suka? Masuk untuk lanjut sampai habis.
              </>
            )}
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Jenis deck"
          className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]"
        >
          {MODES.map((mode) => {
            const selected = mode === activeMode;
            const meta = DECK_MODE_META[mode];
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setSearchParams({ jenis: mode }, { replace: true })}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors",
                  selected
                    ? "border-pink-600 bg-pink-600 font-medium text-white shadow-sm"
                    : "border-pink-100 bg-white/80 text-neutral-700 hover:bg-white"
                )}
              >
                <span aria-hidden>{meta.emoji}</span>
                {meta.label}
              </button>
            );
          })}
        </div>
        <p className="mb-4 text-sm text-neutral-500">{DECK_MODE_META[activeMode].hint}</p>

        <ul className="space-y-3" role="tabpanel">
          {decks.map((deck) => (
            <li key={deck.slug}>
              <TrialDeckTile deck={deck} seen={seen[deck.slug] ?? 0} guest={signedIn === false} />
            </li>
          ))}
        </ul>

        {signedIn !== true && <UpgradeLadder />}
        {signedIn === true && (
          <div className="mt-8 text-center">
            <Link to="/create" className={buttonVariants({ size: "lg", className: "rounded-full" })}>
              Bikin deck sendiri pakai AI
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function TrialDeckTile({ deck, seen, guest }: { deck: TrialDeck; seen: number; guest: boolean }) {
  const free = freeCardCount(deck.cards.length);
  const lockedCount = deck.cards.length - free;
  const played = Math.min(seen, free);
  const usedUp = guest && played >= free && lockedCount > 0;

  return (
    <Link
      to={`/coba/${deck.slug}`}
      className={cn(
        "flex w-full items-center gap-4 rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2",
        DECK_THEME_STYLES[deck.theme].card
      )}
    >
      <span className="text-3xl" aria-hidden>{deck.emoji}</span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block font-semibold">{deck.name}</span>
        <span className="block text-sm leading-snug text-white/85">{deck.description}</span>
        {guest && lockedCount > 0 ? (
          <span className="flex items-center gap-2 pt-0.5 text-xs text-white/80">
            <FreeMeter used={played} free={free} />
            <span>
              {usedUp ? "Gratisnya habis" : `${free} kartu gratis`}
              {" · "}
              <Lock className="inline size-3 -translate-y-px" aria-hidden /> {lockedCount} lagi
            </span>
          </span>
        ) : (
          <span className="block text-xs text-white/70">{deck.cards.length} kartu</span>
        )}
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
        {played > 0 ? (
          <RotateCcw className="size-4" aria-label="Main lagi" />
        ) : (
          <Play className="size-4" aria-label="Main" />
        )}
      </span>
    </Link>
  );
}

function FreeMeter({ used, free }: { used: number; free: number }) {
  return (
    <span className="flex w-14 shrink-0 gap-0.5" aria-label={`${used} dari ${free} kartu gratis dimainkan`}>
      {Array.from({ length: free }, (_, index) => (
        <span
          key={index}
          className={cn("h-1.5 flex-1 rounded-full", index < used ? "bg-white" : "bg-white/35")}
        />
      ))}
    </span>
  );
}

/** Tiga langkah dari coba sampai beli, dengan langkah sekarang ditandai. */
function UpgradeLadder() {
  const steps = [
    {
      title: "Coba tanpa akun",
      tag: "Kamu di sini",
      points: [`${TRIAL_FREE_CARDS} kartu pertama tiap deck`, "Semua jenis: ngobrol, tantangan, kuis, mendengar"],
    },
    {
      title: "Akun gratis",
      tag: "Gratis",
      points: [
        "Semua kartu terbuka, lanjut dari kartu terakhir",
        `${AI_GENERATION_LIMIT} deck buatanmu sendiri pakai AI`,
      ],
    },
    {
      title: "Top-up deck AI",
      tag: AI_TOPUP_PACK.available ? `Rp${formatIdr(AI_TOPUP_PACK.priceIdr)}` : "Segera hadir",
      points: [
        `+${AI_TOPUP_PACK.generations} deck AI seharga Rp${formatIdr(AI_TOPUP_PACK.priceIdr)}`,
        "Topik apa saja, untuk siapa saja",
      ],
    },
  ];

  return (
    <section className="mt-10 space-y-4" aria-labelledby="ladder-title">
      <h2 id="ladder-title" className="text-lg font-semibold">
        Dari coba sampai punya deck sendiri
      </h2>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              "rounded-2xl border bg-white/80 p-4",
              index === 1 ? "border-pink-300 shadow-sm" : "border-pink-100"
            )}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="font-semibold">
                <span className="mr-2 text-neutral-400">{index + 1}</span>
                {step.title}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  index === 0 ? "bg-neutral-100 text-neutral-600" : "bg-pink-100 text-pink-700"
                )}
              >
                {step.tag}
              </span>
            </div>
            <ul className="space-y-1 text-sm text-neutral-600">
              {step.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-pink-500" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            {index === 1 && (
              <div className="mt-3 flex gap-2">
                <Link
                  to="/register"
                  className={buttonVariants({
                    className: "flex-1 rounded-full bg-pink-600 text-white [a]:hover:bg-pink-700",
                  })}
                >
                  Buat akun gratis
                </Link>
                <Link
                  to="/login"
                  className={buttonVariants({ variant: "outline", className: "flex-1 rounded-full border-pink-200 bg-white" })}
                >
                  Masuk
                </Link>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
