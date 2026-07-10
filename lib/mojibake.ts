// Repairs "mojibake" — text where UTF-8 was mis-decoded as Windows-1252, e.g. an
// em dash "—" showing as "â€"", or "é" as "Ã©". Uses precise \u escape sequences
// so it targets only the known bad byte-patterns and never alters ordinary text.

const FIXES: [RegExp, string][] = [
  [/â€”/g, "—"], // em dash —
  [/â€“/g, "–"], // en dash –
  [/â€™/g, "’"], // right single quote '
  [/â€˜/g, "‘"], // left single quote '
  [/â€œ/g, "“"], // left double quote "
  [/â€/g, "”"], // right double quote "
  [/â€¦/g, "…"], // ellipsis …
  [/â€¢/g, "•"], // bullet •
  [/Â /g, " "],            // non-breaking space
  // Common accented letters (French / Spanish travel content)
  [/Ã©/g, "é"], // é
  [/Ã¨/g, "è"], // è
  [/Ãª/g, "ê"], // ê
  [/Ã /g, "à"], // à
  [/Ã¢/g, "â"], // â
  [/Ã®/g, "î"], // î
  [/Ã´/g, "ô"], // ô
  [/Ã»/g, "û"], // û
  [/Ã§/g, "ç"], // ç
  [/Ã±/g, "ñ"], // ñ
  [/Ã¼/g, "ü"], // ü
  [/Ã¶/g, "ö"], // ö
  [/Ã¡/g, "á"], // á
  [/Ã­/g, "í"], // í
  [/Ã³/g, "ó"], // ó
  [/Ãº/g, "ú"], // ú
  [/Ã¤/g, "ä"], // ä
  [/Ã«/g, "ë"], // ë
];

export function hasMojibake(s: string): boolean {
  return /â€|Ã[-¿]|Â /.test(s);
}

function fixString(s: string): string {
  let out = s;
  for (const [re, ch] of FIXES) out = out.replace(re, ch);
  return out;
}

// Fixes a string, or an array of strings; leaves any other value untouched.
export function fixMojibake(v: unknown): unknown {
  if (typeof v === "string") return fixString(v);
  if (Array.isArray(v)) return v.map(item => (typeof item === "string" ? fixString(item) : item));
  return v;
}
