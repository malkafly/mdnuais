"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { t } from "@/lib/i18n";

const navItems = [
  { href: "/admin", label: "admin.sidebar.dashboard", icon: LayoutDashboard },
  { href: "/admin/docs", label: "admin.sidebar.documents", icon: FileText },
  { href: "/admin/settings", label: "admin.sidebar.settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="fixed top-0 left-0 z-30 h-screen w-sidebar bg-[var(--color-surface-sidebar)] border-r border-[var(--color-border)] flex flex-col">
      <div className="flex items-center px-4 h-14 border-b border-[var(--color-border)]">
        <Link href="/admin" className="font-semibold text-lg">
          mdnuais
        </Link>
        <span className="ml-2 text-xs px-1.5 py-0.5 bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)] rounded">
          admin
        </span>
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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)] font-medium"
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
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-content-muted)] hover:bg-[var(--color-surface)] transition-colors mb-1"
        >
          <FileText className="w-4 h-4" />
          Ver site
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t("admin.sidebar.logout")}
        </button>
      </div>
    </aside>
  );
}
