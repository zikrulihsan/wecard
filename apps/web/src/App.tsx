import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { MotionProvider } from "@/components/motion-provider";
import { BottomNav } from "@/components/nav/bottom-nav";
import { CardLoader } from "@/components/ui/card-loader";
import { LoadError } from "@/components/ui/load-error";
import { createClient, hasStoredSession } from "@/lib/supabase/client";
import { useDocumentLanguage, useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { claimShareReferral } from "@/lib/share/api";
import { takeReferral } from "@/lib/share/local";
import LandingPage from "@/pages/landing";

const loadHome = () => import("@/pages/home");
const loadCreate = () => import("@/pages/create");
const loadPlay = () => import("@/pages/play");
const loadSession = () => import("@/pages/session");
const loadProfile = () => import("@/pages/profile");
const loadStore = () => import("@/pages/store");

const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const HomePage = lazy(loadHome);
const CreatePage = lazy(loadCreate);
const DeckReviewPage = lazy(() => import("@/pages/deck-review"));
const PlayPage = lazy(loadPlay);
const SessionPage = lazy(loadSession);
const ProfilePage = lazy(loadProfile);
const StorePage = lazy(loadStore);
const NotFound = lazy(() => import("@/pages/not-found"));
const CallbackPage = lazy(() => import("@/pages/callback"));
const TryPage = lazy(() => import("@/pages/try"));
const TrySessionPage = lazy(() => import("@/pages/try-session"));
const SharedPlayPage = lazy(() => import("@/pages/shared-play"));
const SeriesPage = lazy(() => import("@/pages/series"));
const RedeemPage = lazy(() => import("@/pages/redeem"));

/**
 * Halaman tab bawah dan alur main diunduh di belakang layar begitu aplikasi
 * menganggur, supaya pindah tab tidak menampilkan "Membuka halaman" dulu.
 */
function usePrefetchAppPages() {
  useEffect(() => {
    const prefetch = () => {
      for (const load of [loadHome, loadPlay, loadSession, loadCreate, loadProfile, loadStore]) {
        load().catch(() => {});
      }
    };
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(prefetch, { timeout: 3000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(prefetch, 1500);
    return () => clearTimeout(timer);
  }, []);
}

function LandingOrCallback() {
  const { search } = useLocation();
  return new URLSearchParams(search).has("code")
    ? <Navigate to={`/callback${search}`} replace />
    : <LandingPage />;
}

function RequireAuth() {
  const t = useT();
  const location = useLocation();
  // Sesi tersimpan di perangkat → halaman langsung dirender (datanya ikut
  // menunggu sesi di dalam klien Supabase), bukan menunggu "Memeriksa sesi"
  // dulu lalu baru mengunduh halaman. Kalau ternyata sesinya tidak berlaku,
  // pemain tetap diarahkan ke /login.
  const [authenticated, setAuthenticated] = useState<boolean | null>(() => (hasStoredSession() ? true : null));
  const [supabase] = useState(() => {
    try { return createClient(); } catch { return null; }
  });

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthenticated(Boolean(data.session));
    }).catch(() => {
      if (active) setAuthenticated(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthenticated(Boolean(session));
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [supabase]);

  if (!supabase) {
    return <div className="mx-auto max-w-screen-sm px-4 py-8"><LoadError title={t.app.loginUnavailableTitle} description={t.app.loginUnavailableDescription} onRetry={() => window.location.reload()} /></div>;
  }
  if (authenticated === null) {
    return <div className="mx-auto max-w-screen-sm px-4 py-8"><CardLoader label={t.app.checkingSession} /></div>;
  }
  if (!authenticated) {
    const destination = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(destination)}`} replace />;
  }
  return <Outlet />;
}

/**
 * Pemain yang daftar dari ajakan di akhir link main membawa token link-nya.
 * Begitu masuk, catat sekali (metrik pemain → pembuat). Tidak memblokir apa
 * pun: gagal dicatat ya sudah.
 */
function useClaimReferral() {
  useEffect(() => {
    const token = takeReferral();
    if (token) claimShareReferral(token).catch((error) => console.error("[share] gagal mencatat referral", error));
  }, []);
}

function AppLayout() {
  useClaimReferral();
  usePrefetchAppPages();
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pb-bottom-nav"><Outlet /></main>
      <BottomNav />
    </div>
  );
}

function AuthLayout() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 px-6 py-12">
      <LanguageSwitcher className="absolute top-4 right-4" />
      <div className="w-full max-w-md"><Outlet /></div>
    </div>
  );
}

export default function App() {
  const t = useT();
  useDocumentLanguage();
  return (
    <MotionProvider>
      <Suspense fallback={<div className="mx-auto max-w-screen-sm px-4 py-8"><CardLoader label={t.app.openingPage} /></div>}>
      <Routes>
        <Route path="/" element={<LandingOrCallback />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/coba" element={<TryPage />} />
        <Route path="/coba/:deckSlug" element={<TrySessionPage />} />
        <Route path="/main/:token" element={<SharedPlayPage />} />
        <Route path="/seri/:slug" element={<SeriesPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/create/:deckId" element={<DeckReviewPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/hadiah/:code" element={<RedeemPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/play/:deckId" element={<PlayPage />} />
            <Route path="/play/:deckId/session" element={<SessionPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </MotionProvider>
  );
}
