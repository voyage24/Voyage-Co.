import crypto from "crypto";

// A one-click unsubscribe link must work without a login, so it carries a
// tamper-proof token: an HMAC of the subscriber's email. Anyone can craft
// the link for their own address, but nobody can forge one for someone
// else's without the server secret.
function secret() {
  return process.env.SESSION_COOKIE_SECRET ?? "";
}

export function makeUnsubscribeToken(email: string): string {
  return crypto.createHmac("sha256", secret()).update(email.toLowerCase()).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = makeUnsubscribeToken(email);
  // Constant-time compare to avoid leaking the token via timing.
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function unsubscribeUrl(email: string): string {
  const base = "https://voyagesco.com";
  const token = makeUnsubscribeToken(email);
  return `${base}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
