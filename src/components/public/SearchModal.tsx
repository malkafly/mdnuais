"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText } from "lucide-react";
import Fuse from "fuse.js";
import { SearchEntry, SearchResult } from "@/types";
import { t } from "@/lib/i18n";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [index, setIndex] = useState<Fuse<SearchEntry> | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && !index) {
      fetch("/api/search-index")
        .then((res) => res.json())
        .then((data: SearchEntry[]) => {
          const fuse = new Fuse(data, {
            keys: [
              { name: "title", weight: 3 },
              { name: "headings", weight: 2 },
              { name: "content", weight: 1 },
            ],
            threshold: 0.3,
            includeMatches: true,
            minMatchCharLength: 2,
          });
          setIndex(fuse);
        })
        .catch(() => {});
    }
  }, [open, index]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  const search = useCallback(
    (q: string) => {
      if (!index || q.length < 2) {
        setResults([]);
        return;
      }
      const fuseResults = index.search(q, { limit: 10 });
      setResults(
        fuseResults.map((r) => ({
          title: r.item.title,
          slug: r.item.slug,
          snippet: r.item.content.substring(0, 150),
          breadcrumb: r.item.breadcrumb,
          matches: r.matches,
        }))
      );
      setSelectedIndex(0);
    },
    [index]
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  const navigate = (slug: string) => {
    router.push(`/docs/${slug}`);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].slug);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-content-muted)] bg-[var(--color-surface-sidebar)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-content-muted)] transition-colors w-full max-w-[240px]"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">{t("search.placeholder")}</span>
        <kbd className="hidden sm:inline-flex text-xs px-1.5 py-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded">
          {t("common.searchShortcut")}
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
          <Search className="w-5 h-5 text-[var(--color-content-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("search.placeholder")}
            className="flex-1 py-3 bg-transparent outline-none text-base"
          />
          <button onClick={() => setOpen(false)} className="p-1">
            <X className="w-4 h-4 text-[var(--color-content-muted)]" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-content-muted)]">
              {t("search.noResults")} &quot;{query}&quot;
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={result.slug}
              onClick={() => navigate(result.slug)}
              className={`flex items-start gap-3 w-full px-4 py-3 text-left transition-colors ${
                i === selectedIndex
                  ? "bg-[var(--color-primary)] bg-opacity-10"
                  : "hover:bg-[var(--color-surface-sidebar)]"
              }`}
            >
              <FileText className="w-4 h-4 mt-0.5 text-[var(--color-content-muted)] flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{result.title}</div>
                <div className="text-xs text-[var(--color-content-muted)] truncate">
                  {result.breadcrumb}
                </div>
                <div className="text-xs text-[var(--color-content-muted)] line-clamp-1 mt-0.5">
                  {result.snippet}
                </div>
              </div>
            </button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--color-border)] text-xs text-[var(--color-content-muted)]">
            <span>↑↓ navegar</span>
            <span>↵ abrir</span>
            <span>esc fechar</span>
          </div>
        )}
      </div>
    </div>
  );
}
