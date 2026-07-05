import { prisma } from "@/lib/prisma";

// Records an admin action. Best-effort — logging must never break the action.
export async function logAudit(
  userEmail: string,
  action: string,
  entity: string,
  entityId?: string | null,
  detail?: string | null,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { userEmail, action, entity, entityId: entityId ?? null, detail: detail ?? null },
    });
  } catch {
    /* ignore */
  }
}
