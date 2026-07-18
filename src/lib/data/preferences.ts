import type {
  PreferenceOption,
  RoomType,
  ColorPalette,
  Mood,
  LightingPreference,
  BudgetRange,
} from "@/types/design";

/**
 * PREFERENCE OPTIONS
 *
 * All selectable options for the design customization panel.
 * Each category follows the same PreferenceOption<T> shape,
 * which means ONE reusable selector component handles all of them.
 *
 * The icon field uses emoji for now. In production, you'd swap
 * these for Lucide icons or SVGs. Emoji gives us:
 * - Zero bundle size impact
 * - Universal rendering across platforms
 * - Quick iteration during development
 */

export const ROOM_TYPE_OPTIONS: PreferenceOption<RoomType>[] = [
  { value: "living_room", label: "Living Room", icon: "🛋️" },
  { value: "bedroom", label: "Bedroom", icon: "🛏️" },
  { value: "kitchen", label: "Kitchen", icon: "🍳" },
  { value: "bathroom", label: "Bathroom", icon: "🛁" },
  { value: "dining_room", label: "Dining Room", icon: "🍽️" },
  { value: "home_office", label: "Home Office", icon: "💻" },
  { value: "outdoor", label: "Outdoor", icon: "🌿" },
  { value: "other", label: "Other", icon: "🏠" },
];

export const COLOR_PALETTE_OPTIONS: PreferenceOption<ColorPalette>[] = [
  {
    value: "warm",
    label: "Warm",
    icon: "🔴",
    color: "hsl(15 80% 55%)",
    description: "Reds, oranges, yellows",
  },
  {
    value: "cool",
    label: "Cool",
    icon: "🔵",
    color: "hsl(210 80% 55%)",
    description: "Blues, greens, purples",
  },
  {
    value: "neutral",
    label: "Neutral",
    icon: "⚪",
    color: "hsl(30 10% 65%)",
    description: "Grays, beiges, whites",
  },
  {
    value: "earth",
    label: "Earth",
    icon: "🟤",
    color: "hsl(25 50% 40%)",
    description: "Browns, terracotta, olive",
  },
  {
    value: "monochrome",
    label: "Monochrome",
    icon: "⬛",
    color: "hsl(0 0% 20%)",
    description: "Black, white, grays",
  },
  {
    value: "pastel",
    label: "Pastel",
    icon: "🩷",
    color: "hsl(320 50% 75%)",
    description: "Soft, muted tones",
  },
  {
    value: "vibrant",
    label: "Vibrant",
    icon: "🟡",
    color: "hsl(50 90% 55%)",
    description: "Bold, saturated colors",
  },
  {
    value: "jewel",
    label: "Jewel",
    icon: "💎",
    color: "hsl(270 60% 45%)",
    description: "Emerald, sapphire, ruby",
  },
];

export const MOOD_OPTIONS: PreferenceOption<Mood>[] = [
  { value: "cozy", label: "Cozy", icon: "🕯️", description: "Warm & inviting" },
  {
    value: "elegant",
    label: "Elegant",
    icon: "✨",
    description: "Refined & polished",
  },
  {
    value: "energetic",
    label: "Energetic",
    icon: "⚡",
    description: "Bright & lively",
  },
  {
    value: "serene",
    label: "Serene",
    icon: "🧘",
    description: "Calm & peaceful",
  },
  {
    value: "dramatic",
    label: "Dramatic",
    icon: "🎭",
    description: "Bold & impactful",
  },
  {
    value: "playful",
    label: "Playful",
    icon: "🎨",
    description: "Fun & creative",
  },
  {
    value: "sophisticated",
    label: "Sophisticated",
    icon: "🥂",
    description: "Cultured & tasteful",
  },
  {
    value: "organic",
    label: "Organic",
    icon: "🌱",
    description: "Natural & grounded",
  },
];

export const LIGHTING_OPTIONS: PreferenceOption<LightingPreference>[] = [
  {
    value: "natural",
    label: "Natural",
    icon: "☀️",
    description: "Large windows, daylight",
  },
  {
    value: "warm_ambient",
    label: "Warm Ambient",
    icon: "💡",
    description: "Soft warm glow",
  },
  {
    value: "cool_bright",
    label: "Cool & Bright",
    icon: "💠",
    description: "Modern LED, task lighting",
  },
  {
    value: "dramatic",
    label: "Dramatic",
    icon: "🔦",
    description: "Spotlights, shadows",
  },
  {
    value: "soft_diffused",
    label: "Soft Diffused",
    icon: "🌙",
    description: "Even, gentle illumination",
  },
];

export const BUDGET_OPTIONS: PreferenceOption<BudgetRange>[] = [
  {
    value: "budget",
    label: "Budget",
    icon: "💰",
    description: "Affordable & practical",
  },
  {
    value: "moderate",
    label: "Moderate",
    icon: "💰💰",
    description: "Quality mid-range",
  },
  {
    value: "premium",
    label: "Premium",
    icon: "💰💰💰",
    description: "High-end materials",
  },
  {
    value: "luxury",
    label: "Luxury",
    icon: "👑",
    description: "No budget limit",
  },
];

/**
 * AI-generated prompt suggestions based on popular design requests.
 * These appear as clickable chips in the prompt textarea to help
 * users who don't know what to ask for.
 */
export const PROMPT_SUGGESTIONS: string[] = [
  "Make it feel like a 5-star hotel",
  "Add more natural light and plants",
  "Keep the existing layout but modernize everything",
  "Make it kid-friendly but still stylish",
  "Add a reading nook by the window",
  "Use sustainable and eco-friendly materials",
  "Create a home office area in the corner",
  "Make the space feel twice as large",
];
