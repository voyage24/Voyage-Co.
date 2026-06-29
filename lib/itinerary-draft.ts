"use client";

import { useEffect, useState } from "react";

export type ItineraryEntry = { type: string; id: string; title: string; image: string; href: string; price?: number };

const KEY = "vc-itinerary-draft";
const EVT = "vc-itinerary-change";
const MAX = 15;

function read(): ItineraryEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(list: ItineraryEntry[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  window.dispatchEvent(new Event(EVT));
}

export function toggleItinerary(item: ItineraryEntry) {
  const list = read();
  const i = list.findIndex(x => x.type === item.type && x.id === item.id);
  if (i >= 0) list.splice(i, 1);
  else { list.push(item); while (list.length > MAX) list.shift(); }
  write(list);
}
export function removeItinerary(type: string, id: string) {
  write(read().filter(x => !(x.type === type && x.id === id)));
}
export function clearItineraryDraft() { write([]); }

export function useItineraryDraft() {
  const [list, setList] = useState<ItineraryEntry[]>([]);
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return list;
}
