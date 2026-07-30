import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase Browser Client — for use in Client Components.
 *
 * This creates a Supabase client configured with the project URL and
 * publishable key. The publishable key is safe to expose in the browser —
 * Supabase uses Row Level Security (RLS) policies on the database to
 * enforce access control, not the key itself.
 *
 * USAGE:
 * ```ts
 * import { createClient } from "@/lib/supabase/client";
 * const supabase = createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
