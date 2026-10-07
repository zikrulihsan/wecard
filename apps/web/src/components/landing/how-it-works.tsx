import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { useT } from "@/lib/i18n";

/**
 * Bagian inti halaman: menjelaskan fitur bikin deck AI dari sisi pemakainya.
 *
 * Urutannya sengaja masalah dulu, baru caranya. Orang tidak mencari "generate
 * deck pakai LLM" — mereka mencari jalan keluar dari ngumpul yang obrolannya
 * mentok, dan fitur ini kebetulan jawabannya.
 */
export function HowItWorks() {
  const how = useT().landing.how;
  return (
    <section id="cara-kerja" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {how.title}
          </h2>
          <p className="text-lg leading-relaxed text-neutral-600">{how.body}</p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {how.steps.map((step, index) => (
            <Step
              key={index}
              step={index + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </ol>

        <p className="mt-10 text-center text-sm text-neutral-500">
          {how.footnote(AI_GENERATION_LIMIT)}
        </p>
      </div>
    </section>
  );
}

function Step({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <li className="rounded-2xl border border-neutral-200 p-6">
      <div className="mb-4 flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-sm font-semibold text-white">
        {step}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
    </li>
  );
}
