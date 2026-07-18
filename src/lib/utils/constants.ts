/*
 * APP-WIDE CONSTANTS
 * 
 * Why a constants file?
 * Magic numbers and strings scattered across code are:
 * 1. Hard to find when they need to change
 * 2. Easy to make inconsistent (one file says "3 credits", another says "5")
 * 3. Impossible to reason about without context
 * 
 * By centralizing them here, every value has a name that explains its purpose,
 * and changing it updates the entire application.
 */

export const APP_NAME = "MansionAI";
export const APP_DESCRIPTION =
  "Transform any room with AI-powered interior design.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/* Credits given to new users. Enough to try the product, not enough to abuse it. */
export const FREE_CREDITS = 3;

/* Credits consumed per AI generation. May vary by model quality in the future. */
export const CREDITS_PER_GENERATION = 1;

/* Maximum file size for room photo uploads (5MB) */
export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

/* Accepted image MIME types for room uploads */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/* How often the client polls for generation status (in milliseconds) */
export const GENERATION_POLL_INTERVAL_MS = 2000;

/* 
 * Room types for categorization.
 * Using 'as const' makes TypeScript infer literal types instead of just 'string'.
 * This means RoomType becomes "living_room" | "bedroom" | ... instead of string.
 */
export const ROOM_TYPES = [
  "living_room",
  "bedroom",
  "kitchen",
  "bathroom",
  "dining_room",
  "home_office",
  "outdoor",
  "other",
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

/*
 * Style presets available in the MVP.
 * Each preset maps to an AI prompt template.
 * The 'slug' is used in URLs and API calls (URL-safe).
 * The 'name' is the user-facing display label.
 */
export const STYLE_PRESETS = [
  { slug: "modern-minimalist", name: "Modern Minimalist" },
  { slug: "scandinavian", name: "Scandinavian" },
  { slug: "industrial", name: "Industrial" },
  { slug: "mid-century-modern", name: "Mid-Century Modern" },
  { slug: "japandi", name: "Japandi" },
  { slug: "coastal", name: "Coastal" },
  { slug: "art-deco", name: "Art Deco" },
  { slug: "bohemian", name: "Bohemian" },
] as const;
