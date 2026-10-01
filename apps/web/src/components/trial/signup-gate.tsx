import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AI_GENERATION_LIMIT } from "@/lib/ai/quota";
import { TRIAL_DECK_LIMIT } from "@/lib/trial/progress";
import { cn } from "@/lib/utils";

/**
 * Ajakan daftar setelah jatah coba habis. Isinya menyebut apa yang didapat
 * dengan akun, bukan sekadar "login dulu" — orang yang baru saja main dua
 * deck sudah tahu kartunya enak, tinggal dikasih alasan untuk lanjut.
 */
export function SignupGate({
  onClose,
  className,
}: {
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-gate-title"
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center",
        className
      )}
      onClick={onClose}
    >
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-5 rounded-3xl bg-white p-6 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
          <Lock className="size-5" />
        </div>
        <div className="space-y-2">
          <h2 id="signup-gate-title" className="text-xl font-bold">
            Seru, kan? Lanjut pakai akun
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Kamu sudah mencoba {TRIAL_DECK_LIMIT} deck. Buat akun gratis untuk
            membuka semua deck bawaan lengkap dan bikin {AI_GENERATION_LIMIT}{" "}
            deck sendiri pakai AI.
          </p>
        </div>
        <div className="space-y-2">
          <Link
            to="/register"
            className={buttonVariants({
              size: "lg",
              className: "h-12 w-full rounded-full bg-pink-600 text-base text-white [a]:hover:bg-pink-700",
            })}
          >
            Buat akun gratis
          </Link>
          <Link
            to="/login"
            className={buttonVariants({
              size: "lg",
              variant: "outline",
              className: "h-12 w-full rounded-full text-base",
            })}
          >
            Sudah punya akun? Masuk
          </Link>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            Nanti dulu
          </button>
        )}
      </m.div>
    </div>
  );
}
