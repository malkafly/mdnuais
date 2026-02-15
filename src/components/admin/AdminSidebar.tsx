"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, FolderOpen, Settings, LogOut, Menu, X, ExternalLink, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { t } from "@/lib/i18n";

const navItems = [
  { href: "/admin", label: "admin.sidebar.dashboard", icon: LayoutDashboard },
  { href: "/admin/docs", label: "admin.sidebar.articles", icon: FileText },
  { href: "/admin/categories", label: "admin.sidebar.categories", icon: FolderOpen },
  { href: "/admin/import", label: "admin.sidebar.import", icon: Upload },
  { href: "/admin/settings", label: "admin.sidebar.settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--color-surface-sidebar)] border border-[var(--color-border)] lg:hidden"
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
        className={`fixed top-0 left-0 z-50 h-screen w-sidebar bg-[var(--color-surface-sidebar)] border-r border-[var(--color-border)] flex flex-col transition-transform duration-200 lg:translate-x-0 lg:z-30 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)]">
          <div className="flex items-center">
            <Link href="/admin" className="font-semibold text-lg">
              mdnuais
            </Link>
            <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-500/15 text-blue-400 rounded font-medium">
              admin
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded lg:hidden"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-blue-500/15 text-blue-400 font-medium"
                    : "text-[var(--color-content-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-content)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-[var(--color-content-muted)]">{t("theme.toggle")}</span>
            <ThemeToggle />
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-content-muted)] hover:bg-[var(--color-surface)] transition-colors mb-1"
          >
            <ExternalLink className="w-4 h-4" />
            {t("admin.sidebar.viewSite")}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t("admin.sidebar.logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
