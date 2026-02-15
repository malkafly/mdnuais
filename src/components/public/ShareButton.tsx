"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Link2, X as XIcon } from "lucide-react";
import { t } from "@/lib/i18n";

interface ShareButtonProps {
  title: string;
  url: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-[var(--color-surface-sidebar)] transition-colors"
        aria-label={t("share.title")}
        title={t("share.title")}
      >
        <Share2 className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 z-20">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--color-surface-sidebar)] transition-colors"
          >
            <Link2 className="w-4 h-4" />
            {copied ? t("common.copied") : t("share.copyLink")}
          </button>
          <button
            onClick={shareTwitter}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--color-surface-sidebar)] transition-colors"
          >
            <XIcon className="w-4 h-4" />
            {t("share.twitter")}
          </button>
          <button
            onClick={shareLinkedIn}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-[var(--color-surface-sidebar)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            {t("share.linkedin")}
          </button>
        </div>
      )}
    </div>
  );
}
