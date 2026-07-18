import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Next.js <Image> to serve images from these sources.
    // 'blob:' is needed for our instant upload previews (URL.createObjectURL).
    // In production, add your CDN domain (e.g., "cdn.mansion-ai.com").
    remotePatterns: [],
    dangerouslyAllowSVG: false,
    unoptimized: false,
  },
};

export default nextConfig;

