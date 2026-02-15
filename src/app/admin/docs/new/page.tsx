"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SidebarData, SidebarItem } from "@/types";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { slugify } from "@/lib/markdown";

export default function NewDocPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [section, setSection] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [sidebar, setSidebar] = useState<SidebarData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/docs")
      .then((res) => res.json())
      .then((data) => setSidebar(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (type !== "external") {
      setSlug(slugify(title));
    }
  }, [title, type]);

  const sections = sidebar
    ? sidebar.items.filter((item: SidebarItem) => item.children && !item.external)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);

    try {
      if (type === "section") {
        const newSection: SidebarItem = {
          title,
          slug: slugify(title),
          children: [],
        };
        const newItems = [...(sidebar?.items || []), newSection];
        await fetch("/api/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: newItems }),
        });
        toast.success(t("admin.docs.created"));
        router.push("/admin/docs");
        router.refresh();
        return;
      }

      if (type === "external") {
        const newLink: SidebarItem = {
          title,
          slug: slugify(title),
          url: externalUrl,
          external: true,
        };
        const newItems = [...(sidebar?.items || []), newLink];
        await fetch("/api/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: newItems }),
        });
        toast.success(t("admin.docs.created"));
        router.push("/admin/docs");
        router.refresh();
        return;
      }

      const docSlug = section ? `${section}/${slug}` : slug;

      await fetch(`/api/docs/${docSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `# ${title}\n\n`,
          title,
        }),
      });

      if (sidebar) {
        const newItems = [...sidebar.items];
        const newDocItem: SidebarItem = { title, slug: docSlug };

        if (section) {
          const sectionItem = newItems.find((i) => i.slug === section);
          if (sectionItem && sectionItem.children) {
            sectionItem.children.push(newDocItem);
          }
        } else {
          newItems.push(newDocItem);
        }

        await fetch("/api/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: newItems }),
        });
      }

      toast.success(t("admin.docs.created"));
      router.push(`/admin/docs/edit/${docSlug}`);
      router.refresh();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const pageTitle =
    type === "section"
      ? t("admin.docs.newSection")
      : type === "external"
        ? t("admin.docs.externalLink")
        : t("admin.docs.newDoc");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/docs"
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            {type === "section" ? t("admin.docs.newSectionTitle") : t("admin.docs.docTitle")}
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === "section"
                ? t("admin.docs.newSectionTitlePlaceholder")
                : t("admin.docs.docTitlePlaceholder")
            }
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            autoFocus
            required
          />
        </div>

        {type === "external" && (
          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-1">
              {t("admin.docs.externalUrl")}
            </label>
            <input
              id="url"
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder={t("admin.docs.externalUrlPlaceholder")}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>
        )}

        {type !== "section" && type !== "external" && (
          <>
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
              <label htmlFor="section" className="block text-sm font-medium mb-1">
                {t("admin.docs.docSection")}
              </label>
              <select
                id="section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">{t("admin.docs.docSectionPlaceholder")}</option>
                {sections.map((s: SidebarItem) => (
                  <option key={s.slug} value={s.slug}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

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
