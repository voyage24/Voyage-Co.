"use client";

import { Suspense, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { BellPlus, Check } from "lucide-react";

const CRITERIA_KEYS = ["city", "region", "category", "country", "maxPrice", "q"];

type SearchType = "hotel" | "package" | "experience" | "cruise";

// useSearchParams must sit under a Suspense boundary, so the export wraps it.
export default function SaveSearchButton({ type }: { type: SearchType }) {
  return (
    <Suspense fallback={null}>
      <Inner type={type} />
    </Suspense>
  );
}

function Inner({ type }: { type: SearchType }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (busy || saved) return;
    setBusy(true);

    const criteria: Record<string, string> = {};
    CRITERIA_KEYS.forEach(k => { const v = params.get(k); if (v) criteria[k] = v; });
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    const descr = Object.values(criteria).join(" · ");
    const label = descr ? `${type[0].toUpperCase()}${type.slice(1)}s — ${descr}` : `All ${type}s`;

    const res = await fetch("/api/account/searches", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, label, href, criteria }),
    });
    setBusy(false);
    if (res.status === 401) { router.push("/login"); return; }
    if (res.ok) setSaved(true);
  };

  return (
    <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink disabled:opacity-50 transition-colors">
      {saved ? <Check size={15} className="text-gold" /> : <BellPlus size={15} />}
      {saved ? "Saved — we'll alert you" : "Save this search"}
    </button>
  );
}
