import { createClient } from "@/lib/supabase/server";

/**
 * getAuthUser — Resolves the current authenticated user from the request.
 *
 * Uses Supabase's server-side client to validate the JWT from cookies.
 * Returns the user object if authenticated, or null if not.
 *
 * USAGE in API routes:
 * ```ts
 * const user = await getAuthUser();
 * if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * // user.id is the authenticated user's UUID
 * ```
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
