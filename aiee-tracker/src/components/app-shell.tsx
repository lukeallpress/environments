"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "./brand-mark";
import { SignOutButton } from "./sign-out-button";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orgs", label: "Organizations" },
  { href: "/contacts", label: "Contacts" },
  { href: "/events", label: "Events" },
  { href: "/interactions", label: "Interactions" },
  { href: "/reports", label: "Reports" },
  { href: "/admin", label: "Admin" },
];

export function AppShell({
  user,
  children,
}: {
  user: { email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-full">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <Link href="/dashboard" className="flex items-center">
            <BrandMark size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    active
                      ? "bg-nau-navy-50 text-nau-navy"
                      : "text-ink-muted hover:text-nau-navy hover:bg-nau-navy-50/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-ink-muted">{user.email}</span>
            <SignOutButton />
          </div>

          <button
            className="md:hidden p-2 rounded-md text-ink-muted hover:bg-nau-navy-50"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-border bg-surface">
            <div className="px-4 py-2 flex flex-col">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-md text-sm font-medium ${
                      active ? "bg-nau-navy-50 text-nau-navy" : "text-ink-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-border mt-2 pt-3 pb-2 flex items-center justify-between px-3">
                <span className="text-xs text-ink-muted">{user.email}</span>
                <SignOutButton />
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Mobile-only floating action button — quick-add interaction (placeholder). */}
      <Link
        href="/interactions/new"
        aria-label="Log interaction"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-nau-gold text-nau-navy shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-nau-gold-600 transition"
      >
        +
      </Link>
    </div>
  );
}
