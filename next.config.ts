import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
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
