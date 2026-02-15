import { listAllArticles } from "@/lib/articles";
import { getCategories } from "@/lib/categories";
import { FileText, FolderOpen, Eye, EyeOff } from "lucide-react";
import { t } from "@/lib/i18n";

export default async function AdminDashboard() {
  const [articles, categoriesData] = await Promise.all([
    listAllArticles(),
    getCategories(),
  ]);

  const totalArticles = articles.length;
  const totalCategories = categoriesData.categories.length;
  const published = articles.filter((a) => a.status === "published").length;
  const drafts = articles.filter((a) => a.status === "draft").length;

  const cards = [
    {
      label: t("admin.dashboard.totalArticles"),
      value: totalArticles,
      icon: FileText,
      color: "blue",
    },
    {
      label: t("admin.dashboard.totalCategories"),
      value: totalCategories,
      icon: FolderOpen,
      color: "purple",
    },
    {
      label: t("admin.dashboard.published"),
      value: published,
      icon: Eye,
      color: "green",
    },
    {
      label: t("admin.dashboard.drafts"),
      value: drafts,
      icon: EyeOff,
      color: "amber",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500" },
    green: { bg: "bg-green-500/10", text: "text-green-500" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-500" },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("admin.dashboard.title")}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          return (
            <div
              key={card.label}
              className="p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-content-muted)]">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
