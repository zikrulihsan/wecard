import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Protected routes: /home, /play, /profile, /store
  const isProtectedRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/play") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/store");

  // Auth routes: redirect to home if already logged in
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Selain itu (landing, /callback, /api, aset) tidak butuh cek user —
  // hindari roundtrip ke Supabase Auth di setiap request.
  if (!isProtectedRoute && !isAuthRoute) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getClaims() memverifikasi JWT secara lokal pakai JWKS (project ini pakai
  // ES256), jadi tidak ada roundtrip ke Supabase Auth seperti getUser().
  const { data: claims } = await supabase.auth.getClaims();
  const user = claims?.claims.sub ? claims.claims : null;

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
