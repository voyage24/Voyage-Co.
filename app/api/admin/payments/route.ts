import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { providerFor } from "@/lib/payment-providers";

// Owner-only (see lib/admin/permissions.ts). Reports whether the secret key
// for the *currently selected* provider is set in the environment — never
// its value, just presence — so the admin can tell at a glance whether a
// provider switch is actually ready to accept payments.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const rows = await prisma.siteSetting.findMany({ where: { key: { in: ["payment.provider", "payment.publicKey"] } } });
  const provider = rows.find(r => r.key === "payment.provider")?.value ?? "";
  const publicKey = rows.find(r => r.key === "payment.publicKey")?.value ?? "";
  const secretEnvVar = providerFor(provider).secretEnvVar;
  const secretConfigured = secretEnvVar ? Boolean(process.env[secretEnvVar]?.trim()) : false;

  return NextResponse.json({ provider, publicKey, secretEnvVar, secretConfigured });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => ({}));
  const provider = typeof body?.provider === "string" ? body.provider : "";
  const publicKey = typeof body?.publicKey === "string" ? body.publicKey : "";

  await Promise.all([
    prisma.siteSetting.upsert({ where: { key: "payment.provider" }, create: { key: "payment.provider", value: provider }, update: { value: provider } }),
    prisma.siteSetting.upsert({ where: { key: "payment.publicKey" }, create: { key: "payment.publicKey", value: publicKey }, update: { value: publicKey } }),
  ]);

  revalidateTag("site-settings");
  await logAudit(admin.email, "save", "payments", null, `provider: ${provider || "none"}`);
  return NextResponse.json({ ok: true });
}
