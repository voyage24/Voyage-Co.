"use client";

import { useState } from "react";
import { RefreshCw, Monitor, Smartphone, ExternalLink } from "lucide-react";

const PAGES = [
  { label: "Home", path: "/" },
  { label: "Plan Your Journey", path: "/plan" },
  { label: "Destinations", path: "/packages" },
  { label: "Stays", path: "/hotels" },
  { label: "Cruises", path: "/cruises" },
  { label: "Flights", path: "/flights" },
  { label: "Trains", path: "/trains" },
  { label: "Experiences", path: "/experiences" },
  { label: "Journal", path: "/blog" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function StorefrontPreview() {
  const [path, setPath] = useState("/");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [nonce, setNonce] = useState(0);

  const deviceBtn = (d: "desktop" | "mobile") =>
    `p-1.5 rounded ${device === d ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-200"}`;

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <select
          value={path}
          onChange={e => setPath(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white"
        >
          {PAGES.map(p => <option key={p.path} value={p.path}>{p.label}</option>)}
        </select>
        <span className="text-xs text-gray-400 font-mono truncate hidden sm:inline">voyagesco.com{path}</span>

        <div className="ml-auto flex items-center gap-1">
          <button type="button" aria-label="Desktop" onClick={() => setDevice("desktop")} className={deviceBtn("desktop")}><Monitor size={16} /></button>
          <button type="button" aria-label="Mobile" onClick={() => setDevice("mobile")} className={deviceBtn("mobile")}><Smartphone size={16} /></button>
          <button type="button" aria-label="Refresh" onClick={() => setNonce(n => n + 1)} className="p-1.5 rounded text-gray-500 hover:bg-gray-200"><RefreshCw size={16} /></button>
          <a href={path} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab" className="p-1.5 rounded text-gray-500 hover:bg-gray-200"><ExternalLink size={16} /></a>
        </div>
      </div>

      {/* Preview frame */}
      <div className="bg-gray-100 flex justify-center p-4 overflow-auto" style={{ height: 520 }}>
        <iframe
          key={`${path}-${device}-${nonce}`}
          src={path}
          title="Storefront live preview"
          className="bg-white shadow-md shrink-0"
          style={{ width: device === "mobile" ? 390 : "100%", maxWidth: "100%", height: "100%", border: "none" }}
        />
      </div>
    </div>
  );
}
