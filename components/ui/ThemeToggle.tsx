"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

// Three-way theme control: System → Light → Dark → (back to System).
// "System" follows the OS preference and updates live when it changes; Light and
// Dark are explicit manual choices. The initial theme is applied by the inline
// script in the root layout before paint, so there's no flash. All instances of
// this toggle stay in sync via a window event.

type Mode = "system" | "light" | "dark";
const ORDER: Mode[] = ["system", "light", "dark"];

function readMode(): Mode {
  try {
    const t = localStorage.getItem("theme");
    if (t === "light" || t === "dark" || t === "system") return t;
  } catch { /* ignore */ }
  return "system";
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyMode(mode: Mode): void {
  const dark = mode === "dark" || (mode === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

export default function ThemeToggle({ tone = "dark", size = 18 }: { tone?: "dark" | "light"; size?: number }) {
  const [mode, setMode] = useState<Mode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(readMode());
    setMounted(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => { if (readMode() === "system") applyMode("system"); };
    mq.addEventListener("change", onSystemChange);

    const onThemeEvent = (e: Event) => setMode((e as CustomEvent<Mode>).detail);
    window.addEventListener("vc-theme", onThemeEvent as EventListener);

    return () => {
      mq.removeEventListener("change", onSystemChange);
      window.removeEventListener("vc-theme", onThemeEvent as EventListener);
    };
  }, []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(next);
    try { localStorage.setItem("theme", next); } catch { /* ignore */ }
    applyMode(next);
    window.dispatchEvent(new CustomEvent("vc-theme", { detail: next }));
  };

  const label = mode === "system" ? "Theme: System" : mode === "dark" ? "Theme: Dark" : "Theme: Light";
  const Icon = mode === "system" ? Monitor : mode === "dark" ? Moon : Sun;

  return (
    <button
      onClick={cycle}
      aria-label={`${label} — tap to change`}
      title={label}
      className={`inline-flex items-center justify-center leading-none transition-all duration-200 hover:scale-110 active:scale-95 ${
        tone === "light" ? "text-white/90 hover:text-white" : "text-ink-muted hover:text-ink"
      }`}
    >
      {mounted ? <Icon size={size} /> : <Monitor size={size} />}
    </button>
  );
}
