"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Logo from "@/components/ui/Logo";
import IntroMap from "@/components/home/IntroMap";
import { useIsMobile } from "@/lib/useIsMobile";

const STORAGE_KEY = "vc-intro-shown";
const TEXT_IN_MS = 250;    // wordmark starts fading in
const MAP_ZOOM_MS = 1700;  // how long the backdrop map takes to pull back
const HOLD_MS = 1900;      // stays fully visible — long enough for the map's pull-back to settle
const TEXT_OUT_MS = 300;   // fades out just ahead of the wipe
const WIPE_MS = 1100;      // iris-wipe duration

type Phase = "idle" | "text" | "textOut" | "wipe" | "done";

function shouldSkip(): boolean {
  if (typeof window === "undefined") return false; // SSR: render the blank "idle" state
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduced || !!sessionStorage.getItem(STORAGE_KEY);
}

// A one-time cinematic open for first-time visitors: a blank beat, then a
// world map opening tight and pulling back behind the "Voyages & Co."
// wordmark + tagline, then an iris wipe (a circular hole opening from where
// the wordmark sits) revealing the homepage underneath. Renders in the
// initial SSR markup — already fully covering the page at first paint, no
// flash of homepage-then-overlay — and unmounts once the wipe completes.
// Session-scoped (sessionStorage) so it doesn't replay on every navigation
// back to "/", and skipped entirely for prefers-reduced-motion.
export default function IntroOverlay() {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
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

  // A growing hole (not a shrinking mask): --vc-iris-r is the hole's radius,
  // 0% (closed — nothing revealed yet) up to 150% (open — comfortably past
  // every corner regardless of aspect ratio). Anchored where the wordmark
  // sits, so that area opens first and the page corners open last. Once it
  // opens, what's still masked keeps showing the backdrop map (now settled
  // at the same center/zoom the real hero map rests at), while the hole
  // reveals the real homepage underneath — a continuous handoff, not a cut.
  const maskImage = "radial-gradient(circle at 50% 46%, transparent var(--vc-iris-r), black var(--vc-iris-r))";
  const showMap = phase !== "idle";

  return (
    <>
      <noscript>
        <style>{".vc-intro-overlay{display:none!important}"}</style>
      </noscript>
      <div
        className="vc-intro-overlay fixed inset-0 z-[300] bg-vc-950 flex items-center justify-center overflow-hidden"
        style={{
          WebkitMaskImage: maskImage,
          maskImage,
          ["--vc-iris-r" as string]: phase === "wipe" ? "150%" : "0%",
          transition: phase === "wipe" ? `--vc-iris-r ${WIPE_MS}ms cubic-bezier(.76,0,.24,1)` : undefined,
        } as React.CSSProperties}
        aria-hidden="true"
      >
        {showMap && (
          <>
            <IntroMap zoomOutMs={MAP_ZOOM_MS} />
            {/* Vignette so the wordmark stays legible over the map regardless
                of which part of the world is showing. */}
            <div className="absolute inset-0 bg-gradient-to-t from-vc-950/80 via-vc-950/50 to-vc-950/60" />
          </>
        )}
        <div className="relative text-center transition-opacity duration-500" style={{ opacity: phase === "text" ? 1 : 0 }}>
          <Logo href={null} tone="light" size={isMobile ? 46 : 68} shimmer />
          <p className="mt-4 text-sm sm:text-lg tracking-[0.32em] uppercase text-white/70 font-medium">
            {t("hero.eyebrow")}
          </p>
        </div>
      </div>
    </>
  );
}
