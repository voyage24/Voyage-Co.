import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { SETTING_DEFAULTS } from "@/lib/site-settings";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => ({}));
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const keys = Object.keys(SETTING_DEFAULTS);
  const entries = Object.entries(body).filter(([k]) => keys.includes(k));

  await Promise.all(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: String(value ?? "") },
        update: { value: String(value ?? "") },
      })
    )
  );

  // The theme is injected in the root layout, so refresh the cached pages.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
