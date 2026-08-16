import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readAuthSnapshot } from "./session";

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/home") ||
    pathname.startsWith("/play") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/store") ||
    pathname.startsWith("/create")
  );
}

function isAuthPath(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}

function routeFor(request: NextRequest, isSignedIn: boolean) {
  const { pathname } = request.nextUrl;

  if (!isSignedIn && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isSignedIn && isAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return null;
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Selain rute terproteksi & rute auth (landing, /callback, /api, aset)
  // tidak butuh cek sesi sama sekali.
  if (!isProtectedPath(pathname) && !isAuthPath(pathname)) {
    return NextResponse.next({ request });
  }

  const snapshot = readAuthSnapshot(
    (name) => request.cookies.get(name)?.value,
    process.env.NEXT_PUBLIC_SUPABASE_URL!
  );

  // ── Jalur cepat ────────────────────────────────────────────────────────
  // Token masih hidup dan belum mendekati kedaluwarsa, atau memang tidak ada
  // sesi sama sekali. Keputusan routing diambil dari klaim JWT yang dibaca
  // lokal — nol roundtrip ke Supabase. Ini yang terjadi di hampir semua
  // navigasi; jalur lambat di bawah cuma kena sekali per umur token.
  if (!snapshot || !snapshot.needsRefresh) {
    return routeFor(request, Boolean(snapshot)) ?? NextResponse.next({ request });
  }

  // ── Jalur lambat ───────────────────────────────────────────────────────
  // Token sudah lewat atau tinggal < 90 detik. getSession() memakai refresh
  // token untuk menerbitkan access token baru, lalu cookienya ditulis ulang
  // lewat setAll di bawah.
  let supabaseResponse = NextResponse.next({ request });

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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const redirect = routeFor(request, Boolean(session));
  if (!redirect) {
    return supabaseResponse;
  }

  // Cookie hasil refresh harus ikut terbawa ke response redirect, kalau tidak
  // token barunya hilang dan request berikutnya me-refresh lagi.
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}
