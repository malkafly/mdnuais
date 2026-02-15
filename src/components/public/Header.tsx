"use client";

import { SearchModal } from "./SearchModal";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)] lg:pl-[calc(260px+1rem)]">
      <div className="flex-1 flex items-center justify-center lg:justify-start pl-10 lg:pl-0">
        <SearchModal />
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
