"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Save, GripVertical, ChevronRight } from "lucide-react";
import { Category } from "@/types";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { slugify } from "@/lib/markdown";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Build a hierarchical list: parent, then its children, then next parent, etc.
  const orderedCategories = useMemo(() => {
    const topLevel = categories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.order - b.order);
    const result: Category[] = [];
    for (const parent of topLevel) {
      result.push(parent);
      const children = categories
        .filter((c) => c.parentId === parent.id)
        .sort((a, b) => a.order - b.order);
      result.push(...children);
    }
    return result;
  }, [categories]);

  const topLevelCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  const saveCategories = async (cats: Category[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: cats }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("admin.categories.saved"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => saveCategories(categories);

  const addCategory = (parentId?: string) => {
    const id = crypto.randomUUID();
    const newCat: Category = {
      id,
      title: "",
      description: "",
      slug: "",
      icon: "",
      iconBgColor: "#EEF2FF",
      order: parentId
        ? categories.filter((c) => c.parentId === parentId).length
        : topLevelCategories.length,
      parentId: parentId || null,
    };
    setCategories((prev) => [...prev, newCat]);
    setEditingId(id);
  };

  const removeCategory = (id: string) => {
    if (!confirm(t("admin.categories.deleteConfirm"))) return;
    // Also remove subcategories if deleting a parent
    const updated = categories.filter(
      (c) => c.id !== id && c.parentId !== id
    );
    setCategories(updated);
    if (editingId === id) setEditingId(null);
    saveCategories(updated);
  };

  const [manualSlugs, setManualSlugs] = useState<Set<string>>(new Set());

  const updateCategory = (id: string, field: keyof Category, value: string | number | null) => {
    if (field === "slug") {
      setManualSlugs((prev) => new Set(prev).add(id));
    }
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        if (field === "title" && !manualSlugs.has(id)) {
          updated.slug = slugify(value as string);
        }
        return updated;
      })
    );
  };

  const moveCategory = (cat: Category, direction: "up" | "down") => {
    // Move within same level (same parentId)
    const siblings = categories
      .filter((c) => (c.parentId || null) === (cat.parentId || null))
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((c) => c.id === cat.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    const newCats = [...categories];
    const catInList = newCats.find((c) => c.id === siblings[idx].id)!;
    const swapInList = newCats.find((c) => c.id === siblings[swapIdx].id)!;
    const tmpOrder = catInList.order;
    catInList.order = swapInList.order;
    swapInList.order = tmpOrder;
    setCategories(newCats);
  };

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
        <h1 className="text-2xl font-bold">{t("admin.categories.title")}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addCategory()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("admin.categories.add")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-content-muted)]">
          <p>{t("admin.categories.empty")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orderedCategories.map((cat) => {
            const isSubcategory = !!cat.parentId;
            const parentCat = isSubcategory
              ? categories.find((c) => c.id === cat.parentId)
              : null;

            return (
              <div
                key={cat.id}
                className={`border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] overflow-hidden ${
                  isSubcategory ? "ml-8" : ""
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveCategory(cat, "up")}
                      className="p-0.5 text-[var(--color-content-muted)] hover:text-[var(--color-content)] disabled:opacity-30"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {isSubcategory && (
                    <ChevronRight className="w-4 h-4 text-[var(--color-content-muted)] shrink-0" />
                  )}

                  {cat.icon && (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 [&_svg]:w-5 [&_svg]:h-5"
                      style={{ backgroundColor: cat.iconBgColor || "#EEF2FF", color: "#000" }}
                      dangerouslySetInnerHTML={{ __html: cat.icon }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {cat.title || t("admin.categories.untitled")}
                    </p>
                    <p className="text-xs text-[var(--color-content-muted)] truncate">
                      /{cat.slug || "..."}
                      {isSubcategory && parentCat && (
                        <span className="ml-2 text-[var(--color-content-muted)]">
                          ({parentCat.title})
                        </span>
                      )}
                    </p>
                  </div>

                  {!isSubcategory && (
                    <button
                      onClick={() => addCategory(cat.id)}
                      className="px-2 py-1.5 text-xs border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
                      title={t("admin.categories.addSubcategory")}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => setEditingId(editingId === cat.id ? null : cat.id)}
                    className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    onClick={() => removeCategory(cat.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {editingId === cat.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border)] space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("admin.categories.catTitle")}
                        </label>
                        <input
                          type="text"
                          value={cat.title}
                          onChange={(e) => updateCategory(cat.id, "title", e.target.value)}
                          placeholder={t("admin.categories.catTitlePlaceholder")}
                          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("admin.categories.catSlug")}
                        </label>
                        <input
                          type="text"
                          value={cat.slug}
                          onChange={(e) => updateCategory(cat.id, "slug", e.target.value)}
                          placeholder={t("admin.categories.catSlugPlaceholder")}
                          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>
                    </div>

                    {/* Parent category selector */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("admin.categories.parentCategory")}
                      </label>
                      <select
                        value={cat.parentId || ""}
                        onChange={(e) =>
                          updateCategory(cat.id, "parentId", e.target.value || null)
                        }
                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      >
                        <option value="">{t("admin.categories.noParent")}</option>
                        {topLevelCategories
                          .filter((c) => c.id !== cat.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title || c.slug}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("admin.categories.catDescription")}
                      </label>
                      <textarea
                        value={cat.description}
                        onChange={(e) => updateCategory(cat.id, "description", e.target.value)}
                        placeholder={t("admin.categories.catDescriptionPlaceholder")}
                        rows={2}
                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("admin.categories.catIcon")}
                        </label>
                        <textarea
                          value={cat.icon}
                          onChange={(e) => updateCategory(cat.id, "icon", e.target.value)}
                          placeholder={'<svg>...</svg>'}
                          rows={3}
                          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t("admin.categories.catIconBgColor")}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={cat.iconBgColor}
                            onChange={(e) => updateCategory(cat.id, "iconBgColor", e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={cat.iconBgColor}
                            onChange={(e) => updateCategory(cat.id, "iconBgColor", e.target.value)}
                            className="flex-1 px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
