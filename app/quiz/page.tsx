"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, RotateCcw } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import FormProgress from "@/components/ui/FormProgress";

type Choice = { label: string; tag: string };
const QUESTIONS: { id: string; q: string; choices: Choice[] }[] = [
  { id: "mood", q: "What does your ideal escape feel like?", choices: [
    { label: "Rest & renewal", tag: "wellness" }, { label: "Thrill & adventure", tag: "adventure" },
    { label: "Culture & history", tag: "cultural" }, { label: "Sun, sea & islands", tag: "beach" },
    { label: "Wildlife & nature", tag: "wildlife" }, { label: "Food & wine", tag: "culinary" },
  ]},
  { id: "pace", q: "Your preferred pace?", choices: [
    { label: "Slow & restorative", tag: "slow" }, { label: "Balanced", tag: "balanced" }, { label: "Active & full", tag: "active" },
  ]},
  { id: "who", q: "Who's travelling?", choices: [
    { label: "Just me", tag: "solo" }, { label: "Two of us", tag: "couple" }, { label: "Family", tag: "family" }, { label: "Friends", tag: "friends" },
  ]},
  { id: "budget", q: "Budget per person?", choices: [
    { label: "Up to ₹2L", tag: "value" }, { label: "₹2L–₹5L", tag: "premium" }, { label: "₹5L+", tag: "ultra" },
  ]},
];

// Map the chosen "mood" tag to a styled result + relevant catalogue links.
const RESULTS: Record<string, { title: string; blurb: string; links: { label: string; href: string }[] }> = {
  wellness:  { title: "The Restorative Soul", blurb: "Spa sanctuaries, wellness retreats and serene escapes made for renewal.", links: [{ label: "Wellness experiences", href: "/experiences?category=wellness" }, { label: "Luxury stays", href: "/hotels" }] },
  adventure: { title: "The Adventurer", blurb: "Remote landscapes, adrenaline and journeys off the beaten path.", links: [{ label: "Adventure experiences", href: "/experiences?category=adventure" }, { label: "Bespoke journeys", href: "/packages" }] },
  cultural:  { title: "The Culture Seeker", blurb: "Ancient cities, art, architecture and immersive local encounters.", links: [{ label: "Cultural experiences", href: "/experiences?category=cultural" }, { label: "Curated journeys", href: "/packages" }] },
  beach:     { title: "The Island Dreamer", blurb: "Overwater villas, turquoise waters and barefoot luxury.", links: [{ label: "Beach stays", href: "/hotels" }, { label: "Cruises", href: "/cruises" }] },
  wildlife:  { title: "The Explorer", blurb: "Safaris, rare wildlife and nature at its most magnificent.", links: [{ label: "Wildlife experiences", href: "/experiences?category=wildlife" }, { label: "Bespoke journeys", href: "/packages" }] },
  culinary:  { title: "The Epicurean", blurb: "Tasting menus, vineyards and culinary journeys for the senses.", links: [{ label: "Culinary experiences", href: "/experiences?category=culinary" }, { label: "Luxury stays", href: "/hotels" }] },
};

export default function QuizPage() {
  const c = useContent();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [lead, setLead] = useState({ name: "", email: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const done = step >= QUESTIONS.length;
  const result = RESULTS[answers.mood] ?? RESULTS.cultural;

  const pick = (qid: string, tag: string) => { setAnswers(a => ({ ...a, [qid]: tag })); setStep(s => s + 1); };
  const reset = () => { setStep(0); setAnswers({}); setSent(false); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return; setBusy(true);
    const labelled = Object.fromEntries(QUESTIONS.map(q => [q.id, q.choices.find(c => c.tag === answers[q.id])?.label ?? answers[q.id]]));
    const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...lead, result: result.title, answers: labelled }) });
    setBusy(false);
    if (res.ok) setSent(true);
  };

  const field = "w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">{c("quiz.eyebrow") || "Find your journey"}</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">{c("quiz.title") || "What kind of traveller are you?"}</h1>
      </div>

      {!done ? (
        <div className="bg-panel border border-line rounded-2xl p-6 sm:p-8">
          {/* A question counts as done once it's been answered. */}
          <FormProgress
            steps={QUESTIONS.map((_, i) => ({ done: i < step }))}
            note={`Question ${step + 1} of ${QUESTIONS.length}`}
          />
          <p className="font-serif text-xl font-light text-ink mb-5">{QUESTIONS[step].q}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUESTIONS[step].choices.map(c => (
              <button key={c.tag} onClick={() => pick(QUESTIONS[step].id, c.tag)} className="text-left px-4 py-3 border border-line rounded-sm text-sm text-ink hover:border-gold hover:bg-panel-soft transition-colors">
                {c.label}
              </button>
            ))}
          </div>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="mt-5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink">← Back</button>}
        </div>
      ) : (
        <div className="bg-panel border border-line rounded-2xl p-6 sm:p-8 text-center">
          <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint mb-2">Your travel style</p>
          <h2 className="font-serif text-3xl font-light text-gold mb-3">{result.title}</h2>
          <p className="text-ink-muted font-light max-w-md mx-auto mb-6">{result.blurb}</p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {result.links.map(l => (
              <Link key={l.href} href={l.href} className="px-5 py-2.5 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">{l.label}</Link>
            ))}
          </div>

          {sent ? (
            <p className="text-sm text-gold"><Check size={16} className="inline mr-1" /> Thank you — we&apos;ll send tailored ideas to your inbox.</p>
          ) : (
            <form onSubmit={submit} className="border-t border-line pt-6 max-w-sm mx-auto space-y-3">
              <p className="text-sm text-ink-muted font-light">Want a few hand-picked journeys for your style? Leave your details.</p>
              <input required placeholder="Your name" className={field} value={lead.name} onChange={e => setLead(l => ({ ...l, name: e.target.value }))} />
              <input required type="email" placeholder="you@example.com" className={field} value={lead.email} onChange={e => setLead(l => ({ ...l, email: e.target.value }))} />
              <button type="submit" disabled={busy} className="w-full px-6 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">{busy ? "Sending…" : "Send me ideas"}</button>
            </form>
          )}
          <button onClick={reset} className="mt-6 inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink"><RotateCcw size={13} /> Retake</button>
        </div>
      )}
    </div>
  );
}
