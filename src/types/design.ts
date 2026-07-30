/*
 * DESIGN TYPES
 *
 * All types related to the design creation flow:
 * style selection, room preferences, and customization options.
 *
 * These types serve as the "contract" between:
 * - The Zustand store (state shape)
 * - The UI components (what they render)
 * - The data files (what options exist)
 * - The future API layer (what gets sent to the AI)
 *
 * NAMING CONVENTION:
 * Types that represent a fixed set of options use string literal unions
 * (e.g., StyleId, RoomType). This gives us autocompletion and typo
 * protection. Adding a new option = adding one string to the union,
 * and TypeScript shows every place that needs updating.
 */

// ── Style System ──

export type StyleId =
  | "modern"
  | "minimalist"
  | "scandinavian"
  | "industrial"
  | "japandi"
  | "luxury"
  | "bohemian"
  | "rustic"
  | "contemporary"
  | "traditional";

export interface StyleDefinition {
  id: StyleId;
  name: string;
  description: string;
  /** The prompt fragment sent to the AI model for this style */
  promptTemplate: string;
  /** CSS gradient representing this style's aesthetic */
  gradient: string;
  /** Matching high-res interior design image URL */
  image: string;
  /** Visual accent color used for the selected state ring */
  accentColor: string;
  tags: string[];
}

// ── Room Configuration ──

export type RoomType =
  | "living_room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "dining_room"
  | "home_office"
  | "outdoor"
  | "other";

// ── Design Preferences ──

export type ColorPalette =
  | "warm"
  | "cool"
  | "neutral"
  | "earth"
  | "monochrome"
  | "pastel"
  | "vibrant"
  | "jewel";

export type Mood =
  | "cozy"
  | "elegant"
  | "energetic"
  | "serene"
  | "dramatic"
  | "playful"
  | "sophisticated"
  | "organic";

export type LightingPreference =
  | "natural"
  | "warm_ambient"
  | "cool_bright"
  | "dramatic"
  | "soft_diffused";

export type BudgetRange = "budget" | "moderate" | "premium" | "luxury";

export type FurniturePreference = "keep" | "replace" | "mix";

/**
 * Generic option type for all preference selectors.
 * This is the key to our reusable PreferenceSelector component —
 * every preference (mood, lighting, budget, etc.) is just a list
 * of these options with different icons and labels.
 */
export interface PreferenceOption<T extends string = string> {
  value: T;
  label: string;
  icon: string;
  description?: string;
  /** Optional CSS color for visual indicators (e.g., color palette swatches) */
  color?: string;
}

/**
 * Complete design configuration submitted for AI generation.
 * This is the "output" of the entire design studio flow.
 */
export interface DesignConfig {
  styleId: StyleId | null;
  customPrompt: string;
  roomType: RoomType | null;
  colorPalette: ColorPalette | null;
  mood: Mood | null;
  lighting: LightingPreference | null;
  budget: BudgetRange | null;
  creativityLevel: number;
  furniturePreference: FurniturePreference | null;
  negativePrompt: string;
}
