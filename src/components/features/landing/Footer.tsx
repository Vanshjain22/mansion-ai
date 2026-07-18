import Link from "next/link";
import { Sparkles, Send } from "lucide-react";
import { APP_NAME } from "@/lib/utils/constants";

const PRODUCT_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Gallery", href: "#gallery" },
  { label: "Pricing", href: "/pricing" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "#" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Refund Policy", href: "#" },
];

const SOCIAL_LINKS = [
  { label: "Facebook", icon: "f" },
  { label: "Instagram", icon: "◎" },
  { label: "Twitter", icon: "𝕏" },
  { label: "Pinterest", icon: "P" },
  { label: "YouTube", icon: "▶" },
];

export function Footer() {
  return (
    <footer className="relative pt-16 pb-8 border-t border-border-subtle">
      {/* Background */}
      <div className="absolute inset-0 bg-bg-secondary/50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              </div>
              <span className="text-base font-bold font-[family-name:var(--font-playfair)] text-gradient">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-xs text-text-tertiary leading-relaxed max-w-[200px]">
              AI-powered interior design for beautiful living. Transform any
              room in seconds.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold font-[family-name:var(--font-manrope)] text-text-primary uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold font-[family-name:var(--font-manrope)] text-text-primary uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold font-[family-name:var(--font-manrope)] text-text-primary uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <h4 className="text-xs font-semibold font-[family-name:var(--font-manrope)] text-text-primary uppercase tracking-wider mb-4">
              Subscribe to our newsletter
            </h4>
            <p className="text-xs text-text-tertiary mb-3">
              Get design tips, updates, and special offers.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-xs bg-bg-tertiary border border-border-default rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-brand-primary/40 focus:outline-none transition-colors"
              />
              <button
                className="w-9 h-9 rounded-lg bg-brand-primary text-text-inverse flex items-center justify-center hover:bg-brand-primary-hover transition-colors shrink-0"
                aria-label="Subscribe"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider mb-6" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <button
                key={social.label}
                className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:border-border-default transition-all text-xs"
                aria-label={social.label}
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
