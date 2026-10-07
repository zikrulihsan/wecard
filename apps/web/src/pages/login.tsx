import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_REDIRECT, safePath } from "@/lib/safe-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Batasi tujuan setelah login ke path aplikasi ini.
  const redirect = safePath(searchParams.get("redirect"));
  const callbackFailed = searchParams.has("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    callbackFailed ? "Autentikasi gagal. Silakan coba lagi." : null,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      navigate(redirect, { replace: true });
    } catch {
      setError("Tidak bisa menghubungi layanan login. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Selamat Datang Kembali</CardTitle>
        <CardDescription>Masuk ke akun FlipCard kamu</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Masuk..." : "Masuk"}
          </Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          atau
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleSignInButton redirect={redirect} disabled={loading} onError={setError} />
        <p className="text-center text-sm text-muted-foreground mt-6">
          Belum punya akun?{" "}
          <Link
            to={redirect === DEFAULT_REDIRECT ? "/register" : `/register?redirect=${encodeURIComponent(redirect)}`}
            className="text-primary font-medium hover:underline"
          >
            Daftar di sini
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
