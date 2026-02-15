"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useCallback, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  CodeSquare,
  Link2,
  ImageIcon,
  Table as TableIcon,
  Minus,
  Undo,
  Redo,
  Eye,
  EyeOff,
} from "lucide-react";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

const lowlight = createLowlight(common);

interface DocEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export function DocEditor({ initialContent, onChange }: DocEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      TiptapImage.configure({
        inline: true,
        allowBase64: false,
      }),
      TiptapLink.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: "Comece a escrever...",
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: htmlFromMarkdown(initialContent),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none outline-none min-h-[400px] px-4 py-3",
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith("image/")) {
            event.preventDefault();
            const file = items[i].getAsFile();
            if (file) uploadAndInsertImage(file);
            return true;
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const file = files[0];
        if (file.type.startsWith("image/")) {
          event.preventDefault();
          uploadAndInsertImage(file);
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("admin.editor.imageTooLarge"));
        return;
      }

      const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t("admin.editor.invalidImageFormat"));
        return;
      }

      toast.loading(t("admin.editor.uploadingImage"), { id: "upload" });

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error();

        const { url } = await res.json();
        editor?.chain().focus().setImage({ src: url }).run();
        toast.dismiss("upload");
      } catch {
        toast.error(t("common.error"));
        toast.dismiss("upload");
      }
    },
    [editor]
  );

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/gif,image/webp";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) uploadAndInsertImage(file);
    };
    input.click();
  }, [uploadAndInsertImage]);

  const addLink = useCallback(() => {
    const url = prompt("URL:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-surface)]">
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-[var(--color-border)] bg-[var(--color-surface-sidebar)]">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title={t("admin.editor.bold")}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title={t("admin.editor.italic")}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title={t("admin.editor.strikethrough")}
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title={t("admin.editor.heading1")}
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title={t("admin.editor.heading2")}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title={t("admin.editor.heading3")}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title={t("admin.editor.bulletList")}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title={t("admin.editor.orderedList")}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title={t("admin.editor.blockquote")}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title={t("admin.editor.codeInline")}
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title={t("admin.editor.codeBlock")}
        >
          <CodeSquare className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <ToolbarButton onClick={addLink} title={t("admin.editor.link")}>
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleImageUpload} title={t("admin.editor.image")}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addTable} title={t("admin.editor.table")}>
          <TableIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title={t("admin.editor.horizontalRule")}
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title={t("admin.editor.undo")}
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title={t("admin.editor.redo")}
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton
          onClick={() => setShowPreview(!showPreview)}
          active={showPreview}
          title={t("admin.editor.preview")}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </ToolbarButton>
      </div>

      <div className={showPreview ? "grid grid-cols-2 divide-x divide-[var(--color-border)]" : ""}>
        <div className={showPreview ? "" : ""}>
          <EditorContent editor={editor} />
        </div>
        {showPreview && (
          <div
            className="prose max-w-none px-4 py-3 min-h-[400px] overflow-auto"
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-[var(--color-primary)] bg-opacity-10 text-[var(--color-primary)]"
          : "text-[var(--color-content-muted)] hover:text-[var(--color-content)] hover:bg-[var(--color-surface)]"
      }`}
    >
      {children}
    </button>
  );
}

function htmlFromMarkdown(markdown: string): string {
  return markdown
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^---$/gm, "<hr>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|p|u|o|b|i|h|a|s])(.+)$/gm, "<p>$1</p>");
}
