import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CardLoader } from "@/components/ui/card-loader";
import { safePath } from "@/lib/safe-path";
import { createClient } from "@/lib/supabase/client";
import { OAUTH_REDIRECT_KEY, SIGNUP_REDIRECT_KEY } from "@/lib/oauth";
import { useT } from "@/lib/i18n";

export default function CallbackPage() {
  const t = useT();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const query = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const code = query.get("code");
    const destination = safePath(
      query.get("redirect") || sessionStorage.getItem(OAUTH_REDIRECT_KEY) || readSignupRedirect()
    );
    sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
    if (!code || query.has("error") || fragment.has("error")) {
      navigate("/login?error=oauth", { replace: true });
      return;
    }

    try {
      createClient().auth.exchangeCodeForSession(code).then(({ error }) => {
        navigate(error ? "/login?error=oauth" : destination, { replace: true });
      }).catch(() => navigate("/login?error=oauth", { replace: true }));
    } catch {
      navigate("/login?error=oauth", { replace: true });
    }
  }, [navigate]);

  return <div className="mx-auto max-w-screen-sm px-4 py-8"><CardLoader label={t.auth.finishing} /></div>;
}

/** Diambil sekali: tujuan dari pendaftaran email (lihat `SIGNUP_REDIRECT_KEY`). */
function readSignupRedirect(): string | null {
  try {
    const value = localStorage.getItem(SIGNUP_REDIRECT_KEY);
    localStorage.removeItem(SIGNUP_REDIRECT_KEY);
    return value;
  } catch {
    return null;
  }
}
