import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const CUSTOMER_COOKIE_NAME = "customer_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(token: string): string {
  const secret = process.env.SESSION_COOKIE_SECRET ?? "";
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export async function createCustomerSession(customerId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.customerSession.create({ data: { tokenHash, customerId, expiresAt } });
  return { token, expiresAt };
}

export async function destroyCustomerSession(token: string | undefined) {
  if (!token) return;
  await prisma.customerSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}

export async function getCustomer(token: string | undefined) {
  if (!token) return null;
  const session = await prisma.customerSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { customer: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.customerSession.delete({ where: { id: session.id } });
    return null;
  }
  return session.customer;
}

// Convenience for server components / route handlers.
export async function getCurrentCustomer() {
  const token = cookies().get(CUSTOMER_COOKIE_NAME)?.value;
  return getCustomer(token);
}

export const CUSTOMER_SESSION_TTL_MS = SESSION_TTL_MS;
