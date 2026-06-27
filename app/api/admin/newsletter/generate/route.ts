import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createWeeklyDraft } from "@/lib/newsletter/compose";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const draft = await createWeeklyDraft();
  return NextResponse.json({ ok: true, id: draft.id });
}
