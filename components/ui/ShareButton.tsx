"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Native OS share sheet on mobile (falls back to copy-link on desktop).
export default function ShareButton({
  title, text, path, label = false,
}: {
  title: string; text?: string; path: string; label?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? new URL(path, window.location.origin).toString() : path;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text: text || title, url });
        haptic("success");
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      haptic("select");
      setTimeout(() => setCopied(false), 2000);
    } catch { /* user dismissed the share sheet */ }
  };

  return (
    <button
      onClick={share}
      aria-label="Share"
      className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors"
    >
      {copied ? <Check size={16} className="text-gold" /> : <Share2 size={16} />}
      {label && <span>{copied ? "Copied" : "Share"}</span>}
    </button>
  );
}
