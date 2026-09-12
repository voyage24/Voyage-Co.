// Payment gateways the admin can select from. The secret key for whichever
// provider is active always lives in a Vercel env var (never the database —
// matches this project's convention for every other integration: SMTP,
// Amadeus, Turnstile, VAPID). Only the non-secret bits (which provider is
// active, its public/publishable key) are admin-editable via SiteSetting.
export const PAYMENT_PROVIDERS = [
  { id: "", label: "None — not accepting payments yet", secretEnvVar: null, publicKeyLabel: "" },
  { id: "razorpay", label: "Razorpay", secretEnvVar: "RAZORPAY_KEY_SECRET", publicKeyLabel: "Key ID" },
  { id: "stripe", label: "Stripe", secretEnvVar: "STRIPE_SECRET_KEY", publicKeyLabel: "Publishable key" },
  { id: "payu", label: "PayU", secretEnvVar: "PAYU_MERCHANT_SALT", publicKeyLabel: "Merchant key" },
  { id: "instamojo", label: "Instamojo", secretEnvVar: "INSTAMOJO_AUTH_TOKEN", publicKeyLabel: "API key" },
  { id: "other", label: "Other / custom gateway", secretEnvVar: "PAYMENT_GATEWAY_SECRET", publicKeyLabel: "Public key" },
] as const;

export type PaymentProviderId = typeof PAYMENT_PROVIDERS[number]["id"];

export function providerFor(id: string) {
  return PAYMENT_PROVIDERS.find(p => p.id === id) ?? PAYMENT_PROVIDERS[0];
}
