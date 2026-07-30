import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import type {
  StyleId,
  RoomType,
  ColorPalette,
  Mood,
  LightingPreference,
  BudgetRange,
  FurniturePreference,
  DesignConfig,
} from "@/types/design";

/**
 * DESIGN STORE — Zustand state management with persist + undo/redo.
 *
 * FEATURES:
 * - Auto-save preferences to localStorage (persist middleware)
 * - Undo/Redo history with temporal middleware (zundo)
 * - Surgical re-renders via selectors
 * - Callable outside React via getState()
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
  creativityLevel: number;
  furniturePreference: FurniturePreference | null;
  negativePrompt: string;

  // ── Actions ──
  setStyle: (style: StyleId | null) => void;
  setCustomPrompt: (prompt: string) => void;
  setRoomType: (type: RoomType | null) => void;
  setColorPalette: (palette: ColorPalette | null) => void;
  setMood: (mood: Mood | null) => void;
  setLighting: (lighting: LightingPreference | null) => void;
  setBudget: (budget: BudgetRange | null) => void;
  setCreativityLevel: (level: number) => void;
  setFurniturePreference: (pref: FurniturePreference | null) => void;
  setNegativePrompt: (prompt: string) => void;

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
  creativityLevel: 7,
  furniturePreference: null as FurniturePreference | null,
  negativePrompt: "",
};

export const useDesignStore = create<DesignStoreState>()(
  temporal(
    persist(
      (set, get) => ({
        ...initialState,

        setStyle: (style) => set({ selectedStyle: style }),
        setCustomPrompt: (prompt) => set({ customPrompt: prompt }),
        setRoomType: (type) => set({ roomType: type }),
        setColorPalette: (palette) => set({ colorPalette: palette }),
        setMood: (mood) => set({ mood: mood }),
        setLighting: (lighting) => set({ lighting: lighting }),
        setBudget: (budget) => set({ budget: budget }),
        setCreativityLevel: (level) => set({ creativityLevel: level }),
        setFurniturePreference: (pref) => set({ furniturePreference: pref }),
        setNegativePrompt: (prompt) => set({ negativePrompt: prompt }),

        resetAll: () => set(initialState),

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
            creativityLevel: state.creativityLevel,
            furniturePreference: state.furniturePreference,
            negativePrompt: state.negativePrompt,
          };
        },
      }),
      {
        name: "mansionai-design-prefs",
        // Only persist preference fields, not prompts (session-specific)
        partialize: (state) => ({
          selectedStyle: state.selectedStyle,
          roomType: state.roomType,
          colorPalette: state.colorPalette,
          mood: state.mood,
          lighting: state.lighting,
          budget: state.budget,
          creativityLevel: state.creativityLevel,
          furniturePreference: state.furniturePreference,
        }),
      }
    ),
    {
      limit: 50,
      // Only track preference changes, not text input (too noisy)
      equality: (pastState, currentState) =>
        pastState.selectedStyle === currentState.selectedStyle &&
        pastState.roomType === currentState.roomType &&
        pastState.colorPalette === currentState.colorPalette &&
        pastState.mood === currentState.mood &&
        pastState.lighting === currentState.lighting &&
        pastState.budget === currentState.budget &&
        pastState.creativityLevel === currentState.creativityLevel &&
        pastState.furniturePreference === currentState.furniturePreference,
    }
  )
);
