"use client";

import { createContext, useContext } from "react";
import type { SiteSettings } from "@/lib/site-settings";

const SettingsContext = createContext<SiteSettings | null>(null);

export function SettingsProvider({ settings, children }: { settings: SiteSettings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

// Returns a single setting value, or "" if the provider isn't present.
export function useSetting(key: keyof SiteSettings): string {
  const ctx = useContext(SettingsContext);
  return ctx ? ctx[key] : "";
}

export function useSettings(): SiteSettings | null {
  return useContext(SettingsContext);
}
