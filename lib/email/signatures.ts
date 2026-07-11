// Per-alias email signatures. Mail sent from a given address signs off with the
// matching team name and eyebrow, so bookings@ reads as Reservations, press@ as
// the Press Office, etc. Falls back to the concierge signature.

export type Signature = { name: string; eyebrow: string; signoffText: string; signoffHtml: string };

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
const GOLD = "#8a6d3b";

export function signatureFor(fromAddr?: string | null): Signature {
  const local = (fromAddr || "").split("@")[0]?.toLowerCase() || "";
  const t = TEAMS[local] ?? DEFAULT;
  return {
    name: t.name,
    eyebrow: t.eyebrow,
    signoffText: `With warm regards,\n${t.team}\nVoyages & Co.`,
    signoffHtml: `With warm regards,<br>${t.team}<br><span style="color:${GOLD};">Voyages &amp; Co.</span>`,
  };
}
