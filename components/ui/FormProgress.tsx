"use client";

import { Check } from "lucide-react";

// `label` is optional: some flows (the plan wizard) ask full questions that are
// far too long to sit under a dot, and short labels for them don't exist in the
// dictionaries — those show as unlabelled markers with a "Step 3 of 6" note.
export type ProgressStep = { label?: string; done: boolean };

// A quiet progress header for longer forms: how far along you are, and what's
// left. Same mechanic as the gamified onboarding patterns — a bar, a percentage
// and a stepper — but rendered in the house style: gold on cream, serif figures,
// no emoji, no streaks. The reassurance without the confetti.
export default function FormProgress({ steps, title = "Your progress", note }: {
  steps: ProgressStep[];
  title?: string;
  note?: string;
}) {
  if (steps.length === 0) return null;
  const doneCount = steps.filter(s => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);
  // The first unfinished step is the one being worked on.
  const currentIndex = steps.findIndex(s => !s.done);

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5 mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-[0.24em] uppercase text-gold">{title}</p>
        <p className="font-serif text-lg font-light text-ink leading-none" aria-hidden="true">{pct}%</p>
      </div>

      <div
        className="h-1.5 rounded-full bg-line overflow-hidden mb-5"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${title}: ${pct}% complete`}
      >
        <div className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>

      <ol className="flex items-start justify-between gap-1">
        {steps.map((s, i) => {
          const current = i === currentIndex;
          return (
            <li key={s.label ?? i} className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
              <span
                className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  s.done
                    ? "bg-gold border-gold text-page"
                    : current
                      ? "border-gold text-gold bg-gold/10"
                      : "border-line text-ink-faint"
                }`}
              >
                {s.done
                  ? <Check size={13} strokeWidth={2.5} />
                  : <span className={`w-1.5 h-1.5 rounded-full ${current ? "bg-gold" : "bg-ink-faint/50"}`} />}
              </span>
              {s.label && (
                <span className={`text-[10px] tracking-[0.06em] text-center leading-tight truncate w-full ${current ? "text-ink font-medium" : "text-ink-faint"}`}>
                  {s.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {note && <p className="text-[11px] text-ink-muted font-light mt-4 text-center">{note}</p>}
    </div>
  );
}
