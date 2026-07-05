import crypto from "crypto";
import type { Customer } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

export const REFERRAL_POINTS_DEFAULT = 500;

// The reward (points) for a successful referral, editable in admin Settings.
export async function getReferralPoints(): Promise<number> {
  try {
    const s = await getSiteSettings();
    const n = parseInt(s["referral.points"], 10);
    return Number.isFinite(n) && n >= 0 ? n : REFERRAL_POINTS_DEFAULT;
  } catch {
    return REFERRAL_POINTS_DEFAULT;
  }
}

// Short, unambiguous code (no easily-confused characters).
function makeCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[crypto.randomInt(alphabet.length)];
  return s;
}

// Returns the member's referral code, generating and saving one on first use.
export async function ensureReferralCode(customer: Customer): Promise<string> {
  if (customer.referralCode) return customer.referralCode;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    try {
      const updated = await prisma.customer.update({ where: { id: customer.id }, data: { referralCode: code } });
      return updated.referralCode as string;
    } catch { /* unique collision — retry */ }
  }
  const fallback = customer.id.slice(-6).toUpperCase();
  await prisma.customer.update({ where: { id: customer.id }, data: { referralCode: fallback } }).catch(() => {});
  return fallback;
}

// Look up the referrer that owns a given code (used at signup).
export async function findReferrer(code: unknown): Promise<Customer | null> {
  if (typeof code !== "string") return null;
  const c = code.trim().toUpperCase();
  if (!c) return null;
  return prisma.customer.findUnique({ where: { referralCode: c } });
}

// Credits the referrer once, when the referred account becomes active.
export async function rewardReferralIfAny(customer: Customer): Promise<void> {
  if (!customer.referredById || customer.referralRewarded) return;
  const points = await getReferralPoints();
  try {
    await prisma.$transaction([
      prisma.customer.update({ where: { id: customer.id }, data: { referralRewarded: true } }),
      prisma.customer.update({ where: { id: customer.referredById }, data: { points: { increment: points } } }),
    ]);
  } catch (err) {
    console.error("Referral reward failed:", err);
  }
}
