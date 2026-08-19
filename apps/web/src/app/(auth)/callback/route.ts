import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safePath } from "@/lib/safe-path";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Digabung sebagai string dengan `origin` di bawah, jadi nilai mentah dari
  // query bisa membajak host lewat bagian userinfo: "@evil.com" mengubah
  // `https://flipcard.app@evil.com` jadi kunjungan ke evil.com.
  const redirect = safePath(searchParams.get("redirect"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
