import Link from "next/link";
import { Plus, Link2 } from "lucide-react";
import { getSidebar } from "@/lib/config";
import { DocTree } from "@/components/admin/DocTree";
import { t } from "@/lib/i18n";

export default async function AdminDocsPage() {
  const sidebar = await getSidebar();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("admin.docs.title")}</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/docs/new?type=external"
            className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
          >
            <Link2 className="w-4 h-4" />
            {t("admin.docs.externalLink")}
          </Link>
          <Link
            href="/admin/docs/new?type=section"
            className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("admin.docs.newSection")}
          </Link>
          <Link
            href="/admin/docs/new"
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t("admin.docs.newDoc")}
          </Link>
        </div>
      </div>

      <DocTree sidebar={sidebar} />
    </div>
  );
}
