"use client";

import { useState } from "react";
import { Share2, Copy, Check, Download } from "lucide-react";

export default function GiftShare({ url, recipientName }: { url: string; recipientName?: string | null }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const data = { title: "A gift from Voyages & Co.", text: `${recipientName ? `${recipientName}, a` : "A"} luxury travel gift awaits you.`, url };
    if (navigator.share) { try { await navigator.share(data); return; } catch { /* cancelled */ } }
    copy();
  };
  const copy = () => navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 print:hidden">
      <button onClick={share} className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
        <Share2 size={15} /> Share gift
      </button>
      <button onClick={copy} className="inline-flex items-center gap-2 px-5 py-3 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
        {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy link"}
      </button>
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-5 py-3 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
        <Download size={15} /> Save as PDF
      </button>
    </div>
  );
}
