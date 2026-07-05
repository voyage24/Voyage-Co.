"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, Mail } from "lucide-react";

export default function ReferShare({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  const text = encodeURIComponent(`I thought you'd love Voyages & Co. — join with my link: ${link}`);
  const whatsapp = `https://wa.me/?text=${text}`;
  const mail = `mailto:?subject=${encodeURIComponent("Join me on Voyages & Co.")}&body=${text}`;

  return (
    <div>
      <div className="flex items-stretch gap-2">
        <input
          readOnly
          value={link}
          onClick={e => (e.target as HTMLInputElement).select()}
          className="flex-1 min-w-0 bg-panel-soft border border-line rounded-sm px-3 py-2.5 text-sm text-ink font-light"
        />
        <button onClick={copy} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 transition-colors shrink-0">
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <div className="flex gap-3 mt-4">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 border border-line-strong text-ink text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
          <MessageCircle size={14} /> WhatsApp
        </a>
        <a href={mail} className="inline-flex items-center gap-2 px-4 py-2.5 border border-line-strong text-ink text-xs tracking-[0.12em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
          <Mail size={14} /> Email
        </a>
      </div>
    </div>
  );
}
