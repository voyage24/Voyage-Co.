"use client";

import { createContext, useContext } from "react";

// Admin content overrides (key → value). Empty when nothing is overridden.
const ContentContext = createContext<Record<string, string>>({});

export function ContentProvider({ content, children }: { content: Record<string, string>; children: React.ReactNode }) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

// Returns a lookup for admin overrides. A component typically does:
//   const c = useContent();  …  c("nav.stays") || t("common.stays")
// so an admin override wins and everything else keeps translating.
export function useContent(): (key: string) => string {
  const ctx = useContext(ContentContext);
  return (key: string) => ctx[key] ?? "";
}

// Repeatable lists are stored as a JSON string under their key. Returns the
// parsed override array, or `null` when nothing is saved so the caller can fall
// back to its hard-coded default:
//   const items = useContentList("list.faq") ?? DEFAULT_FAQ;
export function useContentList(key: string): Record<string, string>[] | null {
  const ctx = useContext(ContentContext);
  const raw = ctx[key];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Record<string, string>[]) : null;
  } catch {
    return null;
  }
}
