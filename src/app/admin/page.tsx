import { getSidebar } from "@/lib/config";
import { FileText, FolderOpen } from "lucide-react";
import { SidebarItem } from "@/types";
import { t } from "@/lib/i18n";

function countDocs(items: SidebarItem[]): number {
  let count = 0;
  for (const item of items) {
    if (item.external) continue;
    if (item.children && item.children.length > 0) {
      count += countDocs(item.children);
    } else {
      count++;
    }
  }
  return count;
}

function countSections(items: SidebarItem[]): number {
  let count = 0;
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      count++;
      count += countSections(item.children);
    }
  }
  return count;
}

export default async function AdminDashboard() {
  const sidebar = await getSidebar();
  const totalDocs = countDocs(sidebar.items);
  const totalSections = countSections(sidebar.items);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("admin.dashboard.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-content-muted)]">
                {t("admin.dashboard.totalDocs")}
              </p>
              <p className="text-2xl font-bold">{totalDocs}</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-content-muted)]">
                {t("admin.dashboard.totalSections")}
              </p>
              <p className="text-2xl font-bold">{totalSections}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
