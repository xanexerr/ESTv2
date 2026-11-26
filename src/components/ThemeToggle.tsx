"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("est_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("est_theme", "light");
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      title={dark ? "โหมดสว่าง" : "โหมดมืด"}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-paper-bg hover:bg-paper-muted text-ink-secondary hover:text-ink-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
        compact ? "w-9 h-9" : "min-h-[40px] px-3 py-1.5 text-xs font-medium w-full"
      }`}
    >
      {dark ? (
        <Sun className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
      )}
      {!compact && <span>{dark ? "โหมดสว่าง" : "โหมดมืด"}</span>}
    </button>
  );
}
