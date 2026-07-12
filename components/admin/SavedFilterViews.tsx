"use client";

import { useEffect, useState } from "react";
import { Bookmark, Plus, X } from "lucide-react";

type View = { name: string; value: string };

// Lightweight saved views: bookmark the current filter under a name (stored in
// the browser) and re-apply it in one tap. Self-contained; no backend.
export default function SavedFilterViews({ storageKey, current, onApply }: { storageKey: string; current: string; onApply: (v: string) => void }) {
  const [views, setViews] = useState<View[]>([]);

  useEffect(() => {
    try { setViews(JSON.parse(localStorage.getItem(storageKey) || "[]")); } catch { /* ignore */ }
  }, [storageKey]);

  const persist = (next: View[]) => { setViews(next); try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* quota */ } };
  const save = () => {
    const name = prompt("Name this view:")?.trim();
    if (!name) return;
    persist([...views.filter(v => v.name !== name), { name, value: current }]);
  };
  const del = (name: string) => persist(views.filter(v => v.name !== name));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {views.map(v => (
        <span key={v.name} className={`inline-flex items-center gap-1 text-xs rounded-full pl-2.5 pr-1 py-1 border ${current === v.value ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 text-gray-600"}`}>
          <button onClick={() => onApply(v.value)} className="inline-flex items-center gap-1"><Bookmark size={11} /> {v.name}</button>
          <button onClick={() => del(v.name)} aria-label="Delete view" className={`${current === v.value ? "text-gray-300 hover:text-white" : "text-gray-400 hover:text-red-500"}`}><X size={11} /></button>
        </span>
      ))}
      <button onClick={save} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 border border-dashed border-gray-300 rounded-full px-2.5 py-1">
        <Plus size={11} /> Save view
      </button>
    </div>
  );
}
