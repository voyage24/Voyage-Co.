"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING = "Welcome — I'm the Voyages & Co. concierge. Tell me what you're dreaming of (a destination, a mood, a budget, an occasion) and I'll suggest a few journeys.";

// Render markdown-style [text](url) links within a message.
function Rendered({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0; let m: RegExpExecArray | null; let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, url] = m;
    parts.push(
      url.startsWith("/")
        ? <Link key={i} href={url} className="text-gold underline underline-offset-2">{label}</Link>
        : <a key={i} href={url} className="text-gold underline underline-offset-2" target="_blank" rel="noopener noreferrer">{label}</a>
    );
    last = m.index + m[0].length; i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <span className="whitespace-pre-wrap">{parts}</span>;
}

export default function ConciergeChat() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-hide the launcher while scrolling down; bring it back on scroll up
  // or near the top, so it never sits over content the guest is reading.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 140) setHidden(false);
      else if (y > last + 6) setHidden(true);
      else if (y < last - 6) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: next.filter(m => m.content !== GREETING) }),
      });
      const data = await res.json().catch(() => ({}));
      setMessages(m => [...m, { role: "assistant", content: data.reply ?? "Sorry, please try again." }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "I'm having trouble just now — please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask the concierge"
        className={`fixed bottom-5 left-5 z-40 flex items-center gap-2 bg-ink text-page pl-3 pr-4 py-2.5 rounded-full shadow-luxury hover:scale-105 active:scale-95 transition-all duration-300 ${hidden ? "translate-y-24 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
      >
        <Sparkles size={16} className="text-gold" />
        <span className="text-[11px] tracking-[0.12em] uppercase">Ask the Concierge</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:justify-start sm:pl-6 p-0 sm:p-6">
          <div className="absolute inset-0 bg-vc-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:w-[400px] h-[85vh] sm:h-[600px] bg-panel-raised border border-line shadow-luxury flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-ink text-page">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-gold" />
                <span className="font-serif text-lg font-light">Concierge</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className={`inline-block max-w-[85%] text-left px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-ink text-page" : "bg-panel-soft text-ink-muted border border-line"}`}>
                    <Rendered text={m.content} />
                  </div>
                </div>
              ))}
              {loading && <p className="text-xs text-ink-faint px-1">The concierge is thinking…</p>}
            </div>

            <form onSubmit={send} className="border-t border-line p-3 flex items-center gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g. quiet islands, great food, ~₹4L pp…"
                className="flex-1 bg-panel-soft border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-gold"
              />
              <button type="submit" disabled={loading || !input.trim()} aria-label="Send" className="bg-ink text-page p-2.5 disabled:opacity-50">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
