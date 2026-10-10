import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

/**
 * Tombol bagikan + kirim ke WhatsApp. Di HP, tombol utama membuka lembar
 * bagikan bawaan; di browser yang tidak punya, teks dan link-nya disalin.
 * WhatsApp diberi tombol sendiri karena di sanalah grup biasanya berkumpul.
 */
export function ShareActions({
  text,
  url,
  label,
  variant = "default",
  className,
}: {
  text: string;
  url: string;
  label: string;
  variant?: "default" | "outline";
  className?: string;
}) {
  const t = useT().share;
  const [copied, setCopied] = useState(false);
  const message = `${text}\n${url}`;

  async function onShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text, url });
        return;
      } catch (error) {
        // Dibatalkan pemain — bukan kegagalan.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(label, message);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <Button type="button" size="lg" variant={variant} className="flex-1 rounded-full" onClick={onShare}>
          {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
          {label}
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.whatsApp}
          title={t.whatsApp}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <WhatsAppIcon />
        </a>
      </div>
      <p aria-live="polite" className={cn("text-center text-xs text-muted-foreground", !copied && "sr-only")}>
        {copied ? t.copied : ""}
      </p>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5 fill-current">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.94.95-3.47-.23-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.23-9.43 9.44-9.43a9.4 9.4 0 0 1 6.67 2.77 9.38 9.38 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.3 11.3 0 0 0 12.05.72C5.79.72.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.6l6.02-1.58a11.3 11.3 0 0 0 5.42 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02" />
    </svg>
  );
}
