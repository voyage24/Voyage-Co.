"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Toggles between light and dark by adding/removing `.dark` on <html> and
// persisting the choice. The initial theme (stored choice, else system
// preference) is applied by the inline script in the root layout before paint,
// so there's no flash.
export default function ThemeToggle({ tone = "dark", size = 18 }: { tone?: "dark" | "light"; size?: number }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* ignore */ }
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`inline-flex items-center justify-center leading-none transition-all duration-200 hover:scale-110 active:scale-95 ${
        tone === "light" ? "text-white/90 hover:text-white" : "text-ink-muted hover:text-ink"
      }`}
    >
      {mounted && dark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}
