import type { StyleDefinition, StyleId } from "@/types/design";

/**
 * STYLE DEFINITIONS
 *
 * Each style has a carefully crafted CSS gradient that visually represents
 * its aesthetic. This is a deliberate design choice — premium design tools
 * (Figma, Canva, Notion) use abstract visual cards for categories because:
 *
 * 1. Zero network requests (instant load)
 * 2. Resolution-independent (perfect on any screen)
 * 3. Consistent visual language (no mismatched photo styles)
 * 4. Lightweight (no image bytes to download)
 *
 * The `promptTemplate` is the text fragment sent to the AI when this
 * style is selected. It uses {room_type} as a placeholder that gets
 * replaced with the actual room type at generation time.
 */

export const STYLES: StyleDefinition[] = [
  {
    id: "modern",
    name: "Modern",
    description:
      "Clean lines, open spaces, and a neutral palette with bold accent pieces.",
    promptTemplate:
      "A modern {room_type} with clean lines, open floor plan, neutral color palette with bold accent pieces, contemporary furniture, large windows with natural light",
    gradient:
      "linear-gradient(135deg, hsl(220 15% 18%) 0%, hsl(220 20% 12%) 50%, hsl(210 30% 20%) 100%)",
    accentColor: "hsl(210 100% 60%)",
    tags: ["Clean", "Neutral", "Bold accents"],
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description:
      "Less is more. Monochromatic tones, essential furniture, and purposeful negative space.",
    promptTemplate:
      "A minimalist {room_type} with monochromatic color scheme, essential furniture only, lots of negative space, clean surfaces, simple geometric forms, subtle textures",
    gradient:
      "linear-gradient(135deg, hsl(0 0% 96%) 0%, hsl(0 0% 88%) 50%, hsl(0 0% 82%) 100%)",
    accentColor: "hsl(0 0% 40%)",
    tags: ["Monochrome", "Negative space", "Essential"],
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    description:
      "Light woods, soft whites, and cozy textures inspired by Nordic living.",
    promptTemplate:
      "A Scandinavian {room_type} with light wood floors and furniture, white walls, soft textiles, sheepskin throws, muted pastel accents, natural daylight, hygge atmosphere",
    gradient:
      "linear-gradient(135deg, hsl(35 30% 90%) 0%, hsl(30 20% 85%) 50%, hsl(25 15% 78%) 100%)",
    accentColor: "hsl(35 60% 65%)",
    tags: ["Light wood", "White", "Cozy"],
  },
  {
    id: "industrial",
    name: "Industrial",
    description:
      "Exposed brick, metal fixtures, and raw materials with urban character.",
    promptTemplate:
      "An industrial {room_type} with exposed brick walls, metal pipe fixtures, concrete floors, Edison bulb lighting, reclaimed wood, dark leather furniture, loft-style high ceilings",
    gradient:
      "linear-gradient(135deg, hsl(20 8% 20%) 0%, hsl(15 10% 14%) 50%, hsl(25 15% 22%) 100%)",
    accentColor: "hsl(25 80% 50%)",
    tags: ["Brick", "Metal", "Raw"],
  },
  {
    id: "japandi",
    name: "Japandi",
    description:
      "Japanese minimalism meets Scandinavian warmth. Natural materials, wabi-sabi imperfection.",
    promptTemplate:
      "A Japandi {room_type} blending Japanese and Scandinavian aesthetics, natural wood tones, paper lanterns, low furniture, indoor plants, wabi-sabi ceramics, neutral earth tones, zen simplicity",
    gradient:
      "linear-gradient(135deg, hsl(80 15% 75%) 0%, hsl(40 20% 80%) 50%, hsl(30 15% 85%) 100%)",
    accentColor: "hsl(80 25% 55%)",
    tags: ["Zen", "Natural", "Wabi-sabi"],
  },
  {
    id: "luxury",
    name: "Luxury",
    description:
      "Opulent materials, rich jewel tones, and statement furniture that commands attention.",
    promptTemplate:
      "A luxury {room_type} with velvet upholstery, marble surfaces, gold accents, crystal chandelier, rich jewel tones, ornate mirrors, plush carpets, premium designer furniture",
    gradient:
      "linear-gradient(135deg, hsl(270 30% 15%) 0%, hsl(280 25% 10%) 50%, hsl(40 60% 30%) 100%)",
    accentColor: "hsl(42 80% 55%)",
    tags: ["Velvet", "Marble", "Gold"],
  },
  {
    id: "bohemian",
    name: "Bohemian",
    description:
      "Eclectic layers of pattern, texture, and color. Free-spirited and globally inspired.",
    promptTemplate:
      "A bohemian {room_type} with layered textiles, macramé wall hangings, rattan furniture, colorful kilim rugs, hanging plants, global patterns, warm ambient lighting, collected vintage pieces",
    gradient:
      "linear-gradient(135deg, hsl(15 50% 45%) 0%, hsl(170 30% 35%) 50%, hsl(35 40% 50%) 100%)",
    accentColor: "hsl(15 60% 55%)",
    tags: ["Eclectic", "Textured", "Colorful"],
  },
  {
    id: "rustic",
    name: "Rustic",
    description:
      "Reclaimed wood, stone accents, and earthy warmth. A cabin in the mountains.",
    promptTemplate:
      "A rustic {room_type} with reclaimed wood beams, stone fireplace, natural linen textiles, wrought iron fixtures, warm earth tones, handcrafted pottery, cozy cabin atmosphere",
    gradient:
      "linear-gradient(135deg, hsl(25 30% 30%) 0%, hsl(120 15% 25%) 50%, hsl(30 25% 35%) 100%)",
    accentColor: "hsl(25 40% 50%)",
    tags: ["Wood", "Stone", "Earthy"],
  },
  {
    id: "contemporary",
    name: "Contemporary",
    description:
      "Current trends and sleek forms. A living, evolving interpretation of modern design.",
    promptTemplate:
      "A contemporary {room_type} with sleek furniture, curved organic forms, mix of materials, statement art pieces, sophisticated color palette, ambient LED lighting, floor-to-ceiling windows",
    gradient:
      "linear-gradient(135deg, hsl(200 40% 20%) 0%, hsl(180 25% 25%) 50%, hsl(160 30% 30%) 100%)",
    accentColor: "hsl(180 60% 50%)",
    tags: ["Sleek", "Art", "Trending"],
  },
  {
    id: "traditional",
    name: "Traditional",
    description:
      "Timeless elegance with rich woods, classic patterns, and refined craftsmanship.",
    promptTemplate:
      "A traditional {room_type} with dark wood furniture, damask or toile patterns, wingback chairs, crown molding, classic table lamps, oriental rugs, oil paintings, warm lighting",
    gradient:
      "linear-gradient(135deg, hsl(220 30% 15%) 0%, hsl(350 25% 20%) 50%, hsl(220 20% 18%) 100%)",
    accentColor: "hsl(350 40% 45%)",
    tags: ["Classic", "Rich wood", "Timeless"],
  },
];

/** Lookup a style by ID. Returns undefined if not found. */
export function getStyleById(id: StyleId): StyleDefinition | undefined {
  return STYLES.find((s) => s.id === id);
}
