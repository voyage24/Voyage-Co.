"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Logo from "@/components/ui/Logo";

const STORAGE_KEY = "vc-intro-shown";
const TEXT_IN_MS = 250;   // wordmark starts fading in
const HOLD_MS = 1300;     // stays fully visible
const TEXT_OUT_MS = 300;  // fades out just ahead of the wipe
const WIPE_MS = 1100;     // iris-wipe duration

type Phase = "idle" | "text" | "textOut" | "wipe" | "done";

function shouldSkip(): boolean {
  if (typeof window === "undefined") return false; // SSR: render the blank "idle" state
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduced || !!sessionStorage.getItem(STORAGE_KEY);
}

// A one-time cinematic open for first-time visitors: a blank beat, the
// wordmark + tagline, then an iris wipe (a circular hole opening from where
// the hero headline sits) revealing the homepage underneath. Renders in the
// initial SSR markup — already fully covering the page at first paint, no
// flash of homepage-then-overlay — and unmounts once the wipe completes.
// Session-scoped (sessionStorage) so it doesn't replay on every navigation
// back to "/", and skipped entirely for prefers-reduced-motion.
export default function IntroOverlay() {
  const { t } = useLanguage();
  // Computed once via the lazy initializer — a pure read, so it's safe if
  // React Strict Mode invokes it twice in dev. Deciding here (not inside the
  // effect below) keeps the sessionStorage *write* separate from the read:
  // if both lived in the effect, Strict Mode's mount→cleanup→mount replay
  // would have the first (discarded) pass set the flag and the second
  // (real) pass immediately see it as "already shown" and skip.
  const [skip] = useState(shouldSkip);
  const [phase, setPhase] = useState<Phase>(skip ? "done" : "idle");

  useEffect(() => {
    if (skip) return;
    sessionStorage.setItem(STORAGE_KEY, "1");
    const timers = [
      setTimeout(() => setPhase("text"), TEXT_IN_MS),
      setTimeout(() => setPhase("textOut"), TEXT_IN_MS + HOLD_MS),
      setTimeout(() => setPhase("wipe"), TEXT_IN_MS + HOLD_MS + TEXT_OUT_MS),
      setTimeout(() => setPhase("done"), TEXT_IN_MS + HOLD_MS + TEXT_OUT_MS + WIPE_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [skip]);

  if (phase === "done") return null;

  return (
    <>
      <noscript>
        <style>{".vc-intro-overlay{display:none!important}"}</style>
      </noscript>
      <div
        className="vc-intro-overlay fixed inset-0 z-[300] bg-vc-950 flex items-center justify-center"
        style={{
          clipPath: phase === "wipe" ? "circle(0% at 50% 46%)" : "circle(150% at 50% 46%)",
          transition: phase === "wipe" ? `clip-path ${WIPE_MS}ms cubic-bezier(.76,0,.24,1)` : undefined,
        }}
        aria-hidden="true"
      >
        <div className="text-center transition-opacity duration-500" style={{ opacity: phase === "text" ? 1 : 0 }}>
          <Logo href={null} tone="light" size={34} shimmer />
          <p className="mt-3 text-[11px] sm:text-[13px] tracking-[0.32em] uppercase text-white/70 font-medium">
            {t("hero.eyebrow")}
          </p>
        </div>
      </div>
    </>
  );
}
