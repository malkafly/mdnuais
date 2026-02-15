"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { t } from "@/lib/i18n";

interface CodeBlockProps {
  code: string;
  language?: string;
  html?: string;
}

export function CodeBlock({ code, language, html }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {language && (
        <div className="absolute top-0 left-4 px-2 py-0.5 text-xs text-[var(--color-content-muted)] bg-[var(--color-surface-sidebar)] border border-[var(--color-border)] border-t-0 rounded-b-md">
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-surface-sidebar)]"
        title={t("code.copy")}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
      {html ? (
        <pre className="!mt-0">
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      ) : (
        <pre className="!mt-0">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
