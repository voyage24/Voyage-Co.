// A hidden form field real visitors never see or fill in — most simple bots
// (including ones that can solve a Turnstile challenge) still fill in every
// input they find. Routes return `ok: true` on a filled honeypot anyway, so
// the bot gets no signal that it was caught and doesn't adapt.
export function isHoneypotFilled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
