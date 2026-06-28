"use client";

import { useEffect, useState } from "react";

// Side-by-side comparison list, persisted in localStorage. Each entry carries
// its own comparison attributes so the /compare page needs no extra fetch.
export type CompareItem = {
  type: string;
  id: string;
  title: string;
  image: string;
  href: string;
  attrs?: Record<string, string>;
};

const KEY = "vc-compare";
const EVT = "vc-compare-change";
const MAX = 4;

function read(): CompareItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(list: CompareItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  window.dispatchEvent(new Event(EVT));
}

export function toggleCompare(item: CompareItem) {
  const list = read();
  const i = list.findIndex(x => x.type === item.type && x.id === item.id);
  if (i >= 0) list.splice(i, 1);
  else {
    list.push(item);
    while (list.length > MAX) list.shift();
  }
  write(list);
}
export function removeCompare(type: string, id: string) {
  write(read().filter(x => !(x.type === type && x.id === id)));
}
export function clearCompare() { write([]); }

export function useCompare() {
  const [list, setList] = useState<CompareItem[]>([]);
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return list;
}
