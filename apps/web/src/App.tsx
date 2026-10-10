import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { MotionProvider } from "@/components/motion-provider";
import { BottomNav } from "@/components/nav/bottom-nav";
import { CardLoader } from "@/components/ui/card-loader";
import { LoadError } from "@/components/ui/load-error";
import { createClient } from "@/lib/supabase/client";
import { useDocumentLanguage, useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { claimShareReferral } from "@/lib/share/api";
import { takeReferral } from "@/lib/share/local";
import LandingPage from "@/pages/landing";

const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const HomePage = lazy(() => import("@/pages/home"));
const CreatePage = lazy(() => import("@/pages/create"));
const DeckReviewPage = lazy(() => import("@/pages/deck-review"));
const PlayPage = lazy(() => import("@/pages/play"));
const SessionPage = lazy(() => import("@/pages/session"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const StorePage = lazy(() => import("@/pages/store"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CallbackPage = lazy(() => import("@/pages/callback"));
const TryPage = lazy(() => import("@/pages/try"));
const TrySessionPage = lazy(() => import("@/pages/try-session"));
const SharedPlayPage = lazy(() => import("@/pages/shared-play"));

function LandingOrCallback() {
  const { search } = useLocation();
  return new URLSearchParams(search).has("code")
    ? <Navigate to={`/callback${search}`} replace />
    : <LandingPage />;
}

function RequireAuth() {
  const t = useT();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
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
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/create/:deckId" element={<DeckReviewPage />} />
            <Route path="/store" element={<StorePage />} />
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
