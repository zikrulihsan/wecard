import Link from "next/link";
import { Home, User, ShoppingBag, Sparkles, Lock } from "lucide-react";
import { getAiAccess } from "@/lib/ai/access";

// Guard auth ada di middleware; layout ini sengaja tidak memanggil Supabase
// Auth. Satu-satunya query di sini adalah lookup primary key ke profiles
// untuk status akses AI, dan itu berjalan berbarengan dengan query halaman
// (layout & page di-render paralel), jadi hampir tidak menambah waktu tunggu.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const canUseAi = await getAiAccess();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav canUseAi={canUseAi} />
    </div>
  );
}

function BottomNav({ canUseAi }: { canUseAi: boolean }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 safe-bottom z-40">
      <div className="max-w-screen-sm mx-auto flex items-center justify-around py-2">
        <NavItem href="/home" icon={<Home className="size-5" />} label="Home" />
        <NavItem
          href="/create"
          icon={<Sparkles className="size-5" />}
          label="Bikin"
          locked={!canUseAi}
        />
        <NavItem
          href="/store"
          icon={<ShoppingBag className="size-5" />}
          label="Toko"
        />
        <NavItem
          href="/profile"
          icon={<User className="size-5" />}
          label="Profil"
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon,
  label,
  locked = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  locked?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={locked ? `${label} (terbatas)` : undefined}
      className="flex flex-col items-center gap-1 px-4 py-2 text-neutral-600 hover:text-primary transition-colors"
    >
      <span className="relative">
        {icon}
        {locked && (
          <span className="absolute -top-1 -right-1.5 rounded-full bg-white p-px text-neutral-400">
            <Lock className="size-2.5" />
          </span>
        )}
      </span>
      <span className="text-xs">{label}</span>
    </Link>
  );
}
