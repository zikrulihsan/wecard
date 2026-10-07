import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_REDIRECT, safePath } from "@/lib/safe-path";
import { OAUTH_REDIRECT_KEY } from "@/lib/oauth";
import { useT } from "@/lib/i18n";

export function GoogleSignInButton({
  redirect = DEFAULT_REDIRECT,
  disabled = false,
  onError,
}: {
  redirect?: string;
  disabled?: boolean;
  onError: (message: string) => void;
}) {
  const t = useT();
  const [loading, setLoading] = useState(false);

  async function signIn() {
    onError("");
    setLoading(true);

    // OAuth harus kembali ke origin tempat PKCE verifier disimpan. URL situs
    // publik untuk tautan email tidak selalu sama dengan origin preview/lokal.
    const callback = new URL("/callback", window.location.origin);

    try {
      sessionStorage.setItem(OAUTH_REDIRECT_KEY, safePath(redirect, DEFAULT_REDIRECT));
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });
      if (error) {
        sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
        onError(error.message);
        setLoading(false);
      }
      // Jika berhasil, Supabase mengalihkan browser ke Google.
    } catch {
      sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
      onError(t.auth.loginUnreachable);
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-11 w-full"
      disabled={disabled || loading}
      onClick={signIn}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
        <path fill="#4285F4" d="M21.35 12.24c0-.7-.06-1.4-.18-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.24Z" />
        <path fill="#34A853" d="M12 21.73c2.63 0 4.84-.87 6.44-2.35l-3.14-2.45c-.87.59-1.99.94-3.3.94-2.54 0-4.69-1.71-5.46-4.02H3.3v2.52A9.73 9.73 0 0 0 12 21.73Z" />
        <path fill="#FBBC05" d="M6.54 13.85a5.85 5.85 0 0 1 0-3.7V7.63H3.3a9.74 9.74 0 0 0 0 8.74l3.24-2.52Z" />
        <path fill="#EA4335" d="M12 6.13c1.39 0 2.64.48 3.62 1.42l2.79-2.79A9.36 9.36 0 0 0 12 2.27a9.73 9.73 0 0 0-8.7 5.36l3.24 2.52C7.31 7.84 9.46 6.13 12 6.13Z" />
      </svg>
      {loading ? t.auth.googleConnecting : t.auth.google}
    </Button>
  );
}
