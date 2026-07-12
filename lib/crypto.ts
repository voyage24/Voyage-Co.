import crypto from "crypto";

// AES-256-GCM encryption for sensitive fields at rest (passport numbers).
// The key is derived (scrypt) from TRAVELLER_ENC_KEY, falling back to
// SESSION_COOKIE_SECRET so the feature works with existing config. If neither is
// set, encryption is unavailable and callers must decline to store the secret.

function keyMaterial(): string | null {
  return process.env.TRAVELLER_ENC_KEY || process.env.SESSION_COOKIE_SECRET || null;
}

export function encryptionAvailable(): boolean {
  return !!keyMaterial();
}

function derivedKey(): Buffer {
  const secret = keyMaterial();
  if (!secret) throw new Error("No encryption key configured");
  // Static salt is acceptable here: the secret is high-entropy and per-deploy.
  return crypto.scryptSync(secret, "voyagesco-traveller-v1", 32);
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

// Binary variants for files (document vault). Layout: [iv(12) | tag(16) | ciphertext].
export function encryptBuffer(data: Buffer): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey(), iv);
  const enc = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]);
}

export function decryptBuffer(payload: Buffer): Buffer | null {
  try {
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const enc = payload.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]);
  } catch {
    return null;
  }
}

export function decrypt(payload: string): string | null {
  try {
    const [ivB64, tagB64, encB64] = payload.split(":");
    if (!ivB64 || !tagB64 || !encB64) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(encB64, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
