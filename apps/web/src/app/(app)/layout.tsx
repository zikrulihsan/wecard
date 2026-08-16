import Link from "next/link";
import { Home, User, ShoppingBag, Sparkles } from "lucide-react";

// Guard auth ada di middleware; layout ini sengaja statis supaya pindah tab
// tidak memicu roundtrip ke Supabase Auth.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-neutral-200 safe-bottom z-40">
      <div className="max-w-screen-sm mx-auto flex items-center justify-around py-2">
        <NavItem href="/home" icon={<Home className="size-5" />} label="Home" />
        <NavItem
          href="/create"
          icon={<Sparkles className="size-5" />}
          label="Bikin"
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
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-4 py-2 text-neutral-600 hover:text-primary transition-colors"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}
