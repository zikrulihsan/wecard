import { Checkbox } from "@/components/ui/checkbox";
import { TIMER_OPTIONS, timerLabel } from "@/lib/game/timer-settings";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { CardTimerSettings } from "@flipcard/types";

/**
 * Pilihan durasi timer per kartu + "otomatis lanjut". Dipakai di layar pilih
 * level dan di panel link main (timer yang dipakai pemain lewat link).
 */
export function TimerFields({
  value,
  onChange,
  disabled,
}: {
  value: CardTimerSettings;
  onChange: (value: CardTimerSettings) => void;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <>
      <div
        role="radiogroup"
        aria-label={t.picker.timerGroup}
        className="grid grid-cols-3 gap-2"
      >
        {TIMER_OPTIONS.map((seconds) => {
          const active = value.seconds === seconds;
          return (
            <button
              key={seconds}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange({ ...value, seconds })}
              className={cn(
                "h-9 rounded-full border text-sm font-medium transition-colors disabled:opacity-50",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:border-primary/40"
              )}
            >
              {timerLabel(seconds, t.picker)}
            </button>
          );
        })}
      </div>

      {value.seconds > 0 && (
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={value.autoAdvance}
            disabled={disabled}
            onCheckedChange={(checked) =>
              onChange({ ...value, autoAdvance: checked === true })
            }
            className="mt-0.5"
          />
          <span className="text-sm">
            <span className="font-medium">{t.picker.autoAdvance}</span>
            <span className="block text-xs text-muted-foreground">
              {t.picker.autoAdvanceHint}
            </span>
          </span>
        </label>
      )}
    </>
  );
}
