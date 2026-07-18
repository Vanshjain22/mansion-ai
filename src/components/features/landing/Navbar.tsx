"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/utils/constants";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Gallery", href: "#gallery" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "#" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[hsl(0_0%_2%/0.85)] backdrop-blur-2xl border-b border-border-subtle shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center group-hover:bg-brand-primary/30 transition-colors">
              <Sparkles className="w-4 h-4 text-brand-primary" />
            </div>
            <span className="text-lg font-bold font-[family-name:var(--font-playfair)] text-gradient">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-[family-name:var(--font-manrope)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="#"
              className="px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors font-[family-name:var(--font-manrope)]"
            >
              Log in
            </Link>
            <Link
              href="/generation-demo"
              className="px-5 py-2.5 text-sm font-semibold font-[family-name:var(--font-manrope)] bg-brand-primary text-text-inverse rounded-lg hover:bg-brand-primary-hover transition-all duration-300 gold-glow flex items-center gap-1.5"
            >
              Get Started Free
              <span className="text-xs">→</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-16 z-40 transition-all duration-400 ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`relative bg-bg-secondary border-t border-border-subtle p-6 transition-transform duration-400 ${
            mobileOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-base text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors font-[family-name:var(--font-manrope)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border-subtle space-y-3">
            <Link
              href="#"
              className="block w-full text-center px-4 py-3 text-sm text-text-secondary hover:text-text-primary border border-border-default rounded-lg transition-colors font-[family-name:var(--font-manrope)]"
            >
              Log in
            </Link>
            <Link
              href="/generation-demo"
              className="block w-full text-center px-4 py-3 text-sm font-semibold bg-brand-primary text-text-inverse rounded-lg hover:bg-brand-primary-hover transition-colors font-[family-name:var(--font-manrope)]"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
