"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { DocEditor } from "@/components/admin/DocEditor";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

export default function EditDocPage() {
  const params = useParams();
  const slug = (params.slug as string[]).join("/");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetch(`/api/docs/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setContent(data.content);
        const titleMatch = data.content.match(/^#\s+(.+)$/m);
        if (titleMatch) setTitle(titleMatch[1]);
        setLoading(false);
      })
      .catch(() => {
        toast.error(t("common.error"));
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleContentChange = useCallback((html: string) => {
    setHtmlContent(html);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);

    try {
      await fetch(`/api/docs/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: htmlContent || content, title }),
      });
      setHasChanges(false);
      toast.success(t("admin.docs.saved"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  }, [slug, htmlContent, content, title]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

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
        <div className="flex items-center gap-3">
          <Link
            href="/admin/docs"
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{t("admin.docs.editDoc")}</h1>
          {hasChanges && (
            <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 rounded-full">
              {t("common.unsavedChanges").split(".")[0]}
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? t("common.loading") : t("common.save")}
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="doc-title" className="block text-sm font-medium mb-1">
          {t("admin.docs.docTitle")}
        </label>
        <input
          id="doc-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasChanges(true);
          }}
          placeholder={t("admin.docs.docTitlePlaceholder")}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      <DocEditor initialContent={content} onChange={handleContentChange} />
    </div>
  );
}
