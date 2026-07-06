"use client";

import { useRef, useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { parseMrz, type MrzResult } from "@/lib/mrz";
import { haptic } from "@/lib/haptics";

// Camera passport scan: take a photo, OCR the machine-readable zone with
// tesseract.js (loaded lazily, only on use), parse the name and autofill it.
// Best-effort — if it can't read the passport, the user just types as normal.
export default function PassportScan({ onScan }: { onScan: (r: MrzResult) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true); setMsg("Reading passport…");
    try {
      const { recognize } = await import("tesseract.js");
      const { data } = await recognize(file, "eng");
      const result = parseMrz(data.text || "");
      if (result) {
        onScan(result);
        haptic("success");
        setMsg(`Scanned: ${result.fullName}`);
      } else {
        setMsg("Couldn't read the passport clearly — please enter details manually.");
      }
    } catch {
      setMsg("Scanning isn't available right now — please enter details manually.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button" onClick={() => inputRef.current?.click()} disabled={busy}
        className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-gold link-underline disabled:opacity-50"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <ScanLine size={14} />}
        {busy ? "Scanning…" : "Scan passport"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
      {msg && <p className="text-[11px] text-ink-faint mt-1.5">{msg}</p>}
    </div>
  );
}
