"use client";

import { useCallback, useEffect, useState } from "react";
import { Sun, Moon, SunMoon } from "lucide-react";

type Mode = "light" | "dark" | "auto";

// Day / night / auto theme for the Voyages Mail app only (stored under
// 'mail-theme', independent of the public site's theme). Toggles a `dark` class
// on the .mail-app root; CSS in globals.css does the restyling.
export default function MailThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");

  const apply = useCallback((m: Mode) => {
    const root = document.querySelector(".mail-app");
    if (!root) return;
    const dark = m === "dark" || (m === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    let m: Mode = "light";
    try { m = (localStorage.getItem("mail-theme") as Mode) || "light"; } catch { /* ignore */ }
    setMode(m); apply(m);
  }, [apply]);

  useEffect(() => {
    if (mode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => apply("auto");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [mode, apply]);

  const cycle = () => {
    const next: Mode = mode === "light" ? "dark" : mode === "dark" ? "auto" : "light";
    setMode(next); apply(next);
    try { localStorage.setItem("mail-theme", next); } catch { /* ignore */ }
  };

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : SunMoon;
  return (
    <button onClick={cycle} title={`Theme: ${mode} (tap to change)`} aria-label="Change theme" className="text-gray-400 hover:text-white transition-colors">
      <Icon size={16} />
    </button>
  );
}
