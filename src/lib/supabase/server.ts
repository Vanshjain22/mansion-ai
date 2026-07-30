import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase Server Client — for use in Server Components, API Routes, and Middleware.
 *
 * This creates a Supabase client that can read/write cookies for session management.
 * The cookie handling is required because Supabase stores auth tokens in cookies
 * to maintain sessions across page navigations.
 *
 * WHY COOKIES?
 * Unlike traditional JWTs stored in localStorage, Supabase uses httpOnly cookies.
 * This is more secure because:
 * 1. httpOnly cookies can't be accessed by JavaScript (XSS protection)
 * 2. They're automatically sent with every request (no manual header management)
 * 3. They work with SSR (server has access to the session)
 *
 * USAGE:
 * ```ts
 * import { createClient } from "@/lib/supabase/server";
 * const supabase = await createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}
