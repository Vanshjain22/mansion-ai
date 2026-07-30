"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Images, CreditCard, Settings, Sparkles, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/hooks/use-auth";

/**
 * Dashboard Layout — Shell for all /dashboard/* pages.
 * Includes sidebar navigation, user profile, and responsive design.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/designs", label: "My Designs", icon: Images },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border-subtle bg-bg-secondary/50 backdrop-blur-xl">
        {/* Logo */}
        <div className="p-6 border-b border-border-subtle">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl gradient-cta flex items-center justify-center shadow-lg group-hover:shadow-brand-primary/30 transition-shadow">
              <Sparkles className="w-5 h-5 text-bg-primary" />
            </div>
            <span className="text-lg font-extrabold font-[family-name:var(--font-playfair)]">
              MansionAI
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-brand-primary/15 text-brand-primary border border-brand-primary/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary"
                )}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* New Design CTA */}
        <div className="p-4 border-t border-border-subtle">
          <Link
            href="/generation-demo"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl gradient-cta text-bg-primary font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            New Design
          </Link>
        </div>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-border-subtle">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-brand-primary/20 border border-brand-primary/30 flex items-center justify-center text-xs font-bold text-brand-primary">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </p>
                <p className="text-[11px] text-text-tertiary truncate">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-text-tertiary hover:text-error hover:bg-error/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b border-border-subtle bg-bg-primary/90 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-cta flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-bg-primary" />
            </div>
            <span className="font-bold text-sm">MansionAI</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive ? "text-brand-primary bg-brand-primary/10" : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 lg:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
