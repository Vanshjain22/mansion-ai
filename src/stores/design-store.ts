import { create } from "zustand";
import type {
  StyleId,
  RoomType,
  ColorPalette,
  Mood,
  LightingPreference,
  BudgetRange,
  DesignConfig,
} from "@/types/design";

/**
 * DESIGN STORE — Zustand state management
 *
 * WHY ZUSTAND OVER REACT CONTEXT?
 *
 * 1. NO PROVIDER WRAPPER — Context requires wrapping your tree in
 *    <DesignProvider>. Zustand is just a hook. No provider nesting hell.
 *
 * 2. SURGICAL RE-RENDERS — With Context, every consumer re-renders when
 *    ANY value changes (even if that consumer only reads `mood`).
 *    Zustand uses selectors:
 *      const mood = useDesignStore(state => state.mood);
 *    Only re-renders when `mood` changes. Other changes are ignored.
 *
 * 3. USABLE OUTSIDE REACT — You can call useDesignStore.getState()
 *    from utility functions, API calls, or anywhere. Context only
 *    works inside React components.
 *
 * 4. ZERO BOILERPLATE — No reducer, no action types, no dispatch.
 *    Just a plain object with functions.
 *
 * STORE DESIGN PATTERN:
 * State and actions live together in one interface. Actions use `set()`
 * to update state immutably (Zustand handles immutability internally).
 */

interface DesignStoreState {
  // ── Selection State ──
  selectedStyle: StyleId | null;
  customPrompt: string;
  roomType: RoomType | null;
  colorPalette: ColorPalette | null;
  mood: Mood | null;
  lighting: LightingPreference | null;
  budget: BudgetRange | null;

  // ── Actions ──
  setStyle: (style: StyleId | null) => void;
  setCustomPrompt: (prompt: string) => void;
  setRoomType: (type: RoomType | null) => void;
  setColorPalette: (palette: ColorPalette | null) => void;
  setMood: (mood: Mood | null) => void;
  setLighting: (lighting: LightingPreference | null) => void;
  setBudget: (budget: BudgetRange | null) => void;

  /** Reset all selections to initial state */
  resetAll: () => void;

  /** Get the current configuration as a plain object (for API submission) */
  getConfig: () => DesignConfig;
}

const initialState = {
  selectedStyle: null as StyleId | null,
  customPrompt: "",
  roomType: null as RoomType | null,
  colorPalette: null as ColorPalette | null,
  mood: null as Mood | null,
  lighting: null as LightingPreference | null,
  budget: null as BudgetRange | null,
};

export const useDesignStore = create<DesignStoreState>((set, get) => ({
  ...initialState,

  // Each setter follows the same pattern: set({ key: value }).
  // Zustand merges the update with existing state (shallow merge).
  setStyle: (style) => set({ selectedStyle: style }),
  setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
  setRoomType: (type) => set({ roomType: type }),
  setColorPalette: (palette) => set({ colorPalette: palette }),
  setMood: (mood) => set({ mood: mood }),
  setLighting: (lighting) => set({ lighting: lighting }),
  setBudget: (budget) => set({ budget: budget }),

  resetAll: () => set(initialState),

  // get() reads current state without subscribing to changes.
  // This is safe to call from actions and utility functions.
  getConfig: () => {
    const state = get();
    return {
      styleId: state.selectedStyle,
      customPrompt: state.customPrompt,
      roomType: state.roomType,
      colorPalette: state.colorPalette,
      mood: state.mood,
      lighting: state.lighting,
      budget: state.budget,
    };
  },
}));
