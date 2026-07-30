import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next.js <Image> to serve images from these sources.
    remotePatterns: [
      {
        // Unsplash — used for sample room photos and mock AI outputs
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase Storage — uploaded room photos and generated images
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        // Cloudflare AI — generated image outputs
        protocol: "https",
        hostname: "*.cloudflare.com",
      },
    ],
    dangerouslyAllowSVG: false,
    // Use unoptimized in dev for speed; disable in production
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
