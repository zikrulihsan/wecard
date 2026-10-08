import { Sparkles } from "lucide-react";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { DeckCard } from "./deck-card";
import { useT } from "@/lib/i18n";

/**
 * Bagian inti halaman: menjelaskan fitur bikin deck AI dari sisi pemakainya.
 *
 * Latarnya gelap supaya bagian ini jadi jeda visual di antara bagian terang,
 * dan isinya ditunjukkan lewat contoh (topik yang diketik → kartu yang jadi),
 * bukan paragraf. Kartu hasilnya contoh keluaran fitur generate.
 */
export function HowItWorks() {
  const how = useT().landing.how;
  return (
    <section
      id="cara-kerja"
      className="relative overflow-hidden bg-neutral-950 px-6 py-20 text-white"
    >
      <div className="absolute -top-24 right-0 size-96 rounded-full bg-pink-600/25 blur-3xl" />
      <div className="absolute -bottom-24 -left-10 size-80 rounded-full bg-indigo-600/20 blur-3xl" />

      <div className="relative mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-pink-400">
            <Sparkles className="size-4" />
            {how.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {how.title}
          </h2>
          <p className="text-lg text-neutral-300">
            {how.body}
          </p>

          <ol className="space-y-4 pt-2">
            {how.steps.map((title, index) => (
              <Step key={index} step={index + 1} title={title} />
            ))}
          </ol>

          <p className="text-sm text-neutral-400">
            {how.footnote(AI_GENERATION_LIMIT)}
          </p>
        </div>

        <PromptDemo />
      </div>
    </section>
  );
}

function Step({ step, title }: { step: number; title: string }) {
  return (
    <li className="flex items-center gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-sm font-bold">
        {step}
      </span>
      <span className="font-medium text-neutral-100">{title}</span>
    </li>
  );
}

/** Ilustrasi statis: kolom topik di atas, dua kartu hasilnya di bawah. */
function PromptDemo() {
  const how = useT().landing.how;
  return (
    <div className="relative mx-auto w-full max-w-sm" aria-hidden>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <p className="text-xs font-medium text-neutral-400">{how.demoTopicLabel}</p>
        <p className="mt-1 text-base font-medium">
          {how.demoTopic}
          <span className="ml-0.5 inline-block h-5 w-px translate-y-1 animate-pulse bg-pink-400" />
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {how.demoChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-neutral-200"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-6 h-52">
        <DeckCard
          theme="indigo"
          kind={how.demoCards[0].kind}
          deck={how.demoDeck}
          level={1}
          answer
          className="absolute left-0 top-0 h-48 w-[70%] -rotate-6"
        >
          {how.demoCards[0].content}
        </DeckCard>
        <DeckCard
          theme="teal"
          kind={how.demoCards[1].kind}
          deck={how.demoDeck}
          level={2}
          answer
          className="absolute right-0 top-4 h-48 w-[70%] rotate-6"
        >
          {how.demoCards[1].content}
        </DeckCard>
      </div>
    </div>
  );
}
