import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/auth/callback
 *
 * OAuth Callback Handler — This is where Supabase redirects after a successful
 * Google/GitHub OAuth sign-in.
 *
 * FLOW:
 * 1. User clicks "Sign in with Google" → redirected to Google consent screen
 * 2. Google redirects back to this URL with a `code` query parameter
 * 3. We exchange that `code` for a Supabase session
 * 4. Redirect the user to the studio (or wherever they were trying to go)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/generation-demo";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // If no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
