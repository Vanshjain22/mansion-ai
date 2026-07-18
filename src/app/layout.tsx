import type { Metadata } from "next";
import { Inter, Playfair_Display, Manrope, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

/*
 * FONT STRATEGY — LUXURY EDITION
 *
 * 1. Inter (body text) — Industry standard for UI readability.
 * 2. Playfair Display (headings) — Elegant serif with high contrast,
 *    evokes luxury editorial and architectural design.
 * 3. Manrope (buttons/CTAs) — Geometric sans-serif with optical
 *    precision. Used for CTAs and navigation for a premium SaaS feel.
 * 4. Geist (sans fallback) — Clean system-level fallback.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MansionAI — AI Interior Design",
    template: "%s | MansionAI",
  },
  description:
    "Transform any room with AI-powered interior design. Upload a photo, choose a style, and see your space reimagined in seconds.",
  keywords: [
    "AI interior design",
    "room redesign",
    "virtual staging",
    "home makeover",
    "AI design tool",
    "MansionAI",
  ],
  authors: [{ name: "MansionAI Team" }],
  metadataBase: new URL("https://mansion-ai.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mansion-ai.com",
    title: "MansionAI — AI Interior Design",
    description: "Reimagine any space in seconds. Upload a room photo and let AI design it in 10+ premium styles.",
    siteName: "MansionAI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MansionAI Room Transformation Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MansionAI — AI Interior Design",
    description: "Reimagine any space in seconds. Upload a room photo and let AI design it in 10+ premium styles.",
    images: ["/og-image.jpg"],
    creator: "@mansion_ai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


/*
 * ROOT LAYOUT
 *
 * Top-level Server Component wrapping every page.
 * Font CSS variables are applied to <html> so all descendants inherit them.
 * "antialiased" smooths rendering. Dark background via CSS custom properties.
 */
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data representing our software application
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MansionAI",
    "operatingSystem": "All",
    "applicationCategory": "DesignApplication",
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "USD",
    },
    "description": "Transform any room with AI-powered interior design. Upload a photo, choose a style, and see your space reimagined in seconds.",
  };

  return (
    <html
      lang="en"
      className={cn(
        "antialiased",
        inter.variable,
        playfair.variable,
        manrope.variable,
        geist.variable,
        "font-sans"
      )}
    >
      <body className="min-h-screen flex flex-col">
        {/* Injecting structured data for search engine bots */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
