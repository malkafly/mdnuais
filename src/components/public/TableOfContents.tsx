"use client";

import { useEffect, useState } from "react";
import { Heading } from "@/types";
import { t } from "@/lib/i18n";

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 }
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block w-toc flex-shrink-0">
      <div className="sticky top-20">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-content-muted)] mb-3">
          {t("nav.onThisPage")}
        </p>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`toc-item block text-sm py-0.5 border-l-2 transition-colors ${
                  heading.level === 3 ? "pl-6" : "pl-3"
                } ${
                  activeId === heading.id
                    ? "active border-l-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-l-transparent text-[var(--color-content-muted)] hover:text-[var(--color-content)]"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
