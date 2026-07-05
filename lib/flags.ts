// Emoji-flag helpers for the language & currency selectors. Flags are derived
// from ISO country codes converted to regional-indicator symbols, so there are
// no image assets to ship.

export function flagFromCountry(cc: string): string {
  if (!/^[A-Za-z]{2}$/.test(cc)) return "🌐";
  const BASE = 0x1f1e6; // regional indicator 'A'
  const up = cc.toUpperCase();
  return String.fromCodePoint(BASE + up.charCodeAt(0) - 65, BASE + up.charCodeAt(1) - 65);
}

// A currency's first two letters are usually its ISO country (INR→IN, GBP→GB,
// EUR→EU). Supranational X-codes have no flag, so fall back to a globe.
const CURRENCY_NO_FLAG = new Set(["XAF", "XOF", "XCD", "XPF", "XDR", "XAU", "XAG"]);
export function currencyFlag(code: string): string {
  if (CURRENCY_NO_FLAG.has(code)) return "🌐";
  return flagFromCountry(code.slice(0, 2));
}

// A representative country for each supported UI language.
const LANGUAGE_COUNTRY: Record<string, string> = {
  en: "GB", es: "ES", fr: "FR", de: "DE", it: "IT", pt: "PT", nl: "NL", ru: "RU",
  uk: "UA", pl: "PL", cs: "CZ", hu: "HU", ro: "RO", el: "GR", sv: "SE", da: "DK",
  no: "NO", fi: "FI", tr: "TR", ar: "SA", he: "IL", fa: "IR", ur: "PK", hi: "IN",
  bn: "BD", th: "TH", vi: "VN", id: "ID", ms: "MY", tl: "PH", zh: "CN", ja: "JP",
  ko: "KR", sw: "KE", mr: "IN", gu: "IN",
};
export function languageFlag(code: string): string {
  return flagFromCountry(LANGUAGE_COUNTRY[code] ?? "");
}
