"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ExternalLink, Menu, X } from "lucide-react";
import { SidebarItem, SiteConfig } from "@/types";

interface SidebarProps {
  items: SidebarItem[];
  config: SiteConfig;
}

export function Sidebar({ items, config }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] lg:hidden"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-sidebar bg-[var(--color-surface-sidebar)] border-r border-[var(--color-border)] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:z-30`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)]">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg truncate"
          >
            {config.logo && (
              <img
                src={config.logo}
                alt={config.name}
                className="w-6 h-6 object-contain"
              />
            )}
            <span>{config.name}</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded lg:hidden"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
          {items.map((item) => (
            <SidebarSection
              key={item.slug || item.title}
              item={item}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarSection({
  item,
  onNavigate,
}: {
  item: SidebarItem;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(() => {
    if (!item.children) return false;
    return item.children.some(
      (child) => pathname === `/docs/${child.slug}`
    );
  });

  if (item.external && item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-[var(--color-surface)] transition-colors text-[var(--color-content-muted)]"
      >
        <span className="truncate">{item.title}</span>
        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
      </a>
    );
  }

  if (!item.children || item.children.length === 0) {
    const isActive = pathname === `/docs/${item.slug}`;
    return (
      <Link
        href={`/docs/${item.slug}`}
        onClick={onNavigate}
        className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
          isActive
            ? "bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)] font-medium"
            : "hover:bg-[var(--color-surface)] text-[var(--color-content-muted)]"
        }`}
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[var(--color-surface)] transition-colors"
      >
        <span>{item.title}</span>
        <ChevronRight
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>
      {expanded && (
        <div className="ml-2 mt-0.5 border-l border-[var(--color-border)] pl-2">
          {item.children.map((child) => (
            <SidebarSection
              key={child.slug || child.title}
              item={child}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
