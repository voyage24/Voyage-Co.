// Best-effort extraction of the sender's name when the email has no display
// name: first from a sign-off in the body ("Warm regards,\nPrasenjeet Gogte"),
// then from the address's local part ("goget.p" → "Goget P"). Used only for
// the reply greeting, so a polite miss is harmless.

const SIGNOFF = /\b(regards|warm regards|kind regards|best regards|best wishes|best|thanks|thank you|many thanks|sincerely|cheers|yours truly|yours sincerely)\s*[,!.]?\s*\n+\s*([A-Z][A-Za-z'.-]+(?:\s+[A-Z][A-Za-z'.-]+){0,2})\s*$/im;

function plausibleName(s: string): boolean {
  if (!s || s.length > 40) return false;
  if (/[@\d]/.test(s)) return false;
  // Reject obvious non-names that follow sign-offs ("The team", "Voyages"...).
  if (/\b(team|support|admin|concierge|noreply|newsletter|mailer)\b/i.test(s)) return false;
  return true;
}

export function guessNameFromEmail(bodyText: string | null | undefined, email: string): string {
  // 1. A sign-off in the last part of the message.
  const tail = (bodyText || "").trimEnd().slice(-600);
  const m = SIGNOFF.exec(tail);
  if (m && plausibleName(m[2])) return m[2].trim();

  // 2. Derive from the address's local part: "prasenjeet.gogte" → "Prasenjeet Gogte".
  const local = (email.split("@")[0] || "").replace(/\d+/g, "");
  const parts = local.split(/[._+-]+/).filter(p => p.length > 1);
  if (parts.length) {
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(" ");
  }
  return "";
}
