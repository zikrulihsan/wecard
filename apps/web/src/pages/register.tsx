import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
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

export default function RegisterPage() {
  const t = useT();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await createClient().auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        navigate("/home", { replace: true });
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t.auth.registerUnreachable);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="border-none shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.auth.checkEmailTitle}</CardTitle>
          <CardDescription>
            {t.auth.checkEmailLead} <strong>{email}</strong>
            {t.auth.checkEmailRest}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/login" className={buttonVariants({ size: "lg", className: "w-full" })}>
            {t.auth.backToLogin}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t.auth.registerTitle}</CardTitle>
        <CardDescription>{t.auth.registerSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.auth.name}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t.auth.namePlaceholder}
            />
          </div>
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
              minLength={6}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">{t.auth.passwordHint}</p>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t.auth.registering : t.auth.register}
          </Button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          {t.common.or}
          <span className="h-px flex-1 bg-border" />
        </div>
        <GoogleSignInButton disabled={loading} onError={setError} />
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t.auth.haveAccount}{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            {t.auth.loginHere}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
