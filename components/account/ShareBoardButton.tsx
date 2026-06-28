"use client";

import { useState } from "react";

export default function ShareBoardButton() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const share = async () => {
    setLoading(true);
    const res = await fetch("/api/account/share", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (data.url) {
      setUrl(data.url);
      try {
        if (navigator.share) { await navigator.share({ title: "My Voyages & Co. shortlist", url: data.url }); return; }
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* user dismissed share sheet */ }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button onClick={share} disabled={loading} className="text-xs tracking-[0.12em] uppercase text-gold link-underline disabled:opacity-50">
        {loading ? "Preparing…" : copied ? "Link copied!" : "Share my list →"}
      </button>
      {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-faint truncate max-w-[200px]">{url.replace("https://", "")}</a>}
    </div>
  );
}
