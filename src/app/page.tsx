import { Navbar } from "@/components/features/landing/Navbar";
import { Hero } from "@/components/features/landing/Hero";
import { StatsBar } from "@/components/features/landing/StatsBar";
import { TrustLogos } from "@/components/features/landing/TrustLogos";
import { HowItWorks } from "@/components/features/landing/HowItWorks";
import { PopularStyles } from "@/components/features/landing/PopularStyles";
import { GalleryShowcase } from "@/components/features/landing/GalleryShowcase";
import { Testimonials } from "@/components/features/landing/Testimonials";
import { CTABanner } from "@/components/features/landing/CTABanner";
import { Footer } from "@/components/features/landing/Footer";
import { PageBackground } from "@/components/features/landing/PageBackground";

/*
 * HOME PAGE — MansionAI Landing Page
 *
 * Premium luxury AI Interior Design SaaS landing page.
 * This is a Server Component that composes all landing page sections.
 * Interactive sections (Navbar, Hero, HowItWorks, PopularStyles, Testimonials)
 * are client components for their respective interactions.
 */
export default function Home() {
  return (
    <>
      <PageBackground />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Hero />
        <StatsBar />
        <TrustLogos />
        <HowItWorks />
        <PopularStyles />
        <GalleryShowcase />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
      {/* Footer sits above background */}
    </>
  );
}
