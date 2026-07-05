// Cloudflare Turnstile verification. Forms send a token; routes verify it here
// before doing any work (creating accounts, sending mail, etc.).
//
// Fails OPEN when unconfigured (no TURNSTILE_SECRET_KEY) so the site keeps
// working locally and before the keys are added; fails CLOSED once a secret is
// set but the token is missing or invalid.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: unknown, ip?: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet → don't block anyone
  if (typeof token !== "string" || !token) return false;

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// First IP from the forwarded chain, for Turnstile's optional remoteip check.
export function clientIp(req: Request): string | undefined {
  const xff = req.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : undefined;
}
