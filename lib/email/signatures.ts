// Per-alias email signatures. Mail sent from a given address signs off with the
// matching team name and eyebrow, so bookings@ reads as Reservations, press@ as
// the Press Office, etc. Falls back to the concierge signature.

export type Signature = { name: string; eyebrow: string; team: string; opening: string };

const TEAMS: Record<string, { name: string; team: string; eyebrow: string }> = {
  hello: { name: "Voyages & Co.", team: "The Voyages & Co. Team", eyebrow: "Voyages & Co." },
  concierge: { name: "Voyages & Co. Concierge", team: "Your Concierge", eyebrow: "Voyages & Co. Concierge" },
  bookings: { name: "Voyages & Co. Reservations", team: "The Reservations Team", eyebrow: "Voyages & Co. Reservations" },
  reservations: { name: "Voyages & Co. Reservations", team: "The Reservations Team", eyebrow: "Voyages & Co. Reservations" },
  press: { name: "Voyages & Co. Press Office", team: "The Press Office", eyebrow: "Voyages & Co. Press" },
  media: { name: "Voyages & Co. Press Office", team: "The Press Office", eyebrow: "Voyages & Co. Press" },
  support: { name: "Voyages & Co. Guest Care", team: "The Guest Care Team", eyebrow: "Voyages & Co. Guest Care" },
  help: { name: "Voyages & Co. Guest Care", team: "The Guest Care Team", eyebrow: "Voyages & Co. Guest Care" },
  partners: { name: "Voyages & Co. Partnerships", team: "The Partnerships Team", eyebrow: "Voyages & Co. Partnerships" },
};

const DEFAULT = TEAMS.concierge;

// Returns the closing line and the team name only — the email template renders
// the team and "Voyages & Co." lines itself, so returning a whole signature here
// would sign every message twice.
export function signatureFor(fromAddr?: string | null, opening = "With warm regards,"): Signature {
  const local = (fromAddr || "").split("@")[0]?.toLowerCase() || "";
  const t = TEAMS[local] ?? DEFAULT;
  return { name: t.name, eyebrow: t.eyebrow, team: t.team, opening };
}

// The template always appends the signature, so a sign-off left at the end of
// the body (typed by hand, or slipped in by a drafting model despite being told
// not to) would show up as a second one. Strip a trailing closing line plus the
// couple of short name/team lines under it. Deliberately conservative: it needs
// a recognised closing phrase on its own line, so prose that merely ends with
// "…and we thank you for your patience." is left alone.
const TRAILING_SIGNOFF =
  /\n[ \t]*(?:with\s+)?(?:warm(?:est)?\s+regards|kind\s+regards|best\s+regards|regards|best\s+wishes|sincerely|yours\s+(?:sincerely|truly)|cheers|with\s+anticipation)[ \t]*[,.!]?[ \t]*(?:\n[ \t]*[^\n]{0,60}){0,3}[\s]*$/i;

export function stripTrailingSignoff(body: string): string {
  return String(body || "").replace(TRAILING_SIGNOFF, "").trimEnd();
}
