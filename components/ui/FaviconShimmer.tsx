"use client";

import { useEffect } from "react";

// Animates the browser-tab favicon with a soft gold shimmer sweeping across a
// "V" monogram. Redraws a small canvas ~11fps and pauses when the tab is hidden,
// so it stays light. Restores the original icon on unmount.
export default function FaviconShimmer() {
  useEffect(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const created = !link;
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    const prevHref = link.href;

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const draw = (phase: number) => {
      ctx.clearRect(0, 0, size, size);
      // Brand square + gold monogram.
      roundRect(2, 2, size - 4, size - 4, 13);
      ctx.fillStyle = "#1c0a0d"; ctx.fill();
      ctx.fillStyle = "#c1a14a";
      ctx.font = "bold 42px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("V", size / 2, size / 2 + 4);
      // Shimmer sweep, clipped to the drawn pixels.
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      const x = -size + phase * size * 2;
      const g = ctx.createLinearGradient(x, 0, x + size * 0.55, size * 0.55);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.5, "rgba(255,247,220,0.9)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
      ctx.restore();
      link!.href = canvas.toDataURL("image/png");
    };

    let raf = 0; let last = 0;
    const period = 3200; // one shimmer sweep every 3.2s
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (t - last < 90) return; // ~11 fps
      last = t;
      draw((t % period) / period);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      if (created) link?.remove();
      else if (link) link.href = prevHref;
    };
  }, []);

  return null;
}
