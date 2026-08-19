"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  ShoppingBag,
  Sparkles,
  Lock,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavEntry {
  href: string;
  icon: LucideIcon;
  label: string;
  /** Path lain yang tetap dianggap milik tab ini. */
  alsoActiveOn?: string[];
  locked?: boolean;
}

const ENTRIES: NavEntry[] = [
  { href: "/home", icon: Home, label: "Home", alsoActiveOn: ["/play"] },
  { href: "/create", icon: Sparkles, label: "Bikin" },
  { href: "/store", icon: ShoppingBag, label: "Toko" },
  { href: "/profile", icon: User, label: "Profil" },
];

function covers(base: string, pathname: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

function isCurrent(entry: NavEntry, pathname: string) {
  return [entry.href, ...(entry.alsoActiveOn ?? [])].some((base) =>
    covers(base, pathname)
  );
}

export function BottomNav({ canUseAi }: { canUseAi: boolean }) {
  const pathname = usePathname();

  // Tujuan yang sedang dituju, dicatat saat ketukan. useLinkStatus tidak
  // dipakai di sini: hasil pengukuran menunjukkan `pending`-nya tidak menyala
  // di jaringan lambat — justru kondisi di mana umpan balik paling dibutuhkan.
  // Menyimpannya sendiri membuat tab langsung menyala di frame berikutnya,
  // lepas dari prefetch maupun kecepatan jaringan.
  const [tappedHref, setTappedHref] = useState<string | null>(null);

  // Diturunkan saat render, bukan lewat effect: begitu pathname sampai ke
  // tujuan, penanda ini padam sendiri.
  const navigatingTo =
    tappedHref && !covers(tappedHref, pathname) ? tappedHref : null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 safe-bottom z-40">
      <div className="max-w-screen-sm mx-auto flex items-center justify-around py-2">
        {ENTRIES.map((entry) => {
          const pending = navigatingTo === entry.href;
          // Saat berpindah, hanya tab tujuan yang menyala — supaya tidak ada
          // dua tab menyala sekaligus selama halaman baru dimuat.
          const active = navigatingTo
            ? pending
            : isCurrent(entry, pathname);
          const locked = entry.href === "/create" && !canUseAi;
          const Icon = entry.icon;

          return (
            <Link
              key={entry.href}
              href={entry.href}
              onClick={() => setTappedHref(entry.href)}
              aria-label={locked ? `${entry.label} (terbatas)` : undefined}
              aria-current={isCurrent(entry, pathname) ? "page" : undefined}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <span
                className={cn(
                  "relative transition-colors",
                  active ? "text-primary" : "text-neutral-600"
                )}
              >
                {pending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Icon className="size-5" />
                )}
                {locked && !pending && (
                  <span className="absolute -top-1 -right-1.5 rounded-full bg-white p-px text-neutral-400">
                    <Lock className="size-2.5" />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-xs transition-colors",
                  active ? "text-primary font-medium" : "text-neutral-600"
                )}
              >
                {entry.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
