import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase Auth Middleware — Refreshes expired sessions on every request.
 *
 * WHY MIDDLEWARE?
 * Supabase access tokens expire after ~1 hour. Without middleware, a user could
 * be browsing the app with an expired token, and the next API call would fail.
 *
 * This middleware runs on every request and:
 * 1. Reads the auth cookies from the incoming request
 * 2. Calls supabase.auth.getUser() which auto-refreshes the token if expired
 * 3. Writes the refreshed cookies to the response
 *
 * It also handles route protection — redirecting unauthenticated users away from
 * protected routes like /generation-demo and /dashboard.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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

  // IMPORTANT: Do NOT use getSession() here.
  // getSession() reads from cookies and is NOT secure for server-side checks.
  // getUser() actually validates the JWT with Supabase's backend.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Route Protection ──
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/pricing", "/api/billing/webhook"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isApiRoute = pathname.startsWith("/api/");
  const isStaticAsset = pathname.startsWith("/_next/") || pathname.startsWith("/images/");

  // Allow public routes, API routes, and static assets through
  if (isPublicRoute || isApiRoute || isStaticAsset) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
