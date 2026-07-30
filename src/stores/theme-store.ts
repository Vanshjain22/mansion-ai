import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * THEME STORE — Dark / Light / System theme management.
 *
 * Persisted to localStorage. Applies class to <html> element.
 */

type Theme = "dark" | "light" | "system";

interface ThemeStoreState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
}

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "dark" | "light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(resolved);
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set, get) => ({
      theme: "dark" as Theme,
      resolvedTheme: "dark" as "dark" | "light",

      setTheme: (theme: Theme) => {
        const resolved = theme === "system" ? getSystemTheme() : theme;
        applyTheme(resolved);
        set({ theme, resolvedTheme: resolved });
      },
    }),
    {
      name: "mansionai-theme",
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const resolved =
          state.theme === "system" ? getSystemTheme() : state.theme;
        applyTheme(resolved);
        useThemeStore.setState({ resolvedTheme: resolved });
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      const store = useThemeStore.getState();
      if (store.theme === "system") {
        const resolved = getSystemTheme();
        applyTheme(resolved);
        useThemeStore.setState({ resolvedTheme: resolved });
      }
    });
}
