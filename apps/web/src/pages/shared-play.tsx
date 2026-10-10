import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, m, type Variants } from "framer-motion";
import { ChevronLeft, Link2Off, X } from "lucide-react";
import { CardDisplay } from "@/components/cards/card-display";
import { GameProgressBar } from "@/components/game/progress-bar";
import { QuizScore } from "@/components/game/quiz-score";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { MakerCta } from "@/components/share/maker-cta";
import { Scoreboard } from "@/components/share/scoreboard";
import { ShareActions } from "@/components/share/share-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { CardLoader } from "@/components/ui/card-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadError } from "@/components/ui/load-error";
import { hasAnswerSide } from "@/lib/cards/formats";
import { DECK_MODE_META } from "@/lib/deck-mode";
import { deckThemeStyle, deckThemeVars } from "@/lib/deck-theme";
import { shuffle } from "@/lib/game/shuffle";
import {
  fetchScoreboard,
  fetchSharedDeck,
  recordSharedPlay,
  shareUrl,
  type ScoreRow,
  type SharedDeck,
} from "@/lib/share/api";
import { PLAYER_NAME_MAX, readPlayerName, savePlayerName } from "@/lib/share/local";
import { useSignedIn } from "@/lib/supabase/use-signed-in";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { GameCard } from "@flipcard/types";

// direction: 1 = maju, -1 = mundur — sama seperti layar main yang asli.
const cardVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, scale: 0.96, x: direction * 56 }),
  center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.22, ease: "easeOut" } },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.96,
    x: direction * -300,
    transition: { duration: 0.2, ease: "easeIn" },
  }),
};

type LoadState =
  | { status: "loading"; token: string }
  | { status: "error"; token: string }
  | { status: "off"; token: string }
  | { status: "ready"; token: string; deck: SharedDeck };

/**
 * Link main (`/main/<token>`): deck custom yang dibagikan pemiliknya. Siapa
 * pun bisa main tanpa akun — cukup isi nama. Seperti sesi coba, sesinya hidup
 * di state lokal, tidak menyentuh game store milik pemain yang sudah masuk.
 */
export default function SharedPlayPage() {
  const t = useT().share;
  const token = useParams().token ?? "";
  const [state, setState] = useState<LoadState>({ status: "loading", token });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    fetchSharedDeck(token)
      .then((deck) => {
        if (active) setState(deck ? { status: "ready", token, deck } : { status: "off", token });
      })
      .catch((error) => {
        console.error("[main] gagal membuka deck", error);
        if (active) setState({ status: "error", token });
      });
    return () => { active = false; };
  }, [token, retry]);

  const current: LoadState = state.token === token ? state : { status: "loading", token };

  if (current.status === "ready") return <SharedSession key={token} token={token} deck={current.deck} />;

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-6 py-12">
      <LanguageSwitcher className="absolute top-4 right-4" />
      <div className="w-full max-w-md">
        {current.status === "loading" ? (
          <CardLoader label={t.loading} />
        ) : current.status === "error" ? (
          <LoadError
            title={t.errorTitle}
            description={t.errorDescription}
            onRetry={() => { setState({ status: "loading", token }); setRetry((value) => value + 1); }}
          />
        ) : (
          <LinkOff />
        )}
      </div>
    </div>
  );
}

function LinkOff() {
  const t = useT();
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm">
        <Link2Off className="size-6" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t.share.offTitle}</h1>
        <p className="leading-relaxed text-muted-foreground">{t.share.offBody}</p>
      </div>
      <Link to="/coba" className={buttonVariants({ size: "lg", className: "w-full rounded-full" })}>
        {t.trial.tryAnother}
      </Link>
    </div>
  );
}

function SharedSession({ token, deck }: { token: string; deck: SharedDeck }) {
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [round, setRound] = useState(0);

  const start = (name: string) => {
    savePlayerName(name);
    setPlayerName(name);
    setCards(shuffle(deck.cards));
    setRound((value) => value + 1);
  };

  if (playerName === null) return <NameStep deck={deck} onStart={start} />;
  return (
    <PlayRound
      key={round}
      token={token}
      deck={deck}
      cards={cards}
      playerName={playerName}
      onAgain={() => start(playerName)}
      onExit={() => setPlayerName(null)}
    />
  );
}

function NameStep({ deck, onStart }: { deck: SharedDeck; onStart: (name: string) => void }) {
  const t = useT();
  const [name, setName] = useState(readPlayerName);
  const trimmed = name.trim();
  const quiz = deck.mode === "kuis" || deck.mode === "mendengar";
  const theme = deckThemeStyle(deck.theme);

  return (
    <div
      style={deckThemeVars(deck.theme)}
      className={cn("relative flex min-h-dvh items-center justify-center bg-gradient-to-br px-6 py-12", theme.finish)}
    >
      <LanguageSwitcher className="absolute top-4 right-4" />
      <m.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed && deck.cards.length > 0) onStart(trimmed);
        }}
      >
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.share.sharedVia}
        </p>
        <div className={cn("rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl", theme.card)}>
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">
            {DECK_MODE_META[deck.mode].emoji} {t.modes[deck.mode].label} · {t.common.cards(deck.cards.length)}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug">{deck.name}</h1>
          {deck.description && <p className="mt-2 text-sm leading-relaxed text-white/85">{deck.description}</p>}
        </div>

        {deck.cards.length === 0 ? (
          <p className="text-center text-muted-foreground">{t.share.emptyDeck}</p>
        ) : (
          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="player-name">{t.share.nameLabel}</Label>
              <Input
                id="player-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={PLAYER_NAME_MAX}
                placeholder={t.share.namePlaceholder}
                autoComplete="nickname"
                autoFocus
                className="h-11 text-base"
              />
              <p className="text-xs text-muted-foreground">{quiz ? t.share.nameHintQuiz : t.share.nameHintTalk}</p>
            </div>
            <Button type="submit" size="lg" disabled={!trimmed} className="w-full rounded-full">
              {t.share.start(deck.cards.length)}
            </Button>
          </div>
        )}
      </m.form>
    </div>
  );
}

function PlayRound({
  token,
  deck,
  cards,
  playerName,
  onAgain,
  onExit,
}: {
  token: string;
  deck: SharedDeck;
  cards: GameCard[];
  playerName: string;
  onAgain: () => void;
  onExit: () => void;
}) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [direction, setDirection] = useState(1);
  const theme = deckThemeStyle(deck.theme);

  if (index >= cards.length) {
    return (
      <DoneScreen
        token={token}
        deck={deck}
        playerName={playerName}
        results={results}
        onAgain={onAgain}
      />
    );
  }

  const card = cards[index];
  const awaitingAnswer = revealed && hasAnswerSide(card.cardType) && !answerRevealed;
  const goNext = () => {
    setDirection(1);
    setRevealed(false);
    setAnswerRevealed(false);
    setIndex((value) => value + 1);
  };
  const goPrevious = () => {
    if (index === 0) return;
    setDirection(-1);
    setRevealed(false);
    setAnswerRevealed(false);
    setIndex((value) => value - 1);
  };
  const exit = () => {
    if (confirm(t.game.confirmExit)) onExit();
  };

  return (
    <div
      style={deckThemeVars(deck.theme)}
      className={cn("flex h-dvh min-h-[26rem] flex-col overflow-hidden bg-gradient-to-br", theme.play)}
    >
      <header className="flex shrink-0 items-center gap-1 px-4 pt-3 pb-2">
        <Button variant="ghost" size="icon" onClick={exit} className="shrink-0 rounded-full" aria-label={t.common.exit}>
          <X className="size-5" />
        </Button>
        <div className="flex-1 px-2">
          <GameProgressBar current={index} total={cards.length} />
        </div>
        <span className="max-w-[8rem] shrink-0 truncate rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-neutral-600">
          {playerName}
        </span>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <m.div
            key={card.id}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center px-6 py-2"
          >
            <CardDisplay
              card={card}
              isRevealed={revealed}
              onFlip={() => setRevealed(true)}
              isAnswerRevealed={answerRevealed}
              onRevealAnswer={() => setAnswerRevealed(true)}
              language={deck.language}
              result={results[card.id]}
              onResult={(correct) => setResults((value) => ({ ...value, [card.id]: correct }))}
            />
          </m.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {!revealed ? (
          <Button onClick={() => setRevealed(true)} size="lg" className="w-full rounded-full">
            {t.game.openCard}
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              onClick={goPrevious}
              disabled={index === 0}
              variant="outline"
              size="lg"
              className="rounded-full"
              aria-label={t.game.previousCard}
            >
              <ChevronLeft className="size-5" />
            </Button>
            {awaitingAnswer ? (
              <Button onClick={() => setAnswerRevealed(true)} size="lg" className="flex-1 rounded-full">
                {t.game.showAnswer}
              </Button>
            ) : (
              <Button onClick={goNext} size="lg" className="flex-1 rounded-full">
                {t.game.nextCard}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DoneScreen({
  token,
  deck,
  playerName,
  results,
  onAgain,
}: {
  token: string;
  deck: SharedDeck;
  playerName: string;
  results: Record<string, boolean>;
  onAgain: () => void;
}) {
  const t = useT();
  const signedIn = useSignedIn();
  const graded = Object.values(results);
  const correct = graded.filter(Boolean).length;
  const total = graded.length;
  const [board, setBoard] = useState<{ status: "loading" | "error" | "ready"; rows: ScoreRow[] }>({
    status: "loading",
    rows: [],
  });

  // Dicatat sekali per putaran, lalu papan skornya diambil — supaya skor
  // pemain ini sudah ikut tampil. StrictMode menjalankan efek dua kali di
  // dev; ref ini yang mencegah skornya tercatat ganda.
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    recordSharedPlay(token, playerName, correct, total)
      .catch((error) => console.error("[main] gagal mencatat permainan", error))
      .then(() => (total > 0 ? fetchScoreboard(token) : []))
      .then((rows) => setBoard({ status: "ready", rows }))
      .catch((error) => {
        console.error("[main] gagal membaca papan skor", error);
        setBoard({ status: "error", rows: [] });
      });
  }, [token, playerName, correct, total]);

  const url = shareUrl(token);

  return (
    <div
      style={deckThemeVars(deck.theme)}
      className={cn("flex min-h-dvh justify-center bg-gradient-to-br px-6 py-10", deckThemeStyle(deck.theme).finish)}
    >
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 text-center"
      >
        <div className="text-7xl">🎉</div>
        <h1 className="text-3xl font-bold">{t.share.doneTitle(playerName)}</h1>
        {total > 0 ? (
          <QuizScore correct={correct} total={total} />
        ) : (
          <p className="leading-relaxed text-muted-foreground">{t.game.doneTalk}</p>
        )}

        {total > 0 && <Scoreboard rows={board.rows} status={board.status} playerName={playerName} />}

        <ShareActions
          text={total > 0 ? t.share.resultText(correct, total, deck.name) : t.share.playedText(deck.name)}
          url={url}
          label={total > 0 ? t.share.shareResult : t.share.inviteFriends}
        />
        <Button size="lg" variant="outline" className="w-full rounded-full" onClick={onAgain}>
          {t.share.playAgain}
        </Button>

        <MakerCta signedIn={signedIn} referralToken={token} />
      </m.div>
    </div>
  );
}
