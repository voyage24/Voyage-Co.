// Suggests a professional email body from the subject line, so the admin
// compose box drafts itself. Keyword-matched (fast, offline). Returns the body
// only — the greeting and sign-off are added by the email template.

type Rule = { test: RegExp; body: string };

const RULES: Rule[] = [
  { test: /\bcancel/i, body: "I'm writing to confirm that your reservation has been cancelled as requested. Should this be unexpected, or if we can assist in arranging an alternative, please do let us know — we would be glad to help.\n\nWe hope to have the pleasure of welcoming you on a future journey." },
  { test: /\bconfirm|confirmed|confirmation\b/i, body: "I'm delighted to confirm your reservation. Everything has been arranged, and our concierge team will remain on hand to assist with any detail ahead of your journey.\n\nPlease don't hesitate to reach out should you have any questions or special requests." },
  { test: /\bquot|proposal|estimate|pricing\b/i, body: "Thank you for your interest. It is our pleasure to prepare a tailored proposal for your journey. Please find the details enclosed, and do let us know if you would like to adjust anything.\n\nWe would be delighted to refine the itinerary to suit your preferences perfectly." },
  { test: /follow[ -]?up|following up|checking in|touch base|circling back/i, body: "I wanted to follow up on our recent correspondence to see whether you had any further thoughts, or if there is anything we can clarify.\n\nWe remain at your service and would be delighted to move forward whenever you are ready." },
  { test: /\bwelcome|joining|new member\b/i, body: "It is a genuine pleasure to welcome you to Voyages & Co. Our concierge team is now at your service to craft journeys shaped entirely around you.\n\nWhenever inspiration strikes — a destination, an occasion, or simply a desire to be away — we are only a message away." },
  { test: /itinerar|trip plan|day[ -]?by[ -]?day/i, body: "Please find your proposed itinerary enclosed. We have curated each day with care, balancing signature experiences with time to simply enjoy the moment.\n\nDo let us know your thoughts — every detail can be tailored to your taste." },
  { test: /invoice|payment|deposit|balance|remittance/i, body: "Thank you for confirming your journey. Our team will share the relevant details shortly so everything is settled well ahead of your departure.\n\nPlease let us know if you have any questions in the meantime." },
  { test: /change|amend|reschedul|modif|reschedule/i, body: "Thank you for letting us know. We have noted the requested changes and our concierge team is reviewing availability. We will confirm the updated arrangements and any implications shortly.\n\nIf you have a preferred alternative, do share it and we will do our utmost to accommodate." },
  { test: /availab/i, body: "Thank you for your patience. I'm pleased to share an update on availability for your requested dates. Please find the details below, and do let us know how you would like to proceed.\n\nWe would be glad to secure the arrangements the moment you are ready." },
  { test: /\bthank/i, body: "Thank you, sincerely, for choosing Voyages & Co. It has been our pleasure to be part of your plans, and we hope every moment of your journey is everything you imagined.\n\nWe look forward to welcoming you again before long." },
  { test: /apolog|sorry|inconvenience|delay|issue|concern/i, body: "Please accept our sincere apologies for the inconvenience. We hold ourselves to the highest standard, and we are addressing this with priority.\n\nOur concierge team will be in touch shortly with a resolution. Thank you for your understanding and patience." },
  { test: /reminder|upcoming|departure soon|don'?t forget/i, body: "A gentle reminder as your journey approaches. Everything is in order on our side; please do ensure your travel documents are to hand.\n\nShould you require anything at all before you depart, our concierge team is here around the clock." },
  { test: /offer|exclusive|special|promotion|deal|invitation/i, body: "As a valued guest, we wanted to share something special with you. Please find the details below — we felt it perfectly suited to your taste.\n\nDo let us know if it appeals, and we will be delighted to arrange everything on your behalf." },
  { test: /visa|document|passport|entry requirement/i, body: "Thank you for your enquiry regarding documentation. Our team will guide you through the requirements for your destination and ensure everything is in order ahead of travel.\n\nTo advise precisely, kindly confirm your nationality and intended travel dates." },
  { test: /flight/i, body: "Thank you for your enquiry. Our team is sourcing the finest fares and routing for your dates and will share a curated selection shortly.\n\nIf you have a preferred airline, cabin or timing, do let us know so we can tailor the options." },
  { test: /cruise|sailing|voyage aboard/i, body: "Thank you for your interest in this voyage. It promises a rare and memorable journey. Please find the details enclosed, and do let us know if you would like us to secure a stateroom.\n\nWe would be delighted to arrange every detail on your behalf." },
];

const DEFAULT_BODY = "Thank you for your message. Our concierge team has noted your request and will be in touch shortly with the details.\n\nPlease let us know if there is anything further we can prepare for you in the meantime.";

export function draftFromSubject(subject: string): string {
  const s = (subject || "").trim();
  if (!s) return DEFAULT_BODY;
  // Strip a leading "Re:" so replies match on the real topic.
  const topic = s.replace(/^\s*re:\s*/i, "");
  for (const rule of RULES) if (rule.test.test(topic)) return rule.body;
  return DEFAULT_BODY;
}

// Content-aware fallback (no AI): match keywords across the whole message —
// subject + body — so replies at least vary by topic. Not tailored like AI, but
// better than one fixed template.
export function draftFromContent(text: string): string {
  const t = (text || "").trim();
  if (!t) return DEFAULT_BODY;
  for (const rule of RULES) if (rule.test.test(t)) return rule.body;
  return DEFAULT_BODY;
}
