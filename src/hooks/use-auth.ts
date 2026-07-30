"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * useAuth — Client-side hook to get the current authenticated user.
 *
 * Subscribes to Supabase auth state changes so the UI auto-updates
 * when the user signs in, signs out, or their session refreshes.
 *
 * USAGE:
 * ```tsx
 * const { user, loading, signOut } = useAuth();
 * if (loading) return <Spinner />;
 * if (!user) return <LoginPrompt />;
 * return <p>Welcome, {user.email}</p>;
 * ```
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    // Redirect to home after sign out
    window.location.href = "/";
  }, []);

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user,
  };
}
