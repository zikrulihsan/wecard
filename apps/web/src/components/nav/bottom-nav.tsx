import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, ShoppingBag, Sparkles, Lock, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAiAccessDetails } from "@/lib/ai/access-client";
import { useT } from "@/lib/i18n";

interface NavEntry {
  href: string;
  icon: LucideIcon;
  label: "home" | "create" | "store" | "profile";
  alsoActiveOn?: string[];
}

const ENTRIES: NavEntry[] = [
  { href: "/home", icon: Home, label: "home", alsoActiveOn: ["/play"] },
  { href: "/create", icon: Sparkles, label: "create" },
  { href: "/store", icon: ShoppingBag, label: "store" },
  { href: "/profile", icon: User, label: "profile" },
];

function activeOn(entry: NavEntry, pathname: string) {
  return [entry.href, ...(entry.alsoActiveOn ?? [])].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function BottomNav() {
  const t = useT();
  const { pathname } = useLocation();
  const [canUseAi, setCanUseAi] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    fetchAiAccessDetails().then((access) => {
      if (active) setCanUseAi(access.canGenerate || Boolean(access.openDraftId));
    }).catch(() => {
      // Jaringan putus tidak mengunci tab; gerbang sebenarnya ada di server.
      if (active) setCanUseAi(null);
    });
    return () => { active = false; };
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur safe-bottom">
      <div className="mx-auto flex max-w-screen-sm items-center justify-around py-2">
        {ENTRIES.map((entry) => {
          const active = activeOn(entry, pathname);
          const locked = entry.href === "/create" && canUseAi === false;
          const Icon = entry.icon;
          const label = t.nav[entry.label];
          return (
            <Link
              key={entry.href}
              to={entry.href}
              aria-label={locked ? t.nav.limited(label) : undefined}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              <span className={cn("relative", active ? "text-primary" : "text-neutral-600")}>
                <Icon className="size-5" />
                {locked && <span className="absolute -top-1 -right-1.5 rounded-full bg-white p-px text-neutral-400"><Lock className="size-2.5" /></span>}
              </span>
              <span className={cn("text-xs", active ? "text-primary font-medium" : "text-neutral-600")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
