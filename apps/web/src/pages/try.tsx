import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Play, RotateCcw } from "lucide-react";
import { BackLink } from "@/components/nav/back-link";
import { SignupGate } from "@/components/trial/signup-gate";
import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import { TRIAL_DECKS } from "@/lib/trial/decks";
import { TRIAL_DECK_LIMIT, useTriedDecks } from "@/lib/trial/progress";
import { cn } from "@/lib/utils";

/**
 * Pintu masuk "Coba gratis": deck umum yang bisa langsung dimainkan tanpa
 * akun. Setelah {TRIAL_DECK_LIMIT} deck berbeda dibuka, deck lain terkunci
 * dan memilihnya memunculkan ajakan daftar/masuk.
 */
export default function TryPage() {
  const navigate = useNavigate();
  const { tried, remaining, canOpen } = useTriedDecks();
  const [gateOpen, setGateOpen] = useState(false);

  const openDeck = (slug: string) => {
    if (canOpen(slug)) navigate(`/coba/${slug}`);
    else setGateOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="mx-auto max-w-screen-sm px-4 py-6">
        <BackLink href="/">Beranda</BackLink>

        <header className="mb-6 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Coba dulu, tanpa daftar</h1>
          <p className="text-neutral-600">
            Pilih deck, ketuk kartunya, lalu mulai ngobrol.{" "}
            {remaining > 0 ? (
              <>
                Kamu bisa mencoba{" "}
                <strong className="font-semibold text-neutral-800">
                  {remaining} deck lagi
                </strong>{" "}
                sebelum perlu akun.
              </>
            ) : (
              <>Jatah coba sudah habis — deck yang tadi tetap bisa diulang.</>
            )}
          </p>
          <TrialMeter used={tried.length} />
        </header>

        <ul className="space-y-3">
          {TRIAL_DECKS.map((deck) => {
            const played = tried.includes(deck.slug);
            const locked = !canOpen(deck.slug);
            return (
              <li key={deck.slug}>
                <button
                  type="button"
                  onClick={() => openDeck(deck.slug)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2",
                    DECK_THEME_STYLES[deck.theme].card,
                    locked && "opacity-70"
                  )}
                >
                  <span className="text-3xl" aria-hidden>{deck.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{deck.name}</span>
                    <span className="block text-sm leading-snug text-white/85">
                      {deck.description}
                    </span>
                    <span className="mt-1 block text-xs text-white/70">
                      {deck.cards.length} kartu{played && " · sudah dicoba"}
                    </span>
                  </span>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                    {locked ? (
                      <Lock className="size-4" aria-label="Terkunci" />
                    ) : played ? (
                      <RotateCcw className="size-4" aria-label="Main lagi" />
                    ) : (
                      <Play className="size-4" aria-label="Main" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-center text-sm text-neutral-600">
          Sudah yakin?{" "}
          <Link to="/register" className="font-semibold text-pink-700 hover:underline">
            Buat akun gratis
          </Link>{" "}
          atau{" "}
          <Link to="/login" className="font-semibold text-pink-700 hover:underline">
            masuk
          </Link>
        </p>
      </div>

      {gateOpen && <SignupGate onClose={() => setGateOpen(false)} />}
    </div>
  );
}

function TrialMeter({ used }: { used: number }) {
  if (TRIAL_DECK_LIMIT === 0) return null;
  return (
    <div className="flex gap-1.5 pt-1" aria-label={`${Math.min(used, TRIAL_DECK_LIMIT)} dari ${TRIAL_DECK_LIMIT} deck coba terpakai`}>
      {Array.from({ length: TRIAL_DECK_LIMIT }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            index < used ? "bg-pink-500" : "bg-pink-200"
          )}
        />
      ))}
    </div>
  );
}
