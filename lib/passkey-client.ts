import { startRegistration } from "@simplewebauthn/browser";

// Client-only helpers for registering a passkey. Imported by client components.

export function deviceGuess(): string {
  if (typeof navigator === "undefined") return "This device";
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android device";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows device";
  return "This device";
}

export function passkeysSupported(): boolean {
  return typeof window !== "undefined" && typeof window.PublicKeyCredential === "function";
}

export async function registerPasskey(): Promise<{ ok: boolean; error?: string }> {
  try {
    const optRes = await fetch("/api/account/passkey/register/options", { method: "POST" });
    if (!optRes.ok) return { ok: false, error: "Could not start passkey setup." };
    const options = await optRes.json();
    const regResp = await startRegistration({ optionsJSON: options });
    const verifyRes = await fetch("/api/account/passkey/register/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: regResp, deviceName: deviceGuess() }),
    });
    const d = await verifyRes.json().catch(() => ({}));
    if (!verifyRes.ok) return { ok: false, error: d.error || "Could not add passkey." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Passkey setup was cancelled, or this device doesn't support passkeys." };
  }
}
