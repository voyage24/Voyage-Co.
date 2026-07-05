// Shared WebAuthn (passkey) configuration. The relying-party ID must be the
// registrable domain the site is served from; origin is the full URL. Both are
// overridable for local testing.
export const RP_NAME = "Voyages & Co.";
export const RP_ID = process.env.WEBAUTHN_RP_ID || "voyagesco.com";
export const EXPECTED_ORIGINS = (process.env.WEBAUTHN_ORIGIN || "https://voyagesco.com")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// Short-lived cookie that holds the current ceremony's challenge.
export const PK_CHALLENGE_COOKIE = "pk_challenge";

export function challengeCookie(value: string) {
  return {
    name: PK_CHALLENGE_COOKIE,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 300,
    },
  };
}
