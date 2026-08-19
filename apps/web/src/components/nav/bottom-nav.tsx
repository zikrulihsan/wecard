"use client";

import { useEffect, useState, useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  User,
  ShoppingBag,
  Sparkles,
  Lock,
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

/**
 * Status akses AI, disimpan di tingkat modul supaya satu kali ambil cukup
 * untuk seluruh umur halaman. Nav ini ikut ter-mount ulang tiap pindah rute;
 * tanpa cache di sini, tiap pindah tab menembak /api/ai-access lagi.
 */
let cachedAiAccess: boolean | undefined;
let aiAccessInFlight: Promise<boolean> | null = null;

function fetchAiAccess(): Promise<boolean> {
  aiAccessInFlight ??= fetch("/api/ai-access")
    .then((res) => (res.ok ? res.json() : null))
    .then((body) => {
      cachedAiAccess = body?.canUseAi === true;
      return cachedAiAccess;
    })
    .catch(() => {
      // Jaringan putus bukan jawaban "tidak boleh". Dilepas supaya navigasi
      // berikutnya mencoba lagi, bukan terkunci pada kegagalan sesaat.
      aiAccessInFlight = null;
      return false;
    });

  return aiAccessInFlight;
}

// Gembok di tab "Bikin" baru digambar setelah status aksesnya diketahui —
// selama masih `undefined` sengaja dikosongkan, karena menyusul lebih baik
// daripada sempat salah tampil. Status ini diambil dari klien, bukan
// diturunkan dari layout; alasannya ada di catatan pada (app)/layout.tsx.
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [canUseAi, setCanUseAi] = useState<boolean | undefined>(cachedAiAccess);

  useEffect(() => {
    if (cachedAiAccess !== undefined) return;

    let active = true;
    fetchAiAccess().then((value) => {
      if (active) setCanUseAi(value);
    });

    return () => {
      active = false;
    };
  }, []);

  // Navigasi dijalankan di dalam transition supaya `isPending` jadi sumber
  // kebenaran kapan penanda menyala. useLinkStatus tidak dipakai (pengukuran
  // menunjukkan `pending`-nya tidak menyala di jaringan lambat), dan
  // menurunkan penanda dari pathname juga tidak cukup: penanda seperti itu
  // hidup lagi begitu pemain menekan tombol back ke halaman asalnya.
  const [isPending, startTransition] = useTransition();
  const [target, setTarget] = useState<string | null>(null);

  // Terikat ke transisi yang sedang berjalan, jadi padam sendiri saat navigasi
  // selesai, gagal, maupun dibatalkan — tidak bisa tersangkut. Penandanya cuma
  // perpindahan warna: ikonnya sengaja tidak pernah ditukar spinner, supaya
  // bentuk nav tidak berubah-ubah saat berpindah halaman.
  const navigatingTo = isPending ? target : null;

  const handleTap = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    // Biarkan buka-di-tab-baru dan klik non-kiri ditangani browser.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    if (href === pathname) return;
    setTarget(href);
    startTransition(() => router.push(href));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 safe-bottom z-40">
      <div className="max-w-screen-sm mx-auto flex items-center justify-around py-2">
        {ENTRIES.map((entry) => {
          // Saat berpindah, hanya tab tujuan yang menyala — supaya tidak ada
          // dua tab menyala sekaligus selama halaman baru dimuat.
          const active = navigatingTo
            ? navigatingTo === entry.href
            : isCurrent(entry, pathname);
          const locked = entry.href === "/create" && canUseAi === false;
          const Icon = entry.icon;

          return (
            <Link
              key={entry.href}
              href={entry.href}
              onClick={handleTap(entry.href)}
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
                <Icon className="size-5" />
                {locked && (
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
