import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { AI_TOPUP_PACK, formatIdr } from "@/lib/pricing";
import { useT } from "@/lib/i18n";

/**
 * Keberatan yang muncul sebelum orang menekan tombol daftar, dijawab di
 * tempat yang sama.
 *
 * Pakai `<details>` bawaan browser, bukan komponen accordion — tidak butuh
 * JavaScript, ikut terbuka saat halaman dicari (Ctrl+F), dan isinya tetap
 * terbaca mesin pencari.
 */
export function Faq() {
  const faq = useT().landing.faq;
  const items = faq.items(
    AI_GENERATION_LIMIT,
    AI_TOPUP_PACK.generations,
    formatIdr(AI_TOPUP_PACK.priceIdr)
  );
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-pink-600">
            {faq.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {faq.title}
          </h2>
        </div>

        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {items.map((item) => (
            <Item key={item.question} question={item.question}>
              {item.answer}
            </Item>
          ))}
        </div>
      </div>
    </section>
  );
}

function Item({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium marker:content-none [&::-webkit-details-marker]:hidden">
        {question}
        <span
          aria-hidden
          className="shrink-0 text-xl leading-none text-neutral-400 transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        {children}
      </p>
    </details>
  );
}
