import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// When the database is unreachable (e.g. Neon suspended after exhausting the
// free compute allowance), a request should fail in a few seconds rather than
// hang and tie up serverless execution time. These caps (seconds) only bite when
// the database is actually down — a healthy connection is established well within
// them, so normal traffic is unaffected. Applied by appending to the pooled URL,
// preserving whatever query params Neon/Vercel already set.
function timedDatabaseUrl(): string | undefined {
  const base = process.env.DATABASE_URL;
  if (!base) return undefined;
  try {
    const u = new URL(base);
    if (!u.searchParams.has("connect_timeout")) u.searchParams.set("connect_timeout", "5");
    if (!u.searchParams.has("pool_timeout")) u.searchParams.set("pool_timeout", "8");
    return u.toString();
  } catch {
    return base;
  }
}

const url = timedDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient(url ? { datasourceUrl: url } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
