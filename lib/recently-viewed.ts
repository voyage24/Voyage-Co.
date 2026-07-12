"use client";

import { useEffect, useState } from "react";

export type ViewedItem = { type: string; id: string; title: string; image: string; href: string; price?: number };

const KEY = "vc-recently-viewed";
const MAX = 12;

export function recordView(item: ViewedItem) {
  try {
    const list: ViewedItem[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const next = [item, ...list.filter(x => !(x.type === item.type && x.id === item.id))].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function useRecentlyViewed(excludeType?: string, excludeId?: string) {
  const [list, setList] = useState<ViewedItem[]>([]);
  useEffect(() => {
    try {
      const all: ViewedItem[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      setList(all.filter(x => !(x.type === excludeType && x.id === excludeId)));
    } catch {}
  }, [excludeType, excludeId]);
  return list;
}
