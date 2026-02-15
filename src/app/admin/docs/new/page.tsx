"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Category } from "@/types";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { slugify } from "@/lib/markdown";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("draft");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSlug(slugify(title));
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) return;
    setLoading(true);

    try {
      const content = `# ${title}\n\n`;
      const meta = {
        title,
        slug,
        category: category || null,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: 0,
      };

      const res = await fetch(`/api/articles/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, meta }),
      });

      if (!res.ok) throw new Error();

      toast.success(t("admin.docs.created"));
      router.push(`/admin/docs/edit/${slug}`);
      router.refresh();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/docs"
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">{t("admin.docs.newArticle")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            {t("admin.docs.docTitle")}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("admin.docs.docTitlePlaceholder")}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            autoFocus
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            {t("admin.docs.docSlug")}
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={t("admin.docs.docSlugPlaceholder")}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            {t("admin.docs.category")}
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="">{t("admin.docs.noCategory")}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            {t("admin.docs.status")}
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "published" | "draft")}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="draft">{t("admin.docs.statusDraft")}</option>
            <option value="published">{t("admin.docs.statusPublished")}</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("common.create")}
          </button>
          <Link
            href="/admin/docs"
            className="px-4 py-2 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
          >
            {t("common.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
