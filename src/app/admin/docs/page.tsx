"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Trash2, Eye, EyeOff } from "lucide-react";
import { ArticleMeta, Category } from "@/types";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

export default function AdminDocsPage() {
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/articles").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([arts, cats]) => {
        setArticles(arts);
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(t("admin.docs.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setArticles((prev) => prev.filter((a) => a.slug !== slug));
      toast.success(t("admin.docs.deleted"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const getCategoryName = (catId: string | null) => {
    if (!catId) return t("admin.docs.noCategory");
    const cat = categories.find((c) => c.id === catId);
    return cat?.title || catId;
  };

  const filtered = articles.filter((a) => {
    if (filterCategory && a.category !== filterCategory) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--color-content-muted)]">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("admin.docs.title")}</h1>
        <Link
          href="/admin/docs/new"
          className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {t("admin.docs.newArticle")}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value="">{t("admin.docs.allCategories")}</option>
          <option value="__none__">{t("admin.docs.noCategory")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <option value="">{t("admin.docs.allStatuses")}</option>
          <option value="published">{t("admin.docs.statusPublished")}</option>
          <option value="draft">{t("admin.docs.statusDraft")}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-content-muted)]">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>{t("admin.docs.empty")}</p>
        </div>
      ) : (
        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-sidebar)] border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-3 font-medium">{t("admin.docs.docTitle")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("admin.docs.category")}</th>
                <th className="text-left px-4 py-3 font-medium">{t("admin.docs.status")}</th>
                <th className="text-right px-4 py-3 font-medium">{t("admin.docs.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article) => (
                <tr
                  key={article.slug}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-sidebar)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/docs/edit/${article.slug}`}
                      className="font-medium hover:text-[var(--color-primary)] transition-colors"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-[var(--color-content-muted)]">/{article.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-content-muted)]">
                    {getCategoryName(article.category)}
                  </td>
                  <td className="px-4 py-3">
                    {article.status === "published" ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
                        <Eye className="w-3 h-3" />
                        {t("admin.docs.statusPublished")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-500/10 text-gray-500 rounded-full">
                        <EyeOff className="w-3 h-3" />
                        {t("admin.docs.statusDraft")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/docs/edit/${article.slug}`}
                        className="px-2 py-1 text-xs border border-[var(--color-border)] rounded hover:bg-[var(--color-surface-sidebar)] transition-colors"
                      >
                        {t("common.edit")}
                      </Link>
                      <button
                        onClick={() => handleDelete(article.slug)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
