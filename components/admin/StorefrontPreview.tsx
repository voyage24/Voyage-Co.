"use client";

import { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";

export type PreviewOption = { value: string; label: string };
export type PreviewGroup = { label: string; options: PreviewOption[] };

export default function StorefrontPreview({ groups }: { groups: PreviewGroup[] }) {
  const [path, setPath] = useState("/");
  const [nonce, setNonce] = useState(0);

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden max-w-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <select
          value={path}
          onChange={e => setPath(e.target.value)}
          className="flex-1 min-w-0 border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
        >
          {groups.map(g => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </optgroup>
          ))}
        </select>
        <button type="button" aria-label="Refresh" onClick={() => setNonce(n => n + 1)} className="p-1.5 rounded text-gray-500 hover:bg-gray-200 shrink-0"><RefreshCw size={15} /></button>
        <a href={path} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab" className="p-1.5 rounded text-gray-500 hover:bg-gray-200 shrink-0"><ExternalLink size={15} /></a>
      </div>

      {/* Compact preview — a phone-width viewport so the whole storefront
          renders faithfully inside a small window. */}
      <div className="bg-gray-100 p-3">
        <iframe
          key={`${path}-${nonce}`}
          src={path}
          title="Storefront live preview"
          className="bg-white shadow-sm mx-auto block"
          style={{ width: 320, height: 380, border: "none" }}
        />
      </div>
    </div>
  );
}
