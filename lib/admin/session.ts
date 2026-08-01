import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // auto-logout after 30 min of inactivity
const LAST_SEEN_UPDATE_THRESHOLD_MS = 60 * 1000; // don't write lastSeenAt on every single request

function hashToken(token: string): string {
  const secret = process.env.SESSION_COOKIE_SECRET ?? "";
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.adminSession.create({ data: { tokenHash, userId, expiresAt } });
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  const tokenHash = hashToken(token);
  await prisma.adminSession.deleteMany({ where: { tokenHash } });
}

export async function getSessionUser(token: string | undefined) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session) return null;
  const now = new Date();
  if (session.expiresAt < now) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }
  // Idle timeout — signed out after 30 minutes with no requests, independent
  // of the 7-day absolute session length.
  if (now.getTime() - session.lastSeenAt.getTime() > IDLE_TIMEOUT_MS) {
    await prisma.adminSession.delete({ where: { id: session.id } });
    return null;
  }
  if (now.getTime() - session.lastSeenAt.getTime() > LAST_SEEN_UPDATE_THRESHOLD_MS) {
    await prisma.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: now } }).catch(() => {});
  }
  return session.user;
}

export { SESSION_COOKIE_NAME, SESSION_TTL_MS };
