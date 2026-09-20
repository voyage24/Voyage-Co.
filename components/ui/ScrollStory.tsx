"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";

export type ScrollStoryLayer = {
  /** [start, end] within the story's 0→1 scroll progress where this layer is the active one. */
  range: [number, number];
  /** Receives 0→1 progress through this layer's own range, for internal staging (a list revealing item-by-item, a line drawing itself in). */
  render: (progress: number) => ReactNode;
};

function layerStyle(overall: number, [start, end]: [number, number], margin = 0.06): CSSProperties {
  const entry = Math.max(0, start - margin);
  const exit = Math.min(1, end + margin);
  let opacity: number;
  if (overall >= start && overall <= end) {
    // Settled — checked first so a layer whose start/end sits exactly at
    // the story's 0 or 1 boundary (where the margin clamp collapses entry/
    // exit onto that same boundary) is never mistaken for "before entry".
    opacity = 1;
  } else if (overall < start) {
    opacity = entry >= start ? 1 : Math.max(0, (overall - entry) / (start - entry));
  } else {
    opacity = exit <= end ? 1 : Math.max(0, 1 - (overall - end) / (exit - end));
  }
  return { opacity, transform: `translateY(${(1 - opacity) * 24}px)`, pointerEvents: opacity > 0.5 ? "auto" : "none" };
}

// Pins a full-height stage while a tall track scrolls behind it, crossfading
// through `layers` in sequence as scroll progress moves through each one's
// range — the "content builds up layer by layer as you scroll" effect. Each
// layer also gets its own 0→1 progress through its range for internal
// staging. `background` stays mounted behind every layer (e.g. the hero
// image) so layers read as overlays on one continuous scene.
// Falls back to a plain stacked, fully-visible layout under
// prefers-reduced-motion (via useScrollProgress) — content is never gated
// behind motion.
export default function ScrollStory({
  layers,
  background,
  vhPerLayer = 60,
  stageHeight = "82vh",
  className = "",
}: {
  layers: ScrollStoryLayer[];
  background?: ReactNode;
  vhPerLayer?: number;
  stageHeight?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { progress, reduced } = useScrollProgress(trackRef);

  if (reduced) {
    return (
      <div className={`relative rounded-2xl overflow-hidden ${className}`}>
        {background}
        {layers.map((l, i) => (
          <div key={i} className="relative">{l.render(1)}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={trackRef} style={{ height: `${vhPerLayer * (layers.length + 1)}vh` }} className={`relative ${className}`}>
      <div className="sticky top-[9vh] rounded-2xl overflow-hidden" style={{ height: stageHeight }}>
        {background}
        {layers.map((l, i) => {
          const local = Math.min(1, Math.max(0, (progress - l.range[0]) / (l.range[1] - l.range[0] || 1)));
          return (
            <div key={i} className="absolute inset-0" style={layerStyle(progress, l.range)}>
              {l.render(local)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
