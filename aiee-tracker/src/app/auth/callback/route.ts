import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic-link / OTP callback. Supabase redirects here with ?code=... after the
// user clicks the email link. We exchange the code for a session cookie, then
// verify the signed-in email is on the staff allowlist before letting them in.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=missing_code`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/auth/error?reason=${encodeURIComponent(exchangeError.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.redirect(`${origin}/auth/error?reason=no_user`);
  }

  // Allowlist check — sign the user out if they're not authorized.
  const { data: allowed } = await supabase
    .from("staff_allowlist")
    .select("email")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!allowed) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/error?reason=not_allowlisted`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
