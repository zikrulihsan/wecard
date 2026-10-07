import { Languages } from "lucide-react";
import { LANGUAGES, LANGUAGE_NAMES, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Sakelar ID / EN berbentuk pil. Dua pilihan saja, jadi tombol bersebelahan
 * lebih cepat dipakai daripada dropdown — satu ketukan, langsung berganti.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, language, setLanguage } = useI18n();
  return (
    <div
      role="radiogroup"
      aria-label={t.language.switchTo}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-neutral-200 bg-white/90 p-0.5 text-xs font-semibold shadow-sm backdrop-blur",
        className
      )}
    >
      <Languages aria-hidden className="ml-1.5 mr-0.5 size-3.5 text-neutral-400" />
      {LANGUAGES.map((option) => {
        const active = option === language;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={LANGUAGE_NAMES[option]}
            lang={option}
            onClick={() => setLanguage(option)}
            className={cn(
              "rounded-full px-2.5 py-1 uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500",
              active
                ? "bg-pink-600 text-white"
                : "text-neutral-600 hover:text-neutral-900"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
