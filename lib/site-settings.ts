import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Every customisable setting, with its default (which matches the design as
// originally shipped). Anything the admin hasn't overridden falls back here.
export const SETTING_DEFAULTS = {
  // Colours (hex; injected as CSS variables site-wide)
  "color.page": "#F4F0E9",
  "color.panel": "#F9F6F0",
  "color.ink": "#211D18",
  "color.inkMuted": "#484036",
  "color.gold": "#705C38",
  "color.line": "#D6CEC0",
  // Fonts (Google Font family names)
  "font.body": "Inter",
  "font.heading": "Inter",
  // Logo image (blank = keep the built-in "Voyages & Co." text wordmark)
  "logo.light": "", // shown on dark backgrounds (use a white/light wordmark)
  "logo.dark": "",  // shown on light backgrounds (use a dark wordmark)
  // Contact + social
  "contact.phone": "+91 99199 10213",
  "contact.whatsapp": "919919910213",
  "contact.email": "hello@voyagesco.com",
  "social.instagram": "",
  "social.pinterest": "",
  "social.linkedin": "",
  // Homepage hero text (blank = use the built-in translated copy)
  "hero.headline": "",
  "hero.subtext": "",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type SiteSettings = Record<SettingKey, string>;

// Curated font choices offered in the admin (all available on Google Fonts).
export const FONT_OPTIONS = [
  "Inter", "Fahkwang", "Playfair Display", "Cormorant Garamond", "EB Garamond",
  "Lora", "Libre Baskerville", "Montserrat", "Source Sans 3", "Marcellus", "Jost",
];

// Fetched once per request.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const out = { ...SETTING_DEFAULTS } as Record<string, string>;
  try {
    const rows = await prisma.siteSetting.findMany();
    for (const row of rows) {
      if (row.key in SETTING_DEFAULTS && row.value != null) out[row.key] = row.value;
    }
  } catch {
    // If the table doesn't exist yet (pre-migration), fall back to defaults.
  }
  return out as SiteSettings;
});

// "#F4F0E9" -> "244 240 233" for `rgb(var(--x))` usage.
export function hexToRgbTriplet(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "0 0 0";
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

// Builds the <style> + font <link> that override the design tokens. Injected
// in the root layout so SSR is already themed (no flash of default colours).
export function buildThemeHead(s: SiteSettings) {
  const css = `:root{
--page:${hexToRgbTriplet(s["color.page"])};
--panel:${hexToRgbTriplet(s["color.panel"])};
--ink:${hexToRgbTriplet(s["color.ink"])};
--ink-muted:${hexToRgbTriplet(s["color.inkMuted"])};
--gold:${hexToRgbTriplet(s["color.gold"])};
--line:${hexToRgbTriplet(s["color.line"])};
--font-body:'${s["font.body"]}',system-ui,sans-serif;
--font-heading:'${s["font.heading"]}',system-ui,sans-serif;
}`;
  const families = Array.from(new Set([s["font.body"], s["font.heading"]]))
    .map(f => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`)
    .join("&");
  const fontHref = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  return { css, fontHref };
}
