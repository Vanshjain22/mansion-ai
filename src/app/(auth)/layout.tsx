import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { APP_NAME } from "@/lib/utils/constants";
import { PageBackground } from "@/components/features/landing/PageBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Background FX (floating particles & gold grid mesh) */}
      <PageBackground />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center group-hover:bg-brand-primary/30 transition-colors shadow-lg shadow-brand-primary/10">
            <Sparkles className="w-4.5 h-4.5 text-brand-primary" />
          </div>
          <span className="text-xl font-bold font-[family-name:var(--font-playfair)] text-gradient">
            {APP_NAME}
          </span>
        </Link>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-secondary/60 hover:bg-bg-tertiary border border-border-subtle hover:border-border-default transition-all duration-200 focus-ring"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Subtle Bottom Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 py-6 text-center text-xs text-text-tertiary">
        <p>© {new Date().getFullYear()} {APP_NAME} Inc. All rights reserved. • High-Precision AI Interior Staging</p>
      </footer>
    </div>
  );
}
