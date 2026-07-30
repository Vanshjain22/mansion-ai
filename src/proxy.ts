import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Proxy — Runs on every request before it reaches the route handler.
 *
 * Replaces the deprecated `middleware.ts` convention per Next.js 16.
 * The functionality is identical — only the file and export name changed.
 *
 * This proxy:
 * 1. Refreshes Supabase auth sessions (preventing expired token errors)
 * 2. Protects routes that require authentication
 * 3. Redirects unauthenticated users to /login
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Matcher config — tells Next.js which routes this proxy should run on.
 * We exclude static files and Next.js internals for performance.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Images in /images/ folder
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
