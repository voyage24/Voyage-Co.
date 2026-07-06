"use client";

import { useState } from "react";
import { Languages, Volume2 } from "lucide-react";
import { getPhrasebook } from "@/lib/phrasebook";
import { haptic } from "@/lib/haptics";

// Essential phrases for the destination language — bundled, so it works offline.
// Renders nothing for destinations we don't have a phrasebook for.
export default function Phrasebook({ country }: { country: string }) {
  const [open, setOpen] = useState(false);
  const data = getPhrasebook(country);
  if (!data) return null;

  const speak = (text: string) => {
    haptic("select");
    try {
      const clean = text.replace(/\(.*?\)/g, "").trim();
      const u = new SpeechSynthesisUtterance(clean);
      window.speechSynthesis?.speak(u);
    } catch { /* no TTS */ }
  };

  return (
    <div className="border border-line rounded-2xl bg-panel-soft overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-3 p-5 text-left">
        <span className="flex items-center gap-2">
          <Languages size={16} className="text-gold" />
          <span className="font-serif text-lg font-light text-ink">{data.language} phrases</span>
        </span>
        <span className="text-xs text-ink-faint">{open ? "Hide" : "Open"}</span>
      </button>
      {open && (
        <ul className="px-5 pb-5 divide-y divide-line/70">
          {data.phrases.map(p => (
            <li key={p.en} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm text-ink">{p.local}</p>
                <p className="text-xs text-ink-faint">{p.en}</p>
              </div>
              <button onClick={() => speak(p.local)} aria-label={`Speak ${p.en}`} className="text-ink-faint hover:text-gold transition-colors shrink-0"><Volume2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
