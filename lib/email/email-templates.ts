import { getPageContentMap } from "@/lib/page-content";

// ── Editable transactional-email templates ───────────────────────────────────
// Each template's subject / heading / body is editable in admin (stored in the
// PageContent table under email.<key>.<field>) and falls back to the shipped
// default. Bodies support simple {placeholders}. The branded shell around them
// (logo, footer) is rendered by lib/email/template.ts.

export type EmailTemplateDef = {
  key: string;
  label: string;
  description: string;
  placeholders: string[];
  subject: string;
  heading: string;
  body: string;
};

export const EMAIL_TEMPLATES: EmailTemplateDef[] = [
  {
    key: "verify",
    label: "Account verification",
    description: "Sent when a new member signs up, to confirm their email address.",
    placeholders: ["{firstName}"],
    subject: "Confirm your Voyages & Co. account",
    heading: "Confirm your email{firstName}",
    body: "Please confirm your email address to activate your Voyages & Co. account. This link is valid for 24 hours. If you didn't create an account, you can safely ignore this message.",
  },
  {
    key: "welcome",
    label: "Welcome",
    description: "Sent once a member confirms their email address.",
    placeholders: ["{firstName}"],
    subject: "Welcome to Voyages & Co.",
    heading: "Welcome{firstName}",
    body: "Your Voyages & Co. account is ready. You can now save journeys to your wishlist, build itineraries, track your bookings, and receive tailored ideas from our concierge. We look forward to crafting something extraordinary for you.",
  },
  {
    key: "reset",
    label: "Password reset",
    description: "Sent when a member requests a password reset.",
    placeholders: ["{firstName}"],
    subject: "Reset your Voyages & Co. password",
    heading: "Reset your password{firstName}",
    body: "We received a request to reset your Voyages & Co. password. This link is valid for one hour. If you didn't ask for this, you can safely ignore this email — your password won't change.",
  },
  {
    key: "booking",
    label: "Booking received",
    description: "Sent to the guest when a reservation request is submitted.",
    placeholders: ["{firstName}", "{reference}", "{itemTitle}"],
    subject: "Your Voyages & Co. reservation — {reference}",
    heading: "Thank you{firstName}",
    body: "We've received your reservation request for {itemTitle}. Your reference is {reference}. A travel advisor will confirm availability and the final details with you shortly, and you can view this booking any time in your account.",
  },
];

const EMAIL_BY_KEY = new Map(EMAIL_TEMPLATES.map(t => [t.key, t]));
export const EMAIL_KEYS = new Set(
  EMAIL_TEMPLATES.flatMap(t => [`email.${t.key}.subject`, `email.${t.key}.heading`, `email.${t.key}.body`]),
);

export function applyPlaceholders(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ""));
}

// Splits a plain-text body (paragraphs on blank/new lines) into HTML paragraphs.
export function bodyToHtml(body: string): string {
  return body
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 12px;">${p}</p>`)
    .join("");
}

export type ResolvedEmail = { subject: string; heading: string; body: string };

// Resolves a template (override → default), with placeholders substituted.
export async function getEmailTemplate(key: string, vars: Record<string, string> = {}): Promise<ResolvedEmail> {
  const def = EMAIL_BY_KEY.get(key);
  if (!def) return { subject: "", heading: "", body: "" };
  let map: Record<string, string> = {};
  try { map = await getPageContentMap(); } catch { /* defaults */ }
  return {
    subject: applyPlaceholders(map[`email.${key}.subject`] || def.subject, vars),
    heading: applyPlaceholders(map[`email.${key}.heading`] || def.heading, vars),
    body: applyPlaceholders(map[`email.${key}.body`] || def.body, vars),
  };
}
