"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { SiteConfig } from "@/types";

interface NavbarProps {
  config: SiteConfig;
}

export function Navbar({ config }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navbar = config.navbar || { links: [], cta: [] };

  return (
    <nav className="sticky top-0 z-30 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 font-semibold text-lg shrink-0">
            {config.logo && (
              <img src={config.logo} alt={config.name} className="h-12 w-auto object-contain" />
            )}
            <span>{config.name}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navbar.links.map((link, i) => (
              <Link
                key={i}
                href={link.url}
                className="text-sm text-[var(--color-content-muted)] hover:text-[var(--color-content)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {navbar.cta.map((cta, i) => (
              <a
                key={i}
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  cta.style === "primary"
                    ? "bg-[var(--color-primary)] text-white hover:opacity-90"
                    : "border border-[var(--color-border)] text-[var(--color-content)] hover:bg-[var(--color-surface-sidebar)]"
                }`}
              >
                {cta.label}
              </a>
            ))}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg md:hidden"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-0 right-0 w-72 h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold">{config.name}</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 mb-6">
              {navbar.links.map((link, i) => (
                <Link
                  key={i}
                  href={link.url}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm hover:bg-[var(--color-surface-sidebar)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              {navbar.cta.map((cta, i) => (
                <a
                  key={i}
                  href={cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block px-4 py-2 text-sm font-medium rounded-lg text-center transition-colors ${
                    cta.style === "primary"
                      ? "bg-[var(--color-primary)] text-white"
                      : "border border-[var(--color-border)]"
                  }`}
                >
                  {cta.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 px-3 py-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
