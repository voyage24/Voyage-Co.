"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function SaveButton({
  type, itemId, itemTitle, image, href, label = false,
}: {
  type: string; itemId: string; itemTitle: string; image?: string | null; href: string; label?: boolean;
}) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/account/saved")
      .then(r => r.json())
      .then(d => {
        setLoggedIn(!!d.loggedIn);
        if (d.loggedIn) setSaved((d.items ?? []).some((i: { type: string; itemId: string }) => i.type === type && i.itemId === itemId));
      })
      .catch(() => setLoggedIn(false));
  }, [type, itemId]);

  const toggle = async () => {
    if (busy) return;
    if (!loggedIn) { router.push("/login"); return; }
    setBusy(true);
    const method = saved ? "DELETE" : "POST";
    const res = await fetch("/api/account/saved", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, itemId, itemTitle, image, href }),
    });
    setBusy(false);
    if (res.ok) setSaved(s => !s);
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove from saved" : "Save"}
      className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors disabled:opacity-50"
    >
      <Heart size={16} className={saved ? "fill-gold text-gold" : ""} />
      {label && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
