"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-[18px] w-[18px]"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-[18px] w-[18px]"
    >
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle interactive inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-2.5 text-muted hover:border-border-strong hover:text-foreground sm:min-w-[5.5rem] sm:px-3"
      aria-label="Toggle color theme"
    >
      <span className="theme-toggle-icon theme-toggle-icon--light">
        <MoonIcon />
      </span>
      <span className="theme-toggle-icon theme-toggle-icon--dark">
        <SunIcon />
      </span>
      <span className="theme-toggle-label hidden text-xs font-medium sm:inline">
        <span className="theme-toggle-label--light">Dark</span>
        <span className="theme-toggle-label--dark">Light</span>
      </span>
    </button>
  );
}
