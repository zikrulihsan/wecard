import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { safePath } from "@/lib/safe-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useT } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Batasi tujuan setelah login ke path aplikasi ini.
  const redirect = safePath(searchParams.get("redirect"));
  const callbackFailed = searchParams.has("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Diturunkan saat render (bukan disimpan di state) supaya ikut bahasa aktif.
  const [callbackErrorDismissed, setCallbackErrorDismissed] = useState(false);
  const shownError =
    error || (callbackFailed && !callbackErrorDismissed ? t.auth.oauthFailed : null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCallbackErrorDismissed(true);
    setLoading(true);

    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      navigate(redirect, { replace: true });
    } catch {
      setError(t.auth.loginUnreachable);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t.auth.loginTitle}</CardTitle>
        <CardDescription>{t.auth.loginSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {shownError && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {shownError}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.auth.signingIn : t.auth.signIn}
          </Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t.common.or}
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleSignInButton redirect={redirect} disabled={loading} onError={(message) => { setCallbackErrorDismissed(true); setError(message); }} />
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t.auth.noAccount}{" "}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            {t.auth.registerHere}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
