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
