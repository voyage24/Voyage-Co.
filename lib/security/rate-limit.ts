import { prisma } from "@/lib/prisma";

// Fixed-window rate limiter backed by the RateLimit table (works across the
// serverless instances Vercel spins up, unlike in-memory counters). Returns
// whether the call is allowed and, if not, how many seconds until the window
// resets. Fails OPEN on any DB error so a hiccup never locks out real users.
export async function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<{ ok: boolean; retryAfter: number }> {
  const now = new Date();
  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });
    if (!existing || existing.resetAt < now) {
      const resetAt = new Date(now.getTime() + windowMs);
      await prisma.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { ok: true, retryAfter: 0 };
    }
    if (existing.count >= max) {
      return { ok: false, retryAfter: Math.max(1, Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000)) };
    }
    await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return { ok: true, retryAfter: 0 };
  } catch {
    return { ok: true, retryAfter: 0 };
  }
}

// Clears a bucket — call after a successful login so a valid sign-in doesn't
// count against the failed-attempt limit.
export async function clearRateLimit(key: string): Promise<void> {
  try {
    await prisma.rateLimit.delete({ where: { key } });
  } catch {
    /* nothing to clear */
  }
}
