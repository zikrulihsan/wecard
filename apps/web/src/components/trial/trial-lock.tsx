import { useState } from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { Lock } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { DECK_THEME_STYLES } from "@/lib/deck-theme";
import type { TrialDeck } from "@/lib/trial/decks";
import { cn } from "@/lib/utils";

/**
 * Kartu terkunci yang muncul menggantikan kartu berikutnya setelah jatah
 * gratis sebuah deck habis.
 *
 * Sengaja tampil di tempat kartu, bukan popup: orang sedang di tengah main,
 * jadi yang ditunjukkan adalah "kartu sisanya ada di sini" — lengkap dengan
 * tumpukan kartu yang belum dibuka — bukan tembok "login dulu". Masuk lewat
 * sini membawa pemain kembali ke deck yang sama, tepat di kartu berikutnya.
 */
export function TrialLock({
  deck,
  freeCards,
  results,
}: {
  deck: TrialDeck;
  freeCards: number;
  results: Record<string, boolean>;
}) {
  const [error, setError] = useState("");
  const remaining = deck.cards.length - freeCards;
  const nextCard = freeCards + 1;
  const redirect = `/coba/${deck.slug}?kartu=${nextCard}`;
  const answered = Object.values(results);

  return (
    // my-auto: tengah secara vertikal, tapi tetap bisa digulir di layar pendek.
    <div className="relative mx-auto my-auto w-full max-w-sm">
      {/* Tumpukan kartu yang belum dibuka, mengintip di belakang panel. */}
      <div aria-hidden className="absolute inset-x-6 -top-3 bottom-6">
        {[2, 1].map((layer) => (
          <div
            key={layer}
            className={cn(
              "absolute inset-0 rounded-3xl bg-gradient-to-br shadow-md",
              DECK_THEME_STYLES[deck.theme].card,
              layer === 2 ? "-rotate-6 opacity-50" : "rotate-3 opacity-70"
            )}
          />
        ))}
      </div>

      <m.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        role="region"
        aria-labelledby="trial-lock-title"
        className="relative space-y-4 rounded-3xl bg-white p-6 text-center shadow-xl"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-5" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {remaining} kartu lagi terkunci
          </p>
          <h2 id="trial-lock-title" className="text-xl font-bold leading-snug">
            Seru, kan? Lanjut dari kartu ke-{nextCard}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Masuk gratis untuk membuka sisa deck {deck.name} — plus semua deck
            lain tanpa batas, dan {AI_GENERATION_LIMIT} deck buatanmu sendiri
            pakai AI.
          </p>
        </div>

        {answered.length > 0 && (
          <p className="rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            Sejauh ini{" "}
            <strong className="font-semibold">
              {answered.filter(Boolean).length}/{answered.length}
            </strong>{" "}
            jawaban benar
          </p>
        )}

        <div className="space-y-2">
          <GoogleSignInButton redirect={redirect} onError={setError} />
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <p className="text-sm text-neutral-600">
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="font-semibold text-primary hover:underline"
            >
              Masuk pakai email
            </Link>
            {" · "}
            <Link
              to={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="font-semibold text-primary hover:underline"
            >
              Daftar
            </Link>
          </p>
        </div>
      </m.div>
    </div>
  );
}
