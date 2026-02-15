"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronRight,
  FileText,
  FolderOpen,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { SidebarItem, SidebarData } from "@/types";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

interface DocTreeProps {
  sidebar: SidebarData;
}

export function DocTree({ sidebar }: DocTreeProps) {
  const [items, setItems] = useState<SidebarItem[]>(sidebar.items);
  const router = useRouter();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.slug === active.id);
    const newIndex = items.findIndex((i) => i.slug === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    try {
      await fetch("/api/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newItems }),
      });
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDelete = async (slug: string, isSection: boolean) => {
    const message = isSection
      ? t("admin.docs.deleteSectionConfirm")
      : t("admin.docs.deleteConfirm");

    if (!confirm(message)) return;

    try {
      if (isSection) {
        const newItems = items.filter((i) => i.slug !== slug);
        setItems(newItems);
        await fetch("/api/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: newItems }),
        });
      } else {
        await fetch(`/api/docs/${slug}`, { method: "DELETE" });
      }
      toast.success(t("admin.docs.deleted"));
      router.refresh();
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.slug)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {items.map((item) => (
            <SortableItem
              key={item.slug}
              item={item}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  item,
  onDelete,
}: {
  item: SidebarItem;
  onDelete: (slug: string, isSection: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.slug,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-sidebar)] transition-colors">
        <button {...attributes} {...listeners} className="cursor-grab p-1 text-[var(--color-content-muted)]">
          <GripVertical className="w-4 h-4" />
        </button>

        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="p-0.5">
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : null}

        {item.external ? (
          <ExternalLink className="w-4 h-4 text-[var(--color-content-muted)]" />
        ) : hasChildren ? (
          <FolderOpen className="w-4 h-4 text-[var(--color-content-muted)]" />
        ) : (
          <FileText className="w-4 h-4 text-[var(--color-content-muted)]" />
        )}

        <span className="flex-1 text-sm truncate">{item.title}</span>

        {item.external && item.url && (
          <span className="text-xs text-[var(--color-content-muted)] truncate max-w-[200px]">
            {item.url}
          </span>
        )}

        <div className="flex items-center gap-1">
          {!item.external && !hasChildren && (
            <Link
              href={`/admin/docs/edit/${item.slug}`}
              className="p-1 rounded hover:bg-[var(--color-surface)] text-[var(--color-content-muted)] hover:text-[var(--color-primary)]"
              title={t("common.edit")}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Link>
          )}
          <button
            onClick={() => onDelete(item.slug, !!hasChildren)}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-[var(--color-content-muted)] hover:text-red-500"
            title={t("common.delete")}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children!.map((child) => (
            <div
              key={child.slug || child.title}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-sidebar)] transition-colors"
            >
              {child.external ? (
                <ExternalLink className="w-4 h-4 text-[var(--color-content-muted)]" />
              ) : (
                <FileText className="w-4 h-4 text-[var(--color-content-muted)]" />
              )}
              <span className="flex-1 text-sm truncate">{child.title}</span>

              {child.external && child.url && (
                <span className="text-xs text-[var(--color-content-muted)] truncate max-w-[200px]">
                  {child.url}
                </span>
              )}

              <div className="flex items-center gap-1">
                {!child.external && (
                  <Link
                    href={`/admin/docs/edit/${child.slug}`}
                    className="p-1 rounded hover:bg-[var(--color-surface)] text-[var(--color-content-muted)] hover:text-[var(--color-primary)]"
                    title={t("common.edit")}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => onDelete(child.slug, false)}
                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-[var(--color-content-muted)] hover:text-red-500"
                  title={t("common.delete")}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
